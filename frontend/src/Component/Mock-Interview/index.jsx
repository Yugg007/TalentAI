import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";
import Schedule from "./Schedule";
import Loader from "../Utility/Loader"
import { BackendService } from "../../Utils/Api's/ApiMiddleWare";
import ApiEndpoints from "../../Utils/Api's/ApiEndpoints";

const MockInterview = () => {
  const [isGoogleAuthorized, setIsGoogleAuthorized] = useState(false);
  const [loader, setLoader] = useState(false);

  const checkGoogleToken = async () => {
    try {
      setLoader(true);
      const response = await BackendService(ApiEndpoints.checkGoogleToken);
      console.log("Google Token Check Response:", response);
      if (response?.data?.authorized) setIsGoogleAuthorized(true);
    } catch (error) {
      console.error("Error checking Google token:", error);
    }
    setLoader(false);
  };
  useEffect(() => {
    checkGoogleToken();
  }, []);

  const handleGoogleAuth = () => {
    const width = 600;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    const authWindow = window.open(
      "https://localhost:9002/TalentAI/api/google/oauth2/authorize",
      "Google OAuth",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    const interval = setInterval(() => {
      if (!authWindow || authWindow.closed) {
        clearInterval(interval);
        checkGoogleToken();
      }
    }, 1000);
  };

  return (
    <div>
      {loader && <Loader />}

      <h2 className="mock-title">Mock Interview Scheduler</h2>

      {!isGoogleAuthorized ? (
        <button className="mock-btn google-btn" onClick={handleGoogleAuth}>
          Connect Google Calendar
        </button>
      ) : (
        <Schedule />
      )}
    </div>
  );
};

export default MockInterview;
