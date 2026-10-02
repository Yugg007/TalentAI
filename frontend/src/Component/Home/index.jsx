import { createElement, useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  MapPin,
  Search,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './style.css';
import { BackendService } from '../../Utils/Api\'s/ApiMiddleWare';
import ApiEndpoints from '../../Utils/Api\'s/ApiEndpoints';
import { useAuth } from '../../context/AuthContext';

const candidateActions = [
  {
    icon: BriefcaseBusiness,
    number: '01',
    title: 'Explore the market',
    text: 'Find roles that fit the work you want to do next.',
    to: '/job',
    tone: 'mint',
  },
  {
    icon: FileText,
    number: '02',
    title: 'Check your fit',
    text: 'Compare your resume with a role before applying.',
    to: '/ats-score',
    tone: 'butter',
  },
  {
    icon: CalendarDays,
    number: '03',
    title: 'Prepare to meet',
    text: 'Practice and schedule your next interview.',
    to: '/mock-interview',
    tone: 'rose',
  },
];

const recruiterActions = [
  {
    icon: BriefcaseBusiness,
    number: '01',
    title: 'Open a role',
    text: 'Publish a clear brief for the people you need.',
    to: '/job',
    tone: 'mint',
  },
  {
    icon: UsersRound,
    number: '02',
    title: 'Build your network',
    text: 'Find and connect with people in your pipeline.',
    to: '/connection',
    tone: 'butter',
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'Work with your copilot',
    text: 'Shape a role brief or think through your search.',
    to: '/ai-chatbot',
    tone: 'rose',
  },
];

const Home = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const isRecruiter = user?.role === 'recruiter';

  const fetchAllJobs = async () => {
    setIsLoading(true);
    setLoadFailed(false);
    try {
      const response = await BackendService(ApiEndpoints.fetchAllJobs, {});
      setJobs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredJobs = jobs.filter((job) => {
    const searchableText = [job.title, job.company, job.companyName, job.location]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return searchableText.includes(normalizedSearch);
  });

  const actions = isRecruiter ? recruiterActions : candidateActions;

  return (
    <div className="home-page">
      <section className="home-intro">
        <div className="intro-copy">
          <p className="home-overline"><span /> {isRecruiter ? 'TALENTAI / HIRING WORKSPACE' : 'TALENTAI / CAREER WORKSPACE'}</p>
          <h1>
            {isRecruiter ? <>Meet the people<br />behind the <em>potential.</em></> : <>Find work that<br />fits <em>who you are.</em></>}
          </h1>
          <p className="intro-description">
            {isRecruiter
              ? 'Bring role discovery, candidate conversations, and hiring preparation into one clear workflow.'
              : 'Keep role discovery, resume fit, and interview preparation in one thoughtful workspace.'}
          </p>
          <div className="intro-actions">
            <Link className="button-primary" to={isRecruiter ? '/job' : '/job'}>
              {isRecruiter ? 'Post a role' : 'Explore roles'}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button-quiet" to={isRecruiter ? '/connection' : '/ats-score'}>
              {isRecruiter ? 'Open talent pool' : 'Check resume fit'}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <aside className="path-panel" aria-label="A simple job-search flow">
          <div className="path-panel-head">
            <div>
              <span className="path-kicker">A better next step</span>
              <h2>{isRecruiter ? 'Build your hiring loop' : 'Move with intention'}</h2>
            </div>
            <Sparkles size={19} aria-hidden="true" />
          </div>
          <div className="path-steps">
            {(isRecruiter ? ['Write a role with clarity', 'Meet relevant candidates', 'Keep the conversation moving'] : ['Discover roles worth your time', 'Understand where you fit', 'Show up ready to interview']).map((step, index) => (
              <div className="path-step" key={step}>
                <span className={`path-step-index${index === 0 ? ' is-current' : ''}`}>{String(index + 1).padStart(2, '0')}</span>
                <p>{step}</p>
                {index < 2 && <span className="path-step-line" aria-hidden="true" />}
              </div>
            ))}
          </div>
          <p className="path-panel-foot">One step at a time. Your search stays yours.</p>
        </aside>
      </section>

      <section className="home-search-section" aria-label="Search jobs">
        <div className="search-field">
          <Search size={19} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search roles, companies, or locations"
            placeholder="Try a role, company, or location"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm && (
            <button type="button" className="clear-search" onClick={() => setSearchTerm('')}>Clear</button>
          )}
        </div>
        <p className="search-count">
          {isLoading ? 'Looking across open roles…' : `${filteredJobs.length} ${filteredJobs.length === 1 ? 'role' : 'roles'} to explore`}
        </p>
      </section>

      <section className="action-section" aria-labelledby="action-title">
        <div className="section-heading-row">
          <div>
            <p className="section-overline">THE TALENTAI LOOP</p>
            <h2 id="action-title">A little progress goes a long way.</h2>
          </div>
          <Link className="copilot-link" to="/ai-chatbot">
            <Sparkles size={16} aria-hidden="true" /> Talk it through <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="action-grid">
          {actions.map((action) => (
            <Link to={action.to} className="action-card" key={action.title}>
              <div className={`action-icon ${action.tone}`}>
                {createElement(action.icon, { size: 19, strokeWidth: 1.8, 'aria-hidden': true })}
              </div>
              <span className="action-number">{action.number}</span>
              <h3>{action.title}</h3>
              <p>{action.text}</p>
              <span className="action-arrow" aria-hidden="true"><ArrowUpRight size={17} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="roles-section" aria-labelledby="roles-title">
        <div className="section-heading-row roles-heading-row">
          <div>
            <p className="section-overline">OPEN NOW <span>{String(filteredJobs.length).padStart(2, '0')}</span></p>
            <h2 id="roles-title">Roles to take a closer look at.</h2>
            <p className="section-description">Search by title, company, or location. Open a role to see the full brief.</p>
          </div>
          <Link className="all-roles-link" to="/job">View all roles <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>

        {isLoading ? (
          <div className="roles-state" role="status">Loading open roles…</div>
        ) : loadFailed ? (
          <div className="roles-state roles-error" role="alert">
            <p>We couldn’t load roles just now.</p>
            <button type="button" onClick={fetchAllJobs}>Try again</button>
          </div>
        ) : filteredJobs.length ? (
          <div className="role-list">
            {filteredJobs.slice(0, 4).map((job, index) => {
              const title = job.title || 'Untitled role';
              const company = job.company || job.companyName || 'Company not listed';
              const jobId = job.id || job.jobId;
              const hasMatchScore = job.matchScore !== undefined && job.matchScore !== null && job.matchScore !== '';
              const matchScore = Number(job.matchScore);

              return (
                <Link className="role-row" to={jobId ? `/job/${jobId}` : '/job'} key={jobId || `${title}-${index}`}>
                  <span className={`company-monogram monogram-${index % 4}`} aria-hidden="true">{company.charAt(0).toUpperCase()}</span>
                  <span className="role-primary">
                    <strong>{title}</strong>
                    <span>{company}</span>
                  </span>
                  <span className="role-location"><MapPin size={14} aria-hidden="true" />{job.location || 'Location flexible'}</span>
                  <span className="role-type">{job.employmentType || 'Full time'}</span>
                  <span className={hasMatchScore && Number.isFinite(matchScore) ? 'match-label has-score' : 'match-label'}>
                    {hasMatchScore && Number.isFinite(matchScore) ? `${Math.round(matchScore)}% match` : 'View role'}
                  </span>
                  <ArrowUpRight className="role-open-icon" size={17} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="roles-state">
            <BriefcaseBusiness size={21} aria-hidden="true" />
            <p>{searchTerm ? 'No roles match that search. Try a different title or location.' : 'No open roles are available yet. Check back soon.'}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
