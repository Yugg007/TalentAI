
import React, { useState } from 'react';

const People = ({ people, sendConnectionRequest }) => {
  const [inviteState, setInviteState] = useState({});

  const handleInviteClick = (userId) => {
    setInviteState(prev => ({
      ...prev,
      [userId]: { ...prev[userId], showInput: true, message: '' }
    }));
  };

  const handleInputChange = (userId, value) => {
    setInviteState(prev => ({
      ...prev,
      [userId]: { ...prev[userId], message: value }
    }));
  };

  const handleSend = (userId) => {
    const message = inviteState[userId]?.message || '';
    const person = people.find(p => p.userId === userId);
    sendConnectionRequest(person.username, message);
    alert(`Invite sent to ${person?.firstName}:\n"${message}"`);
    setInviteState({});
  };

  return (
    <div className="grid people-grid-fixed">
      {people.map(person => (
        <div key={person?.userId} className="people-card">
          <div className="person-header">
            <div className="profile-pic purple" />
            <div>
              <div className="profile-name">{person?.firstName}</div>
              <div className="education">{person?.education}</div>
            </div>
          </div>
          <div className="description">
            <p><strong>Skills:</strong> {person?.skills}</p>
            <p><strong>About:</strong> {person?.description}</p>
          </div>

          {inviteState[person?.userId]?.showInput ? (
            <div className="invite-form">
              <input
                type="text"
                placeholder="Type your message..."
                value={inviteState[person?.userId]?.message || ''}
                onChange={(e) => handleInputChange(person?.userId, e.target.value)}
              />
              <button onClick={() => handleSend(person?.userId)}>Send</button>
            </div>
          ) : (
            <button
              className="invite-button"
              onClick={() => handleInviteClick(person?.userId)}
            >
              Send Invite
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default People;