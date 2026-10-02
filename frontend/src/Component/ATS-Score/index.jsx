import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  FileText,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { BackendService } from "../../Utils/Api's/ApiMiddleWare";
import { useAuth } from "../../context/AuthContext";
import JsonViewer from "./JsonViewer";
import "./style.css";

const MAX_RESUME_SIZE = 10 * 1024 * 1024;
const POLL_INTERVAL = 3000;
const ACTIVE_TASK_STORAGE_KEY = "active_task_id";

const makeRolePrompt = (role) => {
  if (!role) return "";

  return [
    role.title ? `Role: ${role.title}` : "",
    role.company ? `Company: ${role.company}` : "",
    role.jobDescription ? `Job description:\n${role.jobDescription}` : "",
    role.skills ? `Required skills: ${role.skills}` : "",
  ].filter(Boolean).join("\n\n");
};

const getAnalysisResult = (task) => {
  const result = task?.result?.ats_result ?? task?.result ?? task?.content;
  if (typeof result !== "string") return result;

  try {
    return JSON.parse(result);
  } catch {
    return { summary: result };
  }
};

const getErrorMessage = (error) => {
  const responseData = error?.response?.data;
  if (typeof responseData === "string" && responseData.trim()) return responseData;
  return responseData?.message || error?.message || "The request could not be completed.";
};

const formatPercent = (value) => {
  const percent = Number(value);
  return Number.isFinite(percent) ? `${Math.round(percent)}%` : "—";
};

