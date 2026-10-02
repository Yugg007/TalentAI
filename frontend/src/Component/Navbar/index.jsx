import { useState } from "react";
import { FaSignInAlt, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isLoggedIn, user, handleLogout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleDropDown = () => {
    if (isLoggedIn) {
      setIsOpen(!isOpen);
    } else {
      setIsOpen(false);
    }
  };

  const recruiterLinks = [
    { to: "/", label: "Home" },
    { to: "/job", label: "Post Job" },
    { to: "/connection", label: "Candidates" },
    { to: "/news", label: "News" },
    { to: "/ai-chatbot", label: "AI Assistant" },
  ];

  const candidateLinks = [
    { to: "/", label: "Home" },
    { to: "/job", label: "Jobs" },
    { to: "/ats-score", label: "ATS Score" },
    { to: "/connection", label: "Connections" },
    { to: "/mock-interview", label: "Interview" },
    { to: "/news", label: "News" },
    { to: "/ai-chatbot", label: "AI Assistant" },
  ];

  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/news", label: "News" },
    { to: "/ai-chatbot", label: "AI Assistant" },
  ];

  const links = isLoggedIn
    ? user?.role === "recruiter"
      ? recruiterLinks
      : candidateLinks
    : publicLinks;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo">Talent AI</Link>
        </div>

        <div className="navbar-right">
          <div className="nav-links">
            {links.map((link) => (
              <Link key={link.to} to={link.to}>{link.label}</Link>
            ))}
          </div>

          <div className="profile-menu">
            {isLoggedIn ? (
              <>
                <button className="profile-icon" onClick={toggleDropDown}>
                  <FaUserCircle />
                </button>
                {isOpen && (
                  <div className="dropdown-menu">
                    <Link to="/profile" onClick={toggleDropDown}>Profile</Link>
                    <button className="logout" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/profile" className="login-icon">
                <FaSignInAlt />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {showLogoutConfirm && (
        <div className="logout-modal">
          <div className="modal-content">
            <p>Are you sure you want to logout?</p>
            <button className="yes" onClick={() => { toggleDropDown(); setShowLogoutConfirm(false); handleLogout(); }}>Yes</button>
            <button className="no" onClick={() => setShowLogoutConfirm(false)}>No</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
