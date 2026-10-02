import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  MessageCircle,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  applicationStages,
  getApplications,
  removeApplication,
  setApplicationStage,
} from "../../Utils/ApplicationsStore";
import "./style.css";

const stageOrder = ["saved", "applied", "conversation", "interview", "offer"];
const filters = [
  { value: "all", label: "All roles" },
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "conversation", label: "In conversation" },
  { value: "interview", label: "Interviewing" },
  { value: "offer", label: "Offers" },
  { value: "closed", label: "Closed" },
];

const Applications = () => {
  const { user } = useAuth();
  const identity = user?.username || user?.userId || "candidate";
  const [applications, setApplications] = useState(() => getApplications(identity));
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    setApplications(getApplications(identity));
  }, [identity]);

  const activeApplications = applications.filter((application) => application.stage !== "closed");
  const interviewCount = applications.filter((application) => application.stage === "interview").length;
  const offerCount = applications.filter((application) => application.stage === "offer").length;
  const visibleApplications = applications.filter((application) =>
    activeFilter === "all" ? true : application.stage === activeFilter
  );

  const handleStageChange = (roleId, stage) => {
    setApplications(setApplicationStage(roleId, stage, identity));
  };

  const handleRemove = (roleId) => {
    setApplications(removeApplication(roleId, identity));
  };

  return (
    <main className="applications-page">
      <header className="applications-heading">
        <div>
          <p className="section-overline">YOUR SEARCH / APPLICATIONS</p>
          <h1>Keep the next step in view.</h1>
          <p className="applications-subtitle">
            Follow each role from saved to interview, and pick up preparation where it matters.
          </p>
        </div>
        <Link className="button-primary" to="/job">
          Find a role <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </header>

      <div className="tracker-notice" role="note">
        <span className="tracker-notice-dot" />
        <p>Prototype tracker — changes are saved in this browser and are not synced to an account yet.</p>
      </div>

      <section className="tracker-metrics" aria-label="Application summary">
        <div className="tracker-metric">
          <span>ACTIVE ROLES</span>
          <strong>{activeApplications.length}</strong>
        </div>
        <div className="tracker-metric">
          <span>INTERVIEWS</span>
          <strong>{interviewCount}</strong>
        </div>
        <div className="tracker-metric">
          <span>OFFERS</span>
          <strong>{offerCount}</strong>
        </div>
        <div className="tracker-progress-copy">
          <span>YOUR APPLICATION FLOW</span>
          <div className="tracker-flow" aria-label="Saved, applied, conversation, interview, offer">
            {stageOrder.map((stage, index) => (
              <span className={`tracker-flow-step flow-${stage}`} key={stage}>
                {index > 0 && <i aria-hidden="true" />}
                <b>{applicationStages.find((item) => item.value === stage)?.label}</b>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="tracker-list-section" aria-labelledby="tracker-list-title">
        <div className="tracker-list-heading">
          <div>
            <p className="section-overline">YOUR PIPELINE</p>
            <h2 id="tracker-list-title">Applications</h2>
          </div>
          <span className="tracker-total">{applications.length} tracked</span>
        </div>

        <div className="tracker-filters" role="group" aria-label="Filter applications by stage">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter.value}
              className={activeFilter === filter.value ? "tracker-filter is-active" : "tracker-filter"}
              aria-pressed={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
              {filter.value === "all" && <span>{applications.length}</span>}
            </button>
          ))}
        </div>

        {visibleApplications.length ? (
          <div className="application-list">
            {visibleApplications.map((application) => {
              const currentStage = applicationStages.find((stage) => stage.value === application.stage);
              const stageIndex = stageOrder.indexOf(application.stage);
              const date = new Date(application.updatedAt || application.trackedAt);
              const formattedDate = Number.isNaN(date.getTime())
                ? ""
                : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);

              return (
                <article className="application-row" key={application.roleId}>
                  <span className="application-company-mark" aria-hidden="true">
                    {application.company.charAt(0).toUpperCase()}
                  </span>
                  <div className="application-role-copy">
                    <Link to={`/job/${application.roleId}`} className="application-role-title">
                      {application.title}
                    </Link>
                    <span>{application.company}</span>
                    <small>{application.location} · {application.employmentType}</small>
                  </div>
                  <div className="application-stage-wrap">
                    <label htmlFor={`stage-${application.roleId}`}>Stage</label>
                    <select
                      id={`stage-${application.roleId}`}
                      value={application.stage}
                      onChange={(event) => handleStageChange(application.roleId, event.target.value)}
                    >
                      {applicationStages.map((stage) => (
                        <option key={stage.value} value={stage.value}>{stage.label}</option>
                      ))}
                    </select>
                    <small>{currentStage?.label}{formattedDate ? ` · ${formattedDate}` : ""}</small>
                  </div>
                  <div className="application-step-indicator" aria-label={currentStage?.label || "Saved"}>
                    {stageOrder.slice(0, 4).map((stage, index) => (
                      <span
                        key={stage}
                        className={index <= Math.max(stageIndex, 0) ? "step-dot is-complete" : "step-dot"}
                      />
                    ))}
                  </div>
                  <div className="application-actions">
                    <Link to="/ats-score" state={{ role: application }} aria-label={`Check resume fit for ${application.title}`} title="Check resume fit">
                      <FileText size={16} />
                    </Link>
                    <Link to="/mock-interview" state={{ role: application }} aria-label={`Prepare for ${application.title}`} title="Prepare for interview">
                      <CalendarDays size={16} />
                    </Link>
                    <Link to="/connection" aria-label={`Open network for ${application.title}`} title="Open network">
                      <MessageCircle size={16} />
                    </Link>
                    <button
                      type="button"
                      aria-label={`Remove ${application.title} from tracker`}
                      title="Remove from tracker"
                      onClick={() => handleRemove(application.roleId)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <MoreHorizontal className="application-row-more" size={18} aria-hidden="true" />
                </article>
              );
            })}
          </div>
        ) : (
          <div className="tracker-empty-state">
            <span className="tracker-empty-icon"><BriefcaseBusiness size={21} /></span>
            <h3>{applications.length ? "No roles in this stage" : "Your next role starts here"}</h3>
            <p>{applications.length ? "Choose another stage to see more of your pipeline." : "Save a role to keep its fit review and interview prep close at hand."}</p>
            {!applications.length && (
              <Link className="button-primary" to="/job">Explore open roles <ArrowRight size={16} /></Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default Applications;