import { createElement, useState } from "react";
import {
  ArrowUpRight,
  ClipboardList,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  FileText,
  House,
  LogIn,
  LogOut,
  MessageCircle,
  Newspaper,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, user, handleLogout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isRecruiter = user?.role === "recruiter";
  const sections = isRecruiter
    ? [
        {
          label: "Workspace",
          items: [
            { to: "/", label: "Overview", icon: House, end: true },
            { to: "/job", label: "Post a role", icon: BriefcaseBusiness },
            { to: "/connection", label: "Talent pool", icon: UsersRound },
            { to: "/chat", label: "Messages", icon: MessageCircle },
            { to: "/mock-interview", label: "Interviews", icon: CalendarDays },
          ],
        },
        {
          label: "Explore",
          items: [
            { to: "/news", label: "Career brief", icon: Newspaper },
            { to: "/ai-chatbot", label: "AI copilot", icon: Sparkles },
          ],
        },
      ]
    : [
        {
          label: "Your search",
          items: [
            { to: "/", label: "Overview", icon: House, end: true },
            { to: "/job", label: "Find roles", icon: BriefcaseBusiness },
            { to: "/ats-score", label: "Resume fit", icon: FileText },
            { to: "/applications", label: "Applications", icon: ClipboardList },
            { to: "/mock-interview", label: "Interview prep", icon: CalendarDays },
          ],
        },
        {
          label: "Your network",
          items: [
            { to: "/connection", label: "Connections", icon: UsersRound },
            { to: "/news", label: "Career brief", icon: Newspaper },
            { to: "/ai-chatbot", label: "AI copilot", icon: MessageCircle },
          ],
        },
      ];

  if (!isLoggedIn) {
    sections[0].items = [
      { to: "/", label: "Overview", icon: House, end: true },
      { to: "/job", label: "Explore roles", icon: BriefcaseBusiness },
      { to: "/news", label: "Career brief", icon: Newspaper },
      { to: "/ai-chatbot", label: "AI copilot", icon: MessageCircle },
    ];
    sections.splice(1, 1);
  }

  const items = sections.flatMap((section) => section.items);
  const activeItem = items.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );
  const displayName = user?.name || user?.username || "Your workspace";
  const initials = displayName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <aside className="workspace-sidebar" aria-label="Main navigation">
        <Link to="/" className="brand-lockup" aria-label="TalentAI home">
          <span className="brand-glyph" aria-hidden="true">t</span>
          <span className="brand-wordmark">talent<span>ai</span></span>
        </Link>

        <div className="workspace-label">
          <span className="workspace-status" />
          <span>{isRecruiter ? "Hiring workspace" : "Career workspace"}</span>
        </div>

        <nav className="sidebar-navigation">
          {sections.map((section) => (
            <div className="navigation-group" key={section.label}>
              <p className="navigation-heading">{section.label}</p>
              <div className="navigation-items">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    aria-label={item.label}
                    title={item.label}
                    onClick={closeMenu}
                    className={({ isActive }) => `navigation-link${isActive ? " is-active" : ""}`}
                  >
                    {createElement(item.icon, { size: 18, strokeWidth: 1.8, 'aria-hidden': true })}
                    <span>{item.label}</span>
                    {location.pathname === item.to && <span className="active-indicator" aria-hidden="true" />}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="copilot-nudge">
            <div className="nudge-icon"><Sparkles size={16} aria-hidden="true" /></div>
            <p>{isRecruiter ? "Find your next great hire." : "Make every application count."}</p>
            <Link to={isRecruiter ? "/job" : "/ats-score"} aria-label={isRecruiter ? "Post a role" : "Check resume fit"}>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>

          {isLoggedIn ? (
            <div className="account-wrap">
              <button
                type="button"
                className="account-button"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((open) => !open)}
              >
                <span className="account-avatar">{initials || "T"}</span>
                <span className="account-copy">
                  <strong>{displayName}</strong>
                  <small>{isRecruiter ? "Recruiter" : "Candidate"}</small>
                </span>
                <ChevronDown className={isOpen ? "chevron-open" : ""} size={16} aria-hidden="true" />
              </button>
              {isOpen && (
                <div className="account-menu">
                  <Link to="/profile" onClick={closeMenu}>Profile settings</Link>
                  <button type="button" onClick={() => setShowLogoutConfirm(true)}>
                    <LogOut size={16} aria-hidden="true" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/profile" className="sign-in-link">
              <LogIn size={18} aria-hidden="true" />
              <span>Sign in</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          )}
        </div>
      </aside>

      <header className="workspace-topbar">
        <div className="topbar-location">
          <span>TalentAI</span>
          <span className="location-divider">/</span>
          <strong>{activeItem?.label || "Workspace"}</strong>
        </div>
        <div className="topbar-actions">
          <span className="topbar-note">A clearer path to your next role</span>
          {isLoggedIn ? (
            <Link to="/profile" className="topbar-avatar" aria-label="Open profile">
              {initials || "T"}
            </Link>
          ) : (
            <Link to="/profile" className="topbar-signin">Sign in <ArrowUpRight size={15} /></Link>
          )}
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="logout-overlay" role="presentation" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-title" onClick={(event) => event.stopPropagation()}>
            <button className="dialog-close" type="button" aria-label="Close dialog" onClick={() => setShowLogoutConfirm(false)}>
              <X size={18} />
            </button>
            <span className="dialog-mark"><LogOut size={20} /></span>
            <h2 id="logout-title">Sign out of TalentAI?</h2>
            <p>Your career workspace will be here when you return.</p>
            <div className="dialog-actions">
              <button className="dialog-cancel" type="button" onClick={() => setShowLogoutConfirm(false)}>Stay signed in</button>
              <button className="dialog-confirm" type="button" onClick={() => { setShowLogoutConfirm(false); handleLogout(); }}>Sign out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
