import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { BackendService } from "../../Utils/Api's/ApiMiddleWare";
import ApiEndpoints from "../../Utils/Api's/ApiEndpoints";
import "./profile-style.css";

const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_RESUME_SIZE_MB = 5;

const parseSkills = (value) =>
  (value || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

const ProfileSection = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    skills: user?.skills || "",
    education: user?.education || "",
    description: user?.description || "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Snapshot taken when edit mode opens, used to know if there's
  // anything worth saving and to warn before discarding changes.
  const editSnapshotRef = useRef(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ---------------------------------------------------------------------
  // Skills: stored as a comma-separated string (same shape the backend
  // already expects) but edited as chips for a much faster scan/edit.
  // ---------------------------------------------------------------------
  const skillList = parseSkills(formData.skills);

  const addSkillFromInput = () => {
    const next = skillInput.trim().replace(/,+$/, "");
    if (!next) return;

    const alreadyExists = skillList.some(
      (skill) => skill.toLowerCase() === next.toLowerCase()
    );

    if (!alreadyExists) {
      const updated = [...skillList, next];
      setFormData((prev) => ({ ...prev, skills: updated.join(", ") }));
    }
    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    const updated = skillList.filter((skill) => skill !== skillToRemove);
    setFormData((prev) => ({ ...prev, skills: updated.join(", ") }));
  };

  const handleSkillInputChange = (e) => {
    const { value } = e.target;
    if (value.endsWith(",")) {
      setSkillInput(value.slice(0, -1));
      addSkillFromInput();
      return;
    }
    setSkillInput(value);
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkillFromInput();
    } else if (e.key === "Backspace" && !skillInput && skillList.length > 0) {
      removeSkill(skillList[skillList.length - 1]);
    }
  };

  // ---------------------------------------------------------------------
  // Resume upload
  // ---------------------------------------------------------------------
  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!ALLOWED_RESUME_EXTENSIONS.includes(extension)) {
      toast.error("Please upload a PDF or Word document (.pdf, .doc, .docx).");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_RESUME_SIZE_MB * 1024 * 1024) {
      toast.error(`Resume must be smaller than ${MAX_RESUME_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    setResumeFile(file);
  };

  // ---------------------------------------------------------------------
  // Edit mode lifecycle
  // ---------------------------------------------------------------------
  const handleStartEdit = () => {
    editSnapshotRef.current = { ...formData };
    setIsEditing(true);
  };

  const isDirty =
    resumeFile !== null ||
    JSON.stringify(editSnapshotRef.current) !== JSON.stringify(formData);

  const handleCancelEdit = () => {
    if (isDirty && !window.confirm("Discard your changes to this profile?")) {
      return;
    }
    if (editSnapshotRef.current) {
      setFormData(editSnapshotRef.current);
    }
    setSkillInput("");
    setResumeFile(null);
    setIsEditing(false);
  };

  useEffect(() => {
    if (!isEditing) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleCancelEdit();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, formData, resumeFile]);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      // A resume file needs multipart form data; everything else can
      // travel as plain JSON. Most axios-based clients detect FormData
      // automatically and set the right content-type header for you —
      // double check BackendService does the same in this codebase.
      // let payload;
      // if (resumeFile) {
      //   payload = new FormData();
      //   Object.entries({ ...formData, username: user.username }).forEach(
      //     ([key, value]) => payload.append(key, value)
      //   );
      //   payload.append("resume", resumeFile);
      // } else {
      //   payload = { ...formData, username: user.username };
      // }

      const payload = new FormData();

      // 1. Always append text fields and username
      Object.entries({ ...formData, username: user.username }).forEach(
        ([key, value]) => {
          // Ensure we don't append null/undefined values if not needed
          if (value !== null && value !== undefined) {
            payload.append(key, value);
          }
        }
      );

      // 2. Conditionally append the resume file if the user selected one
      if (resumeFile) {
        payload.append("resume", resumeFile);
      }

      const response = await BackendService(
        ApiEndpoints.updatePersonInfo,
        payload
      );

      if (response?.data) {
        setUser(response.data);
        toast.success("Profile updated successfully!");
        setResumeFile(null);
        setIsEditing(false);
      } else {
        toast.error("Profile update failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        skills: user.skills || "",
        education: user.education || "",
        description: user.description || "",
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="profile-card">
        <div className="profile-skeleton">
          <div className="skeleton-avatar" />
          <div className="skeleton-lines">
            <div className="skeleton-line skeleton-line-wide" />
            <div className="skeleton-line skeleton-line-narrow" />
          </div>
        </div>
      </div>
    );
  }

  const initials = (user?.firstName || user?.username || "U")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const existingResumeUrl =
    user?.resumeUrl || user?.resumes?.[0]?.resumeUrl || "";
  const existingResumeName =
    user?.resumeName || user?.resumes?.[0]?.resumeName || "Resume.pdf";

  const completionFields = [
    formData.firstName,
    formData.skills,
    formData.education,
    formData.description,
    existingResumeUrl || resumeFile,
  ];
  const profileCompletion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  const downloadResume = async () => {
  try {
    const payload = {
      resumeName : existingResumeName,
      resumeUrl : existingResumeUrl
    }
    const response = await BackendService(
      ApiEndpoints.downloadResume,
      payload,
      'application/json',
      {
        responseType: 'blob'
      }
    );
    if (response?.data) {
      const blob = new Blob([response.data], {
        type: 'application/pdf'
      });

      const resumeUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = resumeUrl;
      link.download = existingResumeName || "resume.pdf";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(resumeUrl);
    }
  
  } catch (error) {
    console.error("Failed to download resume:", error);
  }
};

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>

        <div className="profile-heading">
          <div className="profile-heading-row">
            <h2 className="profile-name">{user?.firstName || user?.username}</h2>
            <span className="profile-status">Open to work</span>
          </div>
          <p className="profile-role">Candidate profile</p>
          <p className="profile-email">{user?.email}</p>
        </div>

        <div
          className="completion-ring"
          style={{ "--pct": profileCompletion }}
          role="img"
          aria-label={`Profile ${profileCompletion} percent complete`}
        >
          <div className="completion-ring-inner">
            <strong>{profileCompletion}%</strong>
            <span>complete</span>
          </div>
        </div>
      </div>

      <div className="profile-stat-line">
        <span>{skillList.length} skill{skillList.length === 1 ? "" : "s"}</span>
        <span className="stat-divider" />
        <span>Education {formData.education ? "added" : "pending"}</span>
        <span className="stat-divider" />
        <span>Summary {formData.description ? "ready" : "not started"}</span>
      </div>

      {isEditing ? (
        <div className="profile-info edit-profile-shell">
          <div className="edit-profile-header">
            <h3>Update your details</h3>
          </div>

          <div className="edit-field-grid">
            <div className="profile-field">
              <label className="profile-label" htmlFor="firstName">
                Full name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="profile-input"
                placeholder="Enter your full name"
              />
            </div>

            <div className="profile-field">
              <label className="profile-label" htmlFor="education">
                Education
              </label>
              <input
                id="education"
                name="education"
                type="text"
                value={formData.education}
                onChange={handleChange}
                className="profile-input"
                placeholder="Degree, institution, year"
              />
            </div>
          </div>

          <div className="profile-field">
            <label className="profile-label" htmlFor="skillInput">
              Skills
            </label>
            <div className="skill-editor">
              {skillList.map((skill) => (
                <span key={skill} className="skill-chip">
                  {skill}
                  <button
                    type="button"
                    className="skill-chip-remove"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="skillInput"
                type="text"
                value={skillInput}
                onChange={handleSkillInputChange}
                onKeyDown={handleSkillInputKeyDown}
                onBlur={addSkillFromInput}
                className="skill-editor-input"
                placeholder={
                  skillList.length ? "Add another skill" : "e.g. Java, Kafka, AWS"
                }
              />
            </div>
            <p className="field-hint">Press Enter or comma to add a skill.</p>
          </div>

          <div className="resume-upload-panel">
            <div className="resume-upload-header">
              <div>
                <label className="profile-label">Resume</label>
                <p className="resume-helper-text">
                  Upload your latest resume for recruiters.
                </p>
              </div>

              {existingResumeUrl && (
                <a
                  className="resume-link"
                  href={existingResumeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View current resume
                </a>
              )}
            </div>

            <div className="resume-upload-box">
              <div className="resume-file-meta">
                <span className="resume-file-badge">PDF</span>
                <div>
                  <strong>
                    {resumeFile
                      ? resumeFile.name
                      : existingResumeName || "No resume uploaded yet"}
                  </strong>
                  <small>
                    {resumeFile
                      ? "Ready to upload"
                      : existingResumeUrl
                      ? "Uploaded and available"
                      : "No resume uploaded yet"}
                  </small>
                </div>
              </div>

              <label className="upload-btn">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                />
                {resumeFile ? "Change resume" : "Upload resume"}
              </label>
            </div>
          </div>

          <div className="profile-field profile-summary-field">
            <label className="profile-label" htmlFor="description">
              Professional summary
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="profile-textarea"
              placeholder="Write a short professional summary"
              rows="5"
            />
          </div>
        </div>
      ) : (
        <div className="profile-content">
          <section className="profile-section-block">
            <h3>Summary</h3>
            <p>
              {formData.description ||
                "Add a short professional summary to highlight your experience and strengths."}
            </p>
          </section>

          <div className="profile-split">
            <section className="profile-section-block">
              <h3>Education</h3>
              <p>{formData.education || "No education details added yet."}</p>
            </section>

            <section className="profile-section-block">
              <h3>Skills</h3>
              <div className="skill-list">
                {skillList.length > 0 ? (
                  skillList.map((skill) => (
                    <span key={skill} className="skill-tag">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="profile-empty">No skills listed yet.</span>
                )}
              </div>
            </section>
          </div>

          <section className="profile-section-block">
            <h3>Resume</h3>
            {existingResumeUrl ? (
              <div className="resume-readonly-row">
                <span className="resume-readonly-name">{existingResumeName}</span>
                <button className="btn btn-download" onClick={downloadResume}>
                  Download
                </button>
              </div>
            ) : (
              <p>No resume uploaded yet.</p>
            )}
          </section>
        </div>
      )}

      <div className="profile-actions">
        {isEditing ? (
          <>
            <button
              className="btn btn-save"
              onClick={handleUpdate}
              disabled={loading || !isDirty}
            >
              {loading ? "Saving..." : "Save profile"}
            </button>
            <button className="btn btn-cancel" onClick={handleCancelEdit}>
              Cancel
            </button>
          </>
        ) : (
          <button className="btn btn-edit" onClick={handleStartEdit}>
            Edit profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
