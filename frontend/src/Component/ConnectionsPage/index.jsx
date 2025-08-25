

import React, { useState, useEffect } from 'react';
import './style.css';
import People from './People';
import Storage from '../../Utils/Storage';
import ApiEndpoints from '../../Utils/Api\'s/ApiEndpoints';
import { BackendService } from '../../Utils/Api\'s/ApiMiddleWare';
import { useNavigate } from 'react-router-dom';

const ConnectionsPage = () => {
  const navigate = useNavigate();
  const [myConnections, setMyConnections] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [inviteSend, setInviteSend] = useState([]);
  const [people, setPeople] = useState([]);

  const fetchConnections = async () => {
    const body = {
      username: Storage.getStorageData('username')
    };
    const response = await BackendService(ApiEndpoints.getConnections, body);
    if (response?.data) {
      setMyConnections(response.data.myConnections || []);
      setPendingConnections(response.data.pendingConnections || []);
      setPeople(response.data.people || []);
      setInviteSend(response.data.inviteSend || []);
    }
  };

  const sendConnectionRequest = async (targetUsername, message) => {
    const body = {}
    body.username = Storage.getStorageData('username');
    body.targetUsername = targetUsername; 
    body.message = message;
    const response = await BackendService(ApiEndpoints.sendConnectionRequest, body);
    if (response?.data) {
      alert(`Connection request sent to ${targetUsername}`);
      setMyConnections(response.data.myConnections || []);
      setPendingConnections(response.data.pendingConnections || []);
      setPeople(response.data.people || []);
      setInviteSend(response.data.inviteSend || []);
    }
  };

  const acceptPendingRequest = async (bd) => {
    console.log("Accepting pending request for: ", bd);
    const body = {
      username: Storage.getStorageData('username'),
      targetUsername : bd.username
    };

    const response = await BackendService(ApiEndpoints.acceptPendingRequest, body);
    if (response?.data) {
      alert(`Connection request accepted for ${bd.username}`);
      setMyConnections(response.data.myConnections || []);
      setPendingConnections(response.data.pendingConnections || []);
      setPeople(response.data.people || []);
      setInviteSend(response.data.inviteSend || []);
    }
  };

  const goToProfilePage = (username) => {
    navigate(`/profile/${username}`);
  }

  const goToChatRoom = (username) => {
    navigate("/chat", {
      state : {
        friendUsername : username,
        allConnections: myConnections
      }
    });
  }

  const goToScheduleMeetingPage = () => {
    navigate("/mock-interview");
  }

  useEffect(() => {
    fetchConnections();
  }, []);

  return (
    <div className="page-container">
      {/* My Connections */}
      <section>
        <h2 className="section-title">My Connections</h2>
        <div className="my-connections">
          {myConnections.map(conn => (
            <div key={conn.userId} className="connection-card">
              <div className="profile-info">
                <div className="profile-pic blue" />
                <span className="profile-name">{conn.firstName}</span>
              </div>
              <div className="action-buttons">
                <button onClick={() => {goToProfilePage(conn.username)}}>Profile</button>
                <button onClick={() => {goToChatRoom(conn.username)}}>Chat</button>
                <button onClick={goToScheduleMeetingPage}>Schedule Meeting</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pending Connections */}
      {pendingConnections.length > 0 && (
        <section>
          <h2 className="section-title">Pending Connections</h2>
          <div className="grid">
            {pendingConnections.map(conn => (
              <div key={conn.userId} className="pending-card">
                <div className="profile-pic yellow" />
                <span className="profile-name">{conn.firstName}</span>
                <p className="pending-message">{"Message - "}{conn.message}</p>
                <button className="accept-invite" onClick={() => acceptPendingRequest(conn)}>Accept Request</button>
              </div>
            ))}
          </div>
        </section>
      )}


      {/* People */}
      <section>
        <h2 className="section-title">People</h2>
        <People people={people} sendConnectionRequest={sendConnectionRequest} />
      </section>

      
      {/* Invite Send To Connections */}
      {inviteSend.length > 0 && (
        <section>
          <h2 className="section-title">Invite Sent</h2>
          <div className="grid">
            {inviteSend.map(conn => (
              <div key={conn.userId} className="pending-card">
                <div className="profile-pic yellow" />
                <span className="profile-name">{conn.firstName}</span>
                <button className="invite-again">Invite Sent</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ConnectionsPage;
