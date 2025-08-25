import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './style.css';

import { BackendService } from '../../Utils/Api\'s/ApiMiddleWare';
import ApiEndpoints from '../../Utils/Api\'s/ApiEndpoints';
import demoImage from '../../assets/google.png';
import CountdownRedirect from '../Model/CountdownRedirect';
import { downloadAtsPdf } from '../../Utils/DownloadAtsPdf';

const Job = () => {
  const { id } = useParams();
  return (
    <>
      {
        id ? <JobDetail jobId={id} /> : <CreatJob />
      }
    </>
  );
};


function JobDetail({ jobId }) {
  const [job, setJob] = useState(null);
  const [file, setFile] = useState(null);
  const [ATSResponse, setATSResponse] = useState("");
  const [jobFetchFailed, setJobFetchFailed] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  }


  const checkAtsScore = async () => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("pdf", file);
        formData.append("titleText", JSON.stringify(job));
        formData.append("prompt", "I have provided job description and resume. Please provide me ats score. Also, provide suggestions to improve my resume to get selected for the job. Be very specific in your suggestions.");
        downloadAtsPdf(formData, job.title);
      } catch (error) {
        alert("Something went wrong. Please try again later.");
        console.error(error)
      }
    }
    else {
      alert("Please upload resume.")
    }
  }

  const fetchJobDetails = async () => {
    try {
      const body = {
        id: jobId
      }
      const response = await BackendService(ApiEndpoints.fetchJobById, body);
      if (response.data) {
        console.log(response.data);
        setJob(response.data);
      } else {
        setJobFetchFailed(true);
        //here i want to apply CountdownRedirect
        console.error("Failed to fetch job details:", response);
      }
    } catch (error) {
      setJobFetchFailed(true);
      console.error("Error fetching job details:", error);
    }
  }

  useEffect(() => {
    fetchJobDetails();
  }, [jobId])

  if (jobFetchFailed) {
    return (
      <CountdownRedirect
        message="No Job Found."
        redirectUrl="/"
      />
    );
  }

  return (
    <>
      {job ?
        <div className="job-detail-container">
          <img src={demoImage} alt="Company Logo" className="job-logo" />
          <div className="job-header">
            <div>
              <h1 className="job-title">{job?.title}</h1>
              <h3 className="company-name">{job?.company}</h3>
            </div>
          </div>

          <div className="job-info">
            <p><strong>Location:</strong> {job?.location}</p>
            <p><strong>CTC:</strong> {job?.ctc}</p>
            <p><strong>Experience:</strong> {job?.experience}</p>
            <p><strong>Employment Type:</strong> {job?.employmentType}</p>
          </div>

          <div className="job-description">
            <h2>Job Description</h2>
            <p style={{ whiteSpace: "pre-wrap", fontSize: "16px" }}>{job?.jobDescription}</p>
          </div>

          <div className="job-skills">
            <h2>Required Skills</h2>
            <ul>
              {job?.skills?.split(",")?.map((skill, index) => <li key={index} className="skill-chip">{skill}</li>)}
            </ul>
          </div>

          <div className="apply-section">
            <label for="myFile" class="file-label">Your resume</label>
            <input type='file' className='file-input' onChange={handleFileChange}></input>
            <button className='apply-btn' onClick={checkAtsScore}>Download Your ATS-Score</button>
          </div>
          <button className="apply-btn">Link to Apply</button>
        </div>
        :
        <>
          {jobFetchFailed && <CountdownRedirect
            message="No Job Found."
            redirectUrl="/"
          />}
        </>
      }
    </>
  );
}

const CreatJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    ctcMin: "",
    ctcMax: "",
    location: "",
    experience: "",
    employmentType: "",
    jobDescription: "",
    skills: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      ctc: `₹${formData.ctcMin} - ₹${formData.ctcMax}`,
      experience: `${formData.experience}+ years`
    };

    const response = await BackendService(ApiEndpoints.createJob, payload);
    if (response.status !== 200) {
      console.error("Error creating job:", response);
      alert("Failed to create job. Please try again.");
      return;
    }
    // Simulate job creation success
    setFormData({
      title: "",
      companyName: "",
      ctcMin: "",
      ctcMax: "",
      location: "",
      experience: "",
      employmentType: "",
      jobDescription: "",
      skills: ""
    });

    console.log("Job Created:", payload);
    alert("Job submitted successfully!");
    navigate("/job/" + response.data.id);
  };

  return (
    <div className="job-create-container">
      <h2 className="job-create-title">Create New Job</h2>
      <form className="job-create-form" onSubmit={handleSubmit}>
        {/* Job Title */}
        <div>
          <label>Job Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Senior Frontend Developer"
            required
          />
        </div>

        {/* Company Name */}
        <div>
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="TechNova Inc."
            required
          />
        </div>

        {/* Experience */}
        <div className="experience-input-wrapper">
          <label>Experience Required</label>
          <div className="experience-input-group">
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Years"
              required
            />
            <span className="exp-suffix">+ years</span>
          </div>
        </div>

        {/* CTC Range */}
        <div className="ctc-input-wrapper">
          <label>CTC (in LPA)</label>
          <div className="ctc-input-group">
            <span className="rupee-symbol">₹</span>
            <input
              type="number"
              name="ctcMin"
              value={formData.ctcMin}
              onChange={handleChange}
              placeholder="Min"
              required
            />
            <span className="ctc-separator">-</span>
            <span className="rupee-symbol">₹</span>
            <input
              type="number"
              name="ctcMax"
              value={formData.ctcMax}
              onChange={handleChange}
              placeholder="Max"
              required
            />
          </div>
        </div>

        {/* Employment Type */}
        <div>
          <label>Employment Type</label>
          <select
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select Employment Type</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Work From Home">Work From Home</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Bengaluru, India"
            required
          />
        </div>

        {/* Job Description */}
        <div className="textarea-full">
          <label>Job Description</label>
          <textarea
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            placeholder="We are looking for a skilled frontend developer..."
            rows="5"
            required
          ></textarea>
        </div>

        {/* Skills */}
        <div className="skills-full">
          <label>Skills</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="React.js, HTML5, CSS3, JavaScript, REST APIs"
            required
          />
        </div>

        {/* Submit */}
        <div className="submit-full">
          <button type="submit" className="job-submit-btn" onClick={handleSubmit}>
            Create Job
          </button>
        </div>
      </form>
    </div>
  );
};

export default Job;