const ATSScore = () => {
  const { user } = useAuth();
  const location = useLocation();
  const linkedRole = location.state?.role;
  const username = user?.username;
  const initialPrompt = makeRolePrompt(linkedRole);
  const [pdfFile, setPdfFile] = useState(null);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [taskState, setTaskState] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showRawResult, setShowRawResult] = useState(false);
  const fileInputRef = useRef(null);
  const pollTimerRef = useRef(null);
  const activePollRef = useRef(null);

  const clearSavedTask = useCallback(() => {
    localStorage.removeItem(ACTIVE_TASK_STORAGE_KEY);
    activePollRef.current = null;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollTaskStatus = useCallback(async (activeTaskId) => {
    if (!activeTaskId || activePollRef.current === activeTaskId) return;
    activePollRef.current = activeTaskId;

    let shouldContinue = true;
    let nextDelay = POLL_INTERVAL;

    try {
      const response = await BackendService(`/ats/summary/${encodeURIComponent(activeTaskId)}`, {});
      const task = response.data;
      const status = String(task?.status || "").toUpperCase();

      if (status === "COMPLETED") {
        const completedResult = getAnalysisResult(task);
        setResult(completedResult);
        setTaskState("complete");
        setErrorMessage("");
        clearSavedTask();
        shouldContinue = false;
      } else if (status === "FAILED") {
        setTaskState("retrying");
        setErrorMessage(task?.error || task?.message || "The analysis attempt failed. The worker will retry this task.");
        nextDelay = 5000;
      } else if (status === "PENDING" || status === "PROCESSING") {
        setTaskState(status === "PENDING" ? "queued" : "processing");
        setErrorMessage("");
      } else {
        setTaskState("connection");
        setErrorMessage("The task status is unavailable. Retrying the status check.");
        nextDelay = 5000;
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        setTaskState("error");
        setErrorMessage("This analysis task is no longer available. Start a new review.");
        clearSavedTask();
        shouldContinue = false;
      } else {
        setTaskState("connection");
        setErrorMessage("Connection to the analysis service was interrupted. Retrying automatically.");
        nextDelay = 5000;
      }
    } finally {
      activePollRef.current = null;
    }

    if (shouldContinue) {
      pollTimerRef.current = setTimeout(() => pollTaskStatus(activeTaskId), nextDelay);
    }
  }, [clearSavedTask]);

  useEffect(() => {
    const savedTaskId = localStorage.getItem(ACTIVE_TASK_STORAGE_KEY);
    if (savedTaskId) {
      setTaskState("processing");
      pollTaskStatus(savedTaskId);
    }

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [pollTaskStatus]);

  const selectResume = (file) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setErrorMessage("Choose a PDF resume to continue.");
      return;
    }
    if (file.size > MAX_RESUME_SIZE) {
      setErrorMessage("This PDF is larger than 10 MB. Choose a smaller file.");
      return;
    }

    setPdfFile(file);
    setResult(null);
    if (taskState === "complete") setTaskState("idle");
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!username) {
      setErrorMessage("Sign in before starting a resume fit review.");
      return;
    }
    if (!pdfFile) {
      setErrorMessage("Upload a PDF resume to continue.");
      return;
    }
    if (!prompt.trim()) {
      setErrorMessage("Add a job description or role requirements to continue.");
      return;
    }

    setResult(null);
    setTaskState("starting");
    clearSavedTask();

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("jobDescription", prompt.trim());

      const response = await BackendService("/ats/generate-score", formData, null);
      const newTaskId = response.data?.taskId;
      if (!newTaskId) throw new Error("The server did not return an analysis task ID.");

      localStorage.setItem(ACTIVE_TASK_STORAGE_KEY, newTaskId);
      setTaskState("queued");
      pollTaskStatus(newTaskId);
    } catch (error) {
      setTaskState("error");
      setErrorMessage(getErrorMessage(error));
    }
  };

  const resetReview = () => {
    clearSavedTask();
    setPdfFile(null);
    setPrompt(initialPrompt);
    setTaskState("idle");
    setResult(null);
    setErrorMessage("");
    setShowRawResult(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isRunning = ["starting", "queued", "processing", "retrying", "connection"].includes(taskState);
  const analysis = result?.ats_result ?? result;
  const overallScore = Number(analysis?.overall_fit_score);
  const scoreValue = Number.isFinite(overallScore) ? Math.min(100, Math.max(0, overallScore)) : 0;
  const requiredSkills = analysis?.matched_required_skills || [];
  const missingSkills = analysis?.missing_required_skills || [];
  const preferredSkills = analysis?.matched_preferred_skills || [];
  const recommendations = analysis?.recommendations || [];
  const strengths = analysis?.candidate_strengths || [];

  return (
    <main className="ats-container">
      <div className="ats-layout">
        <header className="ats-page-heading">
          <div>
            <p className="ats-eyebrow"><span /> TALENTAI / RESUME REVIEW</p>
            <h1 className="ats-title">See how your experience fits.</h1>
            <p className="ats-intro">
              {linkedRole
                ? `Compare your resume with ${linkedRole.title}${linkedRole.company ? ` at ${linkedRole.company}` : ""}.`
                : "Match your experience to a role and get specific next steps."}
            </p>
          </div>
          {linkedRole && (
            <div className="ats-role-context">
              <span>REVIEWING ROLE</span>
              <strong>{linkedRole.title}</strong>
              {linkedRole.company && <small>{linkedRole.company}</small>}
            </div>
          )}
        </header>

        <div className="ats-workspace">
          <section className="ats-card ats-form-card" aria-labelledby="ats-form-title">
            <div className="ats-section-heading">
              <span className="ats-step-number">01</span>
              <div>
                <h2 id="ats-form-title">Add your resume and role</h2>
                <p>Your resume is compared with the requirements you provide.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} id="ats-form">
              <div className="form-section">
                <label className="section-label" htmlFor="resume-file">Resume PDF</label>
                <div
                  className={`file-upload-wrapper${isDragging ? " is-dragging" : ""}${pdfFile ? " has-file" : ""}`}
                  onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    selectResume(event.dataTransfer.files?.[0]);
                  }}
                >
                  <input
                    ref={fileInputRef}
                    id="resume-file"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(event) => selectResume(event.target.files?.[0])}
                    className="file-input"
                    aria-describedby="resume-file-hint"
                    disabled={isRunning}
                  />
                  {pdfFile ? (
                    <>
                      <span className="file-icon file-icon-selected"><FileText size={20} /></span>
                      <span className="file-copy">
                        <strong>{pdfFile.name}</strong>
                        <small>{(pdfFile.size / (1024 * 1024)).toFixed(1)} MB · PDF ready</small>
                      </span>
                      {!isRunning && (
                        <button
                          type="button"
                          className="file-remove"
                          aria-label="Remove selected resume"
                          onClick={() => {
                            setPdfFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                        >
                          <X size={17} />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="file-icon"><Upload size={20} /></span>
                      <span className="file-copy">
                        <strong>Choose a resume or drop it here</strong>
                        <small id="resume-file-hint">PDF only · up to 10 MB</small>
                      </span>
                      <span className="browse-label">Browse</span>
                    </>
                  )}
                </div>
              </div>

              <div className="form-section">
                <label className="section-label" htmlFor="job-description">Job description</label>
                <textarea
                  id="job-description"
                  value={prompt}
                  onChange={(event) => {
                    setPrompt(event.target.value);
                    if (taskState === "complete") {
                      setResult(null);
                      setTaskState("idle");
                    }
                  }}
                  className="prompt-textarea"
                  placeholder="Paste the job description, or add the role requirements and skills."
                  rows={8}
                  maxLength={12000}
                  disabled={isRunning}
                  required
                />
                <div className="textarea-meta">
                  <span>Include skills and responsibilities for a more useful comparison.</span>
                  <span>{prompt.length.toLocaleString()} / 12,000</span>
                </div>
              </div>

              {errorMessage && (
                <div className={`ats-alert${taskState === "retrying" || taskState === "connection" ? " is-warning" : ""}`} role="status">
                  <AlertCircle size={18} aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button type="submit" className="submit-button" disabled={isRunning}>
                {isRunning ? (
                  <><LoaderCircle className="spinner" size={18} /> Analysis in progress</>
                ) : taskState === "error" ? (
                  <><RotateCcw size={17} /> Try again</>
                ) : (
                  <><Sparkles size={17} /> Compare my resume <ArrowUpRight size={17} /></>
                )}
              </button>
            </form>
          </section>

          <aside className="ats-process-panel" aria-label="Review status">
            <div className="ats-process-topline">
              <span>YOUR REVIEW</span>
              <span className={`status-indicator status-${taskState}`}>
                {isRunning ? "IN PROGRESS" : taskState === "complete" ? "COMPLETE" : taskState === "error" ? "NEEDS ATTENTION" : "READY"}
              </span>
            </div>
            <h2>{isRunning ? "Building your comparison" : taskState === "complete" ? "Your report is ready" : "A clearer next step"}</h2>
            <p>
              {taskState === "queued"
                ? "Your review is in the queue. We’ll start comparing as soon as a worker is available."
                : taskState === "retrying"
                  ? "The analysis worker is retrying this task. Your review will stay attached to this page."
                  : taskState === "connection"
                    ? "We’re reconnecting to the task status endpoint. This review will resume automatically."
                    : taskState === "processing"
                      ? "Your resume and the role requirements are being analyzed together."
                      : taskState === "complete"
                        ? "Review the score, skill matches, and recommendations below."
                        : "Add a resume and role description to get a focused skill-fit report."}
            </p>
            <div className="ats-process-steps">
              <div className={taskState !== "idle" ? "is-done" : "is-current"}>
                <span>{taskState !== "idle" ? <Check size={14} /> : "1"}</span>
                <div><strong>Submit materials</strong><small>Resume and role brief</small></div>
              </div>
              <div className={isRunning || taskState === "complete" ? "is-current" : ""}>
                <span>{taskState === "complete" ? <Check size={14} /> : "2"}</span>
                <div><strong>Compare experience</strong><small>Skills and evidence</small></div>
              </div>
              <div className={taskState === "complete" ? "is-done" : ""}>
                <span>{taskState === "complete" ? <Check size={14} /> : "3"}</span>
                <div><strong>Review your report</strong><small>Fit score and next steps</small></div>
              </div>
            </div>
            <div className="ats-privacy-note">
              <FileText size={16} aria-hidden="true" />
              <span>Use a text-based PDF for the most reliable resume extraction.</span>
            </div>
          </aside>
        </div>

        {taskState === "complete" && analysis && (
          <section className="analysis-result" aria-labelledby="analysis-result-title" aria-live="polite">
            <div className="result-heading-row">
              <div>
                <p className="ats-eyebrow"><span /> MATCH REPORT</p>
                <h2 id="analysis-result-title">Your role fit at a glance</h2>
                <p>Use this as a guide to tailor your application, not as a hiring decision.</p>
              </div>
              <button type="button" className="secondary-button" onClick={resetReview}>
                <RotateCcw size={16} /> New review
              </button>
            </div>

            <div className="result-overview">
              <div className="score-panel" style={{ "--score": scoreValue }}>
                <div className="score-ring"><div><strong>{formatPercent(overallScore)}</strong><span>overall fit</span></div></div>
                <div className="score-copy">
                  <strong>{scoreValue >= 75 ? "Strong alignment" : scoreValue >= 50 ? "Some alignment" : "Room to strengthen"}</strong>
                  <span>Based on required skills, preferred skills, and experience.</span>
                </div>
              </div>
              <div className="score-metrics">
                <div><span>Required skills</span><strong>{formatPercent(analysis.required_match_percentage)}</strong></div>
                <div><span>Preferred skills</span><strong>{formatPercent(analysis.preferred_match_percentage)}</strong></div>
                <div><span>Required matched</span><strong>{requiredSkills.length} / {requiredSkills.length + missingSkills.length}</strong></div>
              </div>
            </div>

            <div className="result-detail-grid">
              <section className="result-section">
                <div className="result-section-heading"><h3>Skills you match</h3><span>{requiredSkills.length + preferredSkills.length}</span></div>
                <div className="skill-chip-list">
                  {[...requiredSkills, ...preferredSkills].length > 0
                    ? [...requiredSkills, ...preferredSkills].map((skill, index) => <span className="skill-chip skill-chip-match" key={`${skill}-${index}`}><CheckCircle2 size={14} />{skill}</span>)
                    : <p className="result-empty">No direct skill matches were identified.</p>}
                </div>
              </section>
              <section className="result-section result-section-gap">
                <div className="result-section-heading"><h3>Skills to strengthen</h3><span>{missingSkills.length}</span></div>
                <div className="skill-chip-list">
                  {missingSkills.length > 0
                    ? missingSkills.map((skill) => <span className="skill-chip skill-chip-gap" key={skill}>{skill}</span>)
                    : <p className="result-empty">No required skill gaps were identified.</p>}
                </div>
              </section>
            </div>

            {(strengths.length > 0 || recommendations.length > 0) && (
              <div className="result-detail-grid result-insights-grid">
                {strengths.length > 0 && (
                  <section className="result-section">
                    <div className="result-section-heading"><h3>Evidence-backed strengths</h3></div>
                    <ul className="insight-list">
                      {strengths.slice(0, 4).map((strength, index) => (
                        <li key={`${strength.skill || "strength"}-${index}`}>
                          <strong>{strength.skill || "Strength"}</strong>
                          <span>{strength.description || "Supported by your resume evidence."}</span>
                          {strength.supporting_metrics?.length > 0 && <small>{strength.supporting_metrics.join(" · ")}</small>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {recommendations.length > 0 && (
                  <section className="result-section">
                    <div className="result-section-heading"><h3>Recommended next steps</h3></div>
                    <ul className="insight-list">
                      {recommendations.slice(0, 5).map((recommendation, index) => (
                        <li key={`${recommendation.skill || "recommendation"}-${index}`}>
                          <strong>{recommendation.skill || "Build this skill"}</strong>
                          <span>{recommendation.suggestion || recommendation.reason}</span>
                          {recommendation.priority && <small>{recommendation.priority} priority</small>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}

            <div className="raw-result-control">
              <button type="button" onClick={() => setShowRawResult((visible) => !visible)} aria-expanded={showRawResult}>
                {showRawResult ? "Hide analysis details" : "View analysis details"}
              </button>
              {showRawResult && <JsonViewer data={analysis} />}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ATSScore;
