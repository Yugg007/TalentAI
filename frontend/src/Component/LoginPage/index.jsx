import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaArrowRight, FaIdBadge } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { BackendService } from '../../Utils/Api\'s/ApiMiddleWare';
import ApiEndpoints from '../../Utils/Api\'s/ApiEndpoints';
import './style.css';
import ProfileSection from "./ProfileSection";
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { isLoggedIn, setIsLoggedIn, user, setUser, authStatus } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("candidate");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required.");
      return;
    }

    if (!isLogin && !username.trim()) {
      toast.error("Please choose a username.");
      return;
    }

    const userPayload = isLogin
      ? { email, password }
      : { username, email, password, firstName: name, role };

    try {
      const response = await BackendService(
        isLogin ? ApiEndpoints.login : ApiEndpoints.register,
        userPayload
      );

      if (response?.data) {
        setUser(response.data);
        setIsLoggedIn(true);
        toast.success(isLogin ? "Welcome back!" : "Account created successfully.");
      } else {
        toast.error("Login/Register failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login/Register Error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    if (!user) {
      authStatus();
    }
  }, [user]);

  return (
    <>
      {isLoggedIn ? (
        <div className="profile-wrapper">
          <ProfileSection user={user} setUser={setUser} />
        </div>
      ) : (
        <div className="auth-wrapper">
          <section className="auth-story">
            <p className="auth-story-kicker"><span /> A more thoughtful job search</p>
            <h1>Your next move should feel like <em>your own.</em></h1>
            <p>Bring your experience and the role into the same conversation. Then take the next step with a little more clarity.</p>
            <div className="auth-story-steps" aria-label="TalentAI workflow">
              <span><b>01</b> Discover</span>
              <span><b>02</b> Understand fit</span>
              <span><b>03</b> Get ready</span>
            </div>
          </section>
          <div className="auth-card">
            <h2>{isLogin ? "Login to Continue" : "Create your Talent AI account"}</h2>
            <p className="auth-intro">{isLogin ? "Pick up where your search left off." : "Set up your workspace and begin with one clear next step."}</p>

            <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <FaEnvelope className="icon" />
              <input
                type="email"
                placeholder="Email"
                aria-label="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!isLogin && (
              <div className="input-group">
                <FaUser className="icon" />
                <input
                  type="text"
                  placeholder="Username"
                  aria-label="Username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            {!isLogin && (
              <div className="input-group">
                <FaIdBadge className="icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  aria-label="Full name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            {!isLogin && (
              <div className="role-selector">
                <span className="role-label">Account type</span>
                <div className="radio-group">
                  <label className={`role-option ${role === "candidate" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="role"
                      value="candidate"
                      checked={role === "candidate"}
                      onChange={() => setRole("candidate")}
                    />
                    Candidate
                  </label>
                  <label className={`role-option ${role === "recruiter" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="role"
                      value="recruiter"
                      checked={role === "recruiter"}
                      onChange={() => setRole("recruiter")}
                    />
                    Recruiter
                  </label>
                </div>
              </div>
            )}

            <div className="input-group">
              <RiLockPasswordLine className="icon" />
              <input
                type="password"
                placeholder="Password"
                aria-label="Password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary">
              {isLogin ? "Login" : "Register"} <FaArrowRight />
            </button>
            </form>

            <p className="toggle-text">
              {isLogin ? "Don't have an account?" : "Already a user?"} <button type="button" className="auth-toggle" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;
