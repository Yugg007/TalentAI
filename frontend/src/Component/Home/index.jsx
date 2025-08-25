import React, { useEffect, useState } from 'react';
import './style.css';
import { Link, useNavigate } from 'react-router-dom';
import demoImage from '../../assets/google.png';
import { BackendService } from '../../Utils/Api\'s/ApiMiddleWare';
import ApiEndpoints from '../../Utils/Api\'s/ApiEndpoints';
import Dashboard from './Dashboard';

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);

  const handleCreateJob = () => {
    navigate('/job');
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

  return (
    <div className="home-container">
      <Dashboard />
      <div className="home-content">
        <div className="home-header">
          <input
            type="text"
            className="search-input"
            placeholder="Search for a job title..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button className="btn create-job-btn" onClick={handleCreateJob}>
            + Create Job
          </button>
        </div>

        <div className="job-grid">
          {filteredJobs.length > 0 ? (
            filteredJobs?.filter((job) =>
              job.title.toLowerCase().includes(searchTerm.toLowerCase())
            )?.map((job, index) => (
              <Link key={index} to={`/job/${job.id}`} className="job-card">
                <img src={job.img || demoImage} alt={job.title} className="job-logo" />
                <div className="job-details">
                  <h3>{job.title}</h3>
                  <p>{job.company}</p>
                  <span>{job.location}</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="no-jobs-msg">No jobs found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
