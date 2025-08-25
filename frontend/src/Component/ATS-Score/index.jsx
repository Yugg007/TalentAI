import React, { useState } from "react";
import "./style.css";
import { downloadAtsPdf } from "../../Utils/DownloadAtsPdf.js";

//  Reusable keyword tag component
const KeywordTag = ({ word, onRemove }) => (
  <span className="keyword-tag">
    {word}
    <button type="button" onClick={() => onRemove(word)}>
      &times;
    </button>
  </span>
);

const ATSScore = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [keywordsList, setKeywordsList] = useState([]);
  const [prompt, setPrompt] = useState(
    "I have provided List of skills / keywords and resume. Based on these, please provide me ats score. Also, provide suggestions to improve my resume so that I can be the best fit for this asked skill and keywords. Be very specific in your suggestions."
  );

  /** Handle PDF Upload */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  /**  Add Keyword */
  const handleAddKeyword = () => {
    const newKeyword = keyword.trim();
    if (!newKeyword) return;

    if (keywordsList.includes(newKeyword)) {
      alert("Keyword already present.");
      return;
    }

    setKeywordsList((prev) => [...prev, newKeyword]);
    setKeyword("");
  };

  /**  Remove Keyword */
  const handleRemoveKeyword = (word) => {
    setKeywordsList((prev) => prev.filter((kw) => kw !== word));
  };

  /**  Submit ATS Form */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!pdfFile) return alert("Please upload a PDF file.");
    if (keywordsList.length === 0)
      return alert("Please enter at least one keyword.");

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("titleText", keywordsList.join(","));
      formData.append("title", "List of skills / keywords");
      formData.append("prompt", prompt);

      await downloadAtsPdf(formData, "List of skills / keywords");
    } catch (error) {
      console.error("Error downloading ATS PDF:", error);
    }
  };

  return (
    <div className="ats-container">
      <div className="ats-card">
        <h2 className="ats-title">ATS Resume Analyzer</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <label className="section-label">Upload Resume (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>

          <div className="form-section">
            <label className="section-label">Enter Skills / Keywords</label>
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
                Add
              </button>
            </div>

            <div className="keywords-list">
              {keywordsList.map((word, index) => (
                <KeywordTag
                  key={`${word}-${index}`}
                  word={word}
                  onRemove={handleRemoveKeyword}
                />
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="section-label">Your Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="prompt-textarea"
              rows={5}
            />
            <small className="prompt-hint">
              ✨ You can customize this prompt to change how ATS score and
              suggestions are generated.
            </small>
          </div>

          <button type="submit" className="submit-button">
            Download Your ATS Score
          </button>
        </form>
      </div>
    </div>
  );
};

export default ATSScore;
