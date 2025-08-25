import { useState } from "react";
import { FaSignInAlt, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Import CSS

const Navbar = ({ isLoggerIn, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
 
  const toggleDropDown = () => {
    if (isLoggerIn) {
      setIsOpen(!isOpen);
    }
    else {
      setIsOpen(false);
    }
  }

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        {/* Left Section - Logo */}
        <div className="navbar-left">
          <Link to="/" className="logo">Talent AI</Link>
        </div>

        {/* Right Section - Links & Profile */}
        <div className="navbar-right">
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/ats-score">ATS Score</Link>
            <Link to="/connection">Connections</Link>
            <Link to="/chat">Chat</Link>
            <Link to="/mock-interview">Interview</Link>
            <Link to="/news">News</Link>
            <Link to="/ai-chatbot">AI Assistant</Link>
          </div>

          {/* Profile Menu */}
          <div className="profile-menu">
            <button className="profile-icon" onClick={toggleDropDown}>
              {
                isLoggerIn
                  ?
                  <FaUserCircle />
                  :
                  <Link to="/profile"><FaSignInAlt /></Link>
              }
            </button>

            {isOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" onClick={toggleDropDown}>Profile</Link>
                <button className="logout" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal">
          <div className="modal-content">
            <p>Are you sure you want to logout?</p>
            <button className="yes" onClick={() => {toggleDropDown(); setShowLogoutConfirm(false); handleLogout()}}>Yes</button>
            <button className="no" onClick={() => setShowLogoutConfirm(false)}>No</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
