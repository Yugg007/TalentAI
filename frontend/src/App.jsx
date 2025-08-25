import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './Component/Home'
import Navbar from './Component/Navbar'
import LoginPage from './Component/LoginPage'
import ATSScore from './Component/ATS-Score'
import Job from './Component/Job'
import MockInterview from './Component/Mock-Interview'
import ConnectionsPage from './Component/ConnectionsPage'
import { BackendService } from './Utils/Api\'s/ApiMiddleWare'
import ApiEndpoints from './Utils/Api\'s/ApiEndpoints'
import UserProfile from './Component/UserProfile'
import ChatRoom from './Component/ChatRoom'
import './App.css'; // ✅ Add this import
import News from './Component/News'
import ChatBot from './Component/Chatbot'

const App = () => {
  const [isLoggerIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState(null);

  const authStatus = async () => {
    try {
      const response = await BackendService(ApiEndpoints.authStatus, {});
      setUser(response.data);
      setIsLoggedIn(true);
      console.log(response.data);
    } catch (error) {
      setUser(null);
      setIsLoggedIn(false);
      console.error(error);
    }
  }

  useEffect(() => {
    authStatus();
  }, [])

  const handleLogout = async () => {
    try {
      const response = await BackendService(ApiEndpoints.logout, {});
      console.log(response);
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  }

  const ProtectedRoute = ({ children }) => {
    if (!isLoggerIn) {
      return <Navigate to="/profile" replace />;
    }
    return children;
  };

  return (
    <div className="app-container">
      <Navbar isLoggerIn={isLoggerIn} handleLogout={handleLogout} />
      <div className="main-content">
        <Routes>
          <Route exact path="/" element={<Home isLoggerIn={isLoggerIn} />} />
          <Route exact path="/profile" element={<LoginPage isLoggerIn={isLoggerIn} setIsLoggedIn={setIsLoggedIn} user={user} setUser={setUser} authStatus={authStatus} />} />
          <Route exact path="/profile/:uname" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
          <Route exact path="/ats-score" element={<ProtectedRoute><ATSScore /></ProtectedRoute>} />
          <Route exact path="/connection" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
          <Route exact path="/chat" element={<><ChatRoom /></>} />
          <Route exact path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
          <Route exact path="/mock-interview/:id" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
          <Route exact path="/news" element={<News />}/>
          <Route exact path="/job" element={<Job />} />
          <Route exact path="/job/:id" element={<Job />} />
          <Route exact path="ai-chatbot" element={<ChatBot />} />
        </Routes>
      </div>
    </div>
  )
}

export default App;
