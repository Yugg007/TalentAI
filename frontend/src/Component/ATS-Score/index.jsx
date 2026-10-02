import React, { useState, useEffect, useRef } from "react";
import { Loader2, Upload, Plus, X, CheckCircle2 } from "lucide-react";
import "./style.css";
import { BackendService } from "../../Utils/Api's/ApiMiddleWare";
import { useAuth } from "../../context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import JsonViewer from "./JsonViewer"; // Import the JsonViewer component

// Reusable keyword tag component
const KeywordTag = ({ word, onRemove }) => (
  <span className="keyword-tag">
    {word}
    <button type="button" onClick={() => onRemove(word)}>
      <X size={14} />
    </button>
  </span>
);

const ATSScore = () => {
  const { user } = useAuth();
  const username = user?.username;
  const [pdfFile, setPdfFile] = useState(null);
  const [keywordsList, setKeywordsList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [result, setResult] = useState(null);
  const [prompt, setPrompt] = useState(
    "",
    // "I have provided a List of skills / keywords and a resume. Based on these, please provide an ATS score. Also, provide suggestions to improve my resume so that I can be the best fit for these skills. Be very specific.",
  );

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

  const handleAddKeyword = () => {
    const trimmed = keyword.trim();
    if (trimmed && !keywordsList.includes(trimmed)) {
      setKeywordsList([...keywordsList, trimmed]);
      setKeyword("");
    }
  };

  const handleRemoveKeyword = (wordToRemove) => {
    setKeywordsList(keywordsList.filter((word) => word !== wordToRemove));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!pdfFile) {
      return alert("Please upload a Resume Pdf file.");
    }
    if (!prompt.trim()) {
      return alert("Please provide a job description or skills/keywords.");
    }

    setAnalysisResult(null); // Reset previous results
    const newKey = uuidv4();
    idempotencyKeyRef.current = newKey;
    localStorage.setItem("active_idempotency_key", newKey);

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      // formData.append("jobDescription", keywordsList.join(", "));
      formData.append("jobDescription", prompt);
      formData.append("username", username);

      const response = await BackendService(
        "/ats/generate-score",
        formData,
        null,
      );

      if (response.data) {
        setIsAnalyzing(true);
        setTaskId(response.data.taskId);
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

  const pollTaskStatus = async (taskId) => {
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
    } catch (err) {
      // Network hiccup? Keep polling anyway.
      pollTimerRef.current = setTimeout(() => pollTaskStatus(taskId), 5000);
    }
  };

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
  }, []);

  return (
    <div className="ats-container">
      <div className="ats-card">
        <h2 className="ats-title">TalentAI ATS Analyzer</h2>

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

          {/* <div className="form-section">
            <label className="section-label">Target Skills & Keywords</label>
            <div className="keyword-input-box">
              <input
                type="text"
                placeholder="e.g. React, Java, Spring Boot"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="text-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="add-button"
              >
                <Plus size={18} /> Add
              </button>
            </div>

            <div className="keywords-list">
              {keywordsList.map((word, index) => (
                <KeywordTag
                  key={index}
                  word={word}
                  onRemove={handleRemoveKeyword}
                />
              ))}
            </div>
          </div> */}

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
                <Loader2 className="spinner" size={20} /> Analyzing with Llama
                3.1...
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
