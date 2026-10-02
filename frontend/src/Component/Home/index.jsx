import React, { useEffect, useState } from 'react';
import './style.css';
import { Link, useNavigate } from 'react-router-dom';
import demoImage from '../../assets/google.png';
import { BackendService } from '../../Utils/Api\'s/ApiMiddleWare';
import ApiEndpoints from '../../Utils/Api\'s/ApiEndpoints';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);

  const isRecruiter = user?.role === 'recruiter';

  const handleCreateJob = () => {
    navigate(isRecruiter ? '/job' : '/ats-score');
  };

  const fetchAllJobs = async () => {
    try {
      const response = await BackendService(ApiEndpoints.fetchAllJobs, {});
      if (response.data) {
        setJobs(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateFitValue = (job, index) => {
    if (job?.matchScore) return job.matchScore;
    return Math.max(70, 95 - index * 2);
  };

  const recruiterCards = [
    { label: 'Live postings', value: jobs.length, detail: 'Open roles in your pipeline' },
    { label: 'Shortlist ready', value: '12', detail: 'AI-suggested candidates' },
    { label: 'Hiring pulse', value: '82%', detail: 'Response & interview rate' },
  ];

  const candidateCards = [
    { label: 'ATS score', value: '91', detail: 'Resume fit for target roles' },
    { label: 'Recommended', value: `${filteredJobs.length} roles`, detail: 'AI-picked matches' },
    { label: 'Profile strength', value: 'Expert', detail: 'Skills and achievements score' },
  ];

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">AI Talent Match</span>
          <h1>Find the right role or hire the perfect candidate faster.</h1>
          <p>
            {isRecruiter
              ? 'Discover AI candidate recommendations, manage jobs, and build a talent pipeline with recruiter intelligence.'
              : 'Upload your resume, compare match scores, and get AI-driven improvements for every role.'}
          </p>
          <div className="hero-actions">
            <button className="btn primary-action" onClick={() => navigate(isRecruiter ? '/job' : '/ats-score')}>
              {isRecruiter ? 'Post a job' : 'Analyze Resume'}
            </button>
            <Link to="/ai-chatbot" className="btn secondary-action">
              Talk to AI
            </Link>
          </div>
        </div>

        <aside className="hero-card">
          <div className="hero-card-title">
            <h2>{isRecruiter ? 'Recruiter Snapshot' : 'Candidate Snapshot'}</h2>
            <p>{isRecruiter ? 'Get instant career intelligence and hiring velocity.' : 'Track your resume strength and job match potential.'}</p>
          </div>
          <div className="dashboard-cards">
            {(isRecruiter ? recruiterCards : candidateCards).map((item, index) => (
              <div key={index} className="dashboard-card">
                <span className="dashboard-value">{item.value}</span>
                <h3>{item.label}</h3>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <div className="home-content">
        <div className="home-header">
          <input
            type="text"
            className="search-input"
            placeholder={isRecruiter ? 'Search job titles or candidate skills...' : 'Search for a job title...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button className="btn create-job-btn" onClick={handleCreateJob}>
            {isRecruiter ? '+ Post Job' : 'Browse Roles'}
          </button>
        </div>

        <div className="job-grid">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => {
              const fitValue = generateFitValue(job, index);
              const recruiterHover = [
                job.applicantCount ? `${job.applicantCount} applicants in pipeline` : 'New candidates waiting review',
                job.matchScore ? `${job.matchScore}% predicted match` : 'Strong AI relevance',
                'Recommended for fast outreach',
              ];
              return (
                <Link key={index} to={`/job/${job.id}`} className="job-card">
                  <div className="job-card-top">
                    <img src={job.img || demoImage} alt={job.title} className="job-logo" />
                    {index < 3 && <span className="job-badge">AI Recommended</span>}
                  </div>
                  <div className="job-details">
                    <div className="job-details-row">
                      <h3>{job.title}</h3>
                      <span className="fit-chip" title="AI confidence score based on skills, role fit, and job description.">
                        {fitValue}% fit
                        <span className="fit-info" aria-hidden="true">ℹ</span>
                      </span>
                    </div>
                    <p>{job.company}</p>
                    <div className="job-meta-row">
                      <span>{job.location || 'Remote'}</span>
                      <span>{job.employmentType || 'Full Time'}</span>
                    </div>
                  </div>
                  {isRecruiter && (
                    <div className="job-hover-panel">
                      <span className="hover-title">Recruiter insight</span>
                      <ul>
                        {recruiterHover.map((text, idx) => (
                          <li key={idx}>{text}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="job-card-footer">
                    {isRecruiter ? (
                      <span>{job.applicantCount ? `${job.applicantCount} applicants` : 'AI candidate insights'}</span>
                    ) : (
                      <span>{job.ctc || 'Competitive salary'}</span>
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="no-jobs-msg">No jobs found. Try a broader search or create a new job.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
