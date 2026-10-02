import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './Component/Home'
import Navbar from './Component/Navbar'
import LoginPage from './Component/LoginPage'
import ATSScore from './Component/ATS-Score'
import Job from './Component/Job'
import MockInterview from './Component/Mock-Interview'
import ConnectionsPage from './Component/ConnectionsPage'
import UserProfile from './Component/UserProfile'
import ChatRoom from './Component/ChatRoom'
import './App.css';
import News from './Component/News'
import ChatBot from './Component/Chatbot'
import Applications from './Component/Applications'
import { AuthProvider, useAuth } from './context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div className="route-loading" role="status">Checking your session…</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/profile" replace />;
  }
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<LoginPage />} />
            <Route path="/profile/:uname" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
            <Route path="/ats-score" element={<ProtectedRoute><ATSScore /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
            <Route path="/connection" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
            <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
            <Route path="/mock-interview/:id" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
            <Route path="/news" element={<News />} />
            <Route path="/job" element={<Job />} />
            <Route path="/job/:id" element={<Job />} />
            <Route path="/ai-chatbot" element={<ChatBot />} />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </div>
    </AuthProvider>
  )
}

export default App;
