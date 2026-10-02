import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './style.css';

import { BackendService } from '../../Utils/Api\'s/ApiMiddleWare';
import ApiEndpoints from '../../Utils/Api\'s/ApiEndpoints';
import demoImage from '../../assets/google.png';
import CountdownRedirect from '../Model/CountdownRedirect';
import { downloadAtsPdf } from '../../Utils/DownloadAtsPdf';

const Job = () => {
  const { id } = useParams();
  return id ? <JobDetail jobId={id} /> : <CreateJob />;
};

function JobDetail({ jobId }) {
  const [job, setJob] = useState(null);
  const [file, setFile] = useState(null);
  const [jobFetchFailed, setJobFetchFailed] = useState(false);

  const skills = job?.skills?.split(',').map((skill) => skill.trim()).filter(Boolean) || [];
  const aiFitScore = job?.matchScore || Math.max(72, 96 - (skills.length * 2));
  const strengths = [
    'Fast-growing hiring pipeline',
    'Competitive compensation range',
    'Collaborative product and engineering team',
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF resume.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const checkAtsScore = async () => {
    if (!file) {
      toast.error('Please upload your resume before generating the ATS score.');
      return;
    }

    if (!job) {
      toast.error('Job details are still loading. Please try again.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('titleText', JSON.stringify(job));
      formData.append('prompt', 'I have provided job description and resume. Please provide me ats score. Also, provide suggestions to improve my resume to get selected for the job. Be very specific in your suggestions.');
      await downloadAtsPdf(formData, job.title || 'application');
    } catch (error) {
      toast.error('Unable to generate ATS report. Please try again later.');
      console.error(error);
    }
  };

  const fetchJobDetails = async () => {
    try {
      const body = { id: jobId };
      const response = await BackendService(ApiEndpoints.fetchJobById, body);
      if (response.data) {
        setJob(response.data);
      } else {
        setJobFetchFailed(true);
        console.error('Failed to fetch job details:', response);
      }
    } catch (error) {
      setJobFetchFailed(true);
      console.error('Error fetching job details:', error);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  if (jobFetchFailed) {
    return (
      <CountdownRedirect message="No Job Found." redirectUrl="/" />
    );
  }

  return (
    <>
      {job ? (
        <div className="job-detail-container">
          <div className="job-detail-grid">
            <section className="job-card-panel">
              <div className="job-card-header">
                <img src={demoImage} alt="Company Logo" className="job-logo" />
                <div className="job-header-copy">
                  <span className="job-badge-pill">AI Match</span>
                  <h1 className="job-title">{job?.title}</h1>
                  <p className="company-name">{job?.company}</p>
                  <div className="job-meta-chips">
                    <span>{job?.location || 'Remote'}</span>
                    <span>{job?.employmentType || 'Full Time'}</span>
                    <span>{job?.experience || 'N/A'} yrs</span>
                  </div>
                </div>
              </div>

              <div className="job-score-card">
                <div className="score-label">Predicted fit</div>
                <div className="score-value">{aiFitScore}%</div>
                <p className="score-copy">AI estimates how well your resume matches this role based on skills and experience.</p>
              </div>

              <div className="job-info-card">
                <h2>Role at a glance</h2>
                <ul>
                  <li><strong>Compensation:</strong> {job?.ctc || 'Not available'}</li>
                  <li><strong>Location:</strong> {job?.location || 'Remote'}</li>
                  <li><strong>Type:</strong> {job?.employmentType || 'N/A'}</li>
                  <li><strong>Experience:</strong> {job?.experience || 'N/A'}</li>
                </ul>
              </div>

              <div className="reason-list">
                <h2>Why this role matters</h2>
                <ul>
                  {strengths.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            </section>

            <aside className="job-sidebar-panel">
              <div className="job-description">
                <h2>Job Description</h2>
                <p style={{ whiteSpace: 'pre-wrap' }}>{job?.jobDescription || 'No description provided.'}</p>
              </div>

              <div className="job-skills">
                <h2>Required Skills</h2>
                <ul>
                  {skills.map((skill, index) => (
                    <li key={index} className="skill-chip">{skill}</li>
                  ))}
                </ul>
              </div>

              <div className="apply-panel">
                <label htmlFor="resumeUpload" className="file-label">Upload your resume</label>
                <input id="resumeUpload" type="file" className="file-input" accept="application/pdf" onChange={handleFileChange} />
                <button className="apply-btn" onClick={checkAtsScore}>Download ATS Report</button>
                <button className="apply-btn secondary" onClick={() => toast.info('Apply link will be added soon.')}>Save & Apply later</button>
              </div>
            </aside>
          </div>
        </div>
      ) : (
        jobFetchFailed && <CountdownRedirect message="No Job Found." redirectUrl="/" />
      )}
    </>
  );
}

const CreateJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    ctcMin: '',
    ctcMax: '',
    location: '',
    experience: '',
    employmentType: '',
    jobDescription: '',
    skills: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.companyName || !formData.location || !formData.experience || !formData.employmentType || !formData.jobDescription || !formData.skills || !formData.ctcMin || !formData.ctcMax) {
      toast.error('Please fill all job details before submitting.');
      return;
    }

    const payload = {
      ...formData,
      ctc: `₹${formData.ctcMin} - ₹${formData.ctcMax}`,
      experience: `${formData.experience}+ years`,
    };

    try {
      const response = await BackendService(ApiEndpoints.createJob, payload);
      if (response.status === 200 && response.data?.id) {
        setFormData({
          title: '',
          companyName: '',
          ctcMin: '',
          ctcMax: '',
          location: '',
          experience: '',
          employmentType: '',
          jobDescription: '',
          skills: '',
        });
        toast.success('Job posted successfully!');
        navigate(`/job/${response.data.id}`);
      } else {
        console.error('Error creating job:', response);
        toast.error('Failed to create job. Please try again.');
      }
    } catch (error) {
      console.error('Create Job Error:', error);
      toast.error('Failed to create job. Please try again.');
    }
  };

  return (
    <div className="job-create-container">
      <h2 className="job-create-title">Create New Job</h2>
      <form className="job-create-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Job Title</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Senior Frontend Developer"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="companyName">Company Name</label>
          <input
            id="companyName"
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="TechNova Inc."
            required
          />
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="ctcMin">CTC Min</label>
            <input
              id="ctcMin"
              type="number"
              name="ctcMin"
              value={formData.ctcMin}
              onChange={handleChange}
              placeholder="50"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ctcMax">CTC Max</label>
            <input
              id="ctcMax"
              type="number"
              name="ctcMax"
              value={formData.ctcMax}
              onChange={handleChange}
              placeholder="80"
              required
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="New Delhi"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience">Experience</label>
            <input
              id="experience"
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="3"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="employmentType">Employment Type</label>
          <input
            id="employmentType"
            type="text"
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
            placeholder="Full Time"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="skills">Required Skills</label>
          <input
            id="skills"
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="React, Node, Java, Agile"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="jobDescription">Job Description</label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            rows="6"
            value={formData.jobDescription}
            onChange={handleChange}
            placeholder="Enter the full job description here..."
            required
          />
        </div>

        <button type="submit" className="submit-btn">Post Job</button>
      </form>
    </div>
  );
};

export default Job;
