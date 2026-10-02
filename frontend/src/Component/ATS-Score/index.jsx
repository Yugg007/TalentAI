import React, { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import "./style.css";
import { BackendService } from "../../Utils/Api's/ApiMiddleWare";
import { useAuth } from "../../context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import JsonViewer from "./JsonViewer"; // Import the JsonViewer component
import { useLocation } from "react-router-dom";

const ATSScore = () => {
  const { user } = useAuth();
  const location = useLocation();
  const linkedRole = location.state?.role;
  const username = user?.username;
  const [pdfFile, setPdfFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [prompt, setPrompt] = useState(() => {
    if (!linkedRole) return "";

    return [
      `Role: ${linkedRole.title}`,
      linkedRole.company ? `Company: ${linkedRole.company}` : "",
      linkedRole.jobDescription ? `Job description:\n${linkedRole.jobDescription}` : "",
      linkedRole.skills ? `Required skills: ${linkedRole.skills}` : "",
    ].filter(Boolean).join("\n\n");
  });

  const idempotencyKeyRef = useRef(null);
  const activeTaskIdRef = useRef(null);
  const pollTimerRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!pdfFile) {
      return alert("Please upload a Resume Pdf file.");
    }
    if (!prompt.trim()) {
      return alert("Please provide a job description or skills/keywords.");
    }

    setResult(null);
    const newKey = uuidv4();
    idempotencyKeyRef.current = newKey;
    localStorage.setItem("active_idempotency_key", newKey);

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("jobDescription", prompt);
      formData.append("username", username);

      const response = await BackendService(
        "/ats/generate-score",
        formData,
        null,
      );

      if (response.data) {
        setIsAnalyzing(true);
        const { taskId } = response.data;
        activeTaskIdRef.current = taskId;
        localStorage.setItem("active_task_id", taskId);
        pollTaskStatus(taskId);
      } else {
        alert("Failed to start analysis. Check your server connection.");
      }
    } catch (error) {
      console.error("Error starting analysis:", error);
      alert("An error occurred while connecting to the server.");
      clearStorage();
    }
  };

  const pollTaskStatus = useCallback(async (taskId) => {
    try {
      const response = await BackendService("/ats/summary/" + taskId);

      if (response.data && response.data.status === "COMPLETED") {
        console.log("Polling response:", response.data);
        setResult(response.data.result);
        setIsAnalyzing(false);
        // clearStorage(); // Job is done, clean up storage!
      }

      // const { status: backendStatus, data } = response.data;

      // if (backendStatus === "completed") {
      //   setResult(data);
      //   setStatus("success");
      //   clearStorage(); // Job is done, clean up storage!
      // } else if (backendStatus === "failed") {
      //   setStatus("error");
      //   clearStorage();
      // } else {
      //   // Still running, queue next poll
      //   pollTimerRef.current = setTimeout(() => pollTaskStatus(taskId), 5000);
      // }
    } catch {
      // Network hiccup? Keep polling anyway.
      pollTimerRef.current = setTimeout(() => pollTaskStatus(taskId), 5000);
    }
  }, []);

  const clearStorage = () => {
    idempotencyKeyRef.current = null;
    activeTaskIdRef.current = null;
    localStorage.removeItem("active_idempotency_key");
    localStorage.removeItem("active_task_id");
  };

  useEffect(() => {
    const savedKey = localStorage.getItem("active_idempotency_key");
    const savedTaskId = localStorage.getItem("active_task_id");

    if (savedKey && savedTaskId) {
      // Restore refs
      idempotencyKeyRef.current = savedKey;
      activeTaskIdRef.current = savedTaskId;
      // setanalysisResult(null); // Reset previous results
      setIsAnalyzing(true);
      // setStatus("processing");
      // Resume polling immediately!
      pollTaskStatus(savedTaskId);
    }

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [pollTaskStatus]);

  return (
    <div className="ats-container">
      <div className="ats-card">
        <h1 className="ats-title">Resume fit review</h1>
        <p className="ats-intro">
          {linkedRole
            ? `Compare your experience with ${linkedRole.title}${linkedRole.company ? ` at ${linkedRole.company}` : ''}.`
            : "Compare your experience with a job description and identify what to strengthen."}
        </p>

        <form onSubmit={handleSubmit} id="ats-form">
          <div className="form-section">
            <label className="section-label">Upload Resume (PDF)</label>
            <div className="file-upload-wrapper">
              <Upload className="upload-icon" size={20} />
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              <span className="file-name">
                {pdfFile ? pdfFile.name : "Click to select or drag and drop"}
              </span>
            </div>
          </div>

          <div className="form-section">
            <label className="section-label">Job Description</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="prompt-textarea"
              placeholder="Provide the job description or skills/keywords here..."
              rows={4}
            />
          </div>

          <button
            type="submit"
            className={`submit-button ${isAnalyzing ? "loading" : ""}`}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="spinner" size={20} /> Comparing your resume with the role...
              </>
            ) : (
              "Generate ATS Score"
            )}
          </button>
        </form>

        {result && <JsonViewer data={result} />}

      </div>
    </div>
  );
};

export default ATSScore;
