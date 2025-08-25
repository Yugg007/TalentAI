import React, { useEffect, useState } from 'react'
import './ChatRoom.css'
import axios from 'axios';
import { NodeBackendService } from '../../Utils/Api\'s/ApiMiddleWare';
import ApiEndpoints from '../../Utils/Api\'s/ApiEndpoints';

const GroupChat = ({ title, messages, sendMessage, username, titleGroup, fetchGroupDetails }) => {
    const [typedMessage, setTypedMessage] = useState("");
    const [showGroupDescription, setShowGroupDescription] = useState(false);

    const [areYouMember, setAreYouMember] = useState(true);
    const [hasRequestedToJoin, setHasRequestedToJoin] = useState(false);

    const handleSendMessage = () => {
        console.log("Sending group message:", typedMessage);
        if (typedMessage.trim() !== "") {
            if (sendMessage(typedMessage)) {
                setTypedMessage(""); // Clear the input after sending
            }
        }
    };

    const fetchMemberJoinStatus = async () => {
        try {
            const body = {
                groupName: titleGroup.groupName,
                username: username
            }

            const response = await NodeBackendService(ApiEndpoints.checkMembership, body)
            console.log("Membership status response:", response.data.AskToJoin);
            if (response?.data?.AskToJoin) {
                setHasRequestedToJoin(true);
            } else {
                setHasRequestedToJoin(false);
            }
        } catch (error) {
            console.error("Error checking group membership:", error);
            setHasRequestedToJoin(false);
        }
    };

    const askToJoinGroup = async () => {
        try {
            const body = {
                groupName: titleGroup.groupName,
                username: username
            }
            const response = await NodeBackendService(ApiEndpoints.askToJoinGroup, body);
            console.log("Ask to join response:", response.data);
            if (response.data.success) {
                setHasRequestedToJoin(true);
                fetchGroupDetails();
                alert("Request to join group sent successfully. Waiting for admin approval.");
            } else {
                alert("Failed to send request to join group.");
            }
        } catch (error) {
            console.error("Error asking to join group:", error);
            alert("Failed to send request to join group. Please try again.");
        }
    };

    const updateAskToJoinStatus = async (action, user) => {
        try {
            const body = {
                groupName: titleGroup.groupName,
                user: user,
                action: action
            }
            const response = await NodeBackendService(ApiEndpoints.updateAskToJoinStatus, body);
            console.log("Update ask to join status response:", response.data);
            if (response.data.success) {
                alert(`User ${user} has been ${action === "approve" ? "approved" : "rejected"} successfully.`);
                fetchMemberJoinStatus(); // Refresh the membership status
            } else {
                alert(`Failed to ${action} user ${user}.`);
            }
        }
        catch (error) {
            console.error("Error updating ask to join status:", error);
            alert(`Failed to ${action} user ${user}. Please try again.`);
        }
    }


    useEffect(() => {
        // Check if the user is a member of the group
        if (titleGroup && titleGroup.members && titleGroup.members.includes(username)) {
            setAreYouMember(true);
        } else {
            setAreYouMember(false);
            fetchMemberJoinStatus();
        }
    })

    return (
        <div className="chat-area">
            <div className="chat-header">
                {title}
                {areYouMember && (
                    <button className="group-details-btn" onClick={() => setShowGroupDescription(!showGroupDescription)}>
                        {showGroupDescription ? "Hide Details" : "Show Details"}
                    </button>
                )}

            </div>
            {areYouMember ?
                <>
                    {showGroupDescription ? (
                        <div className="group-details">
                            <h3>Group Details</h3>
                            <p><strong>Group Name:</strong> {messages[0]?.groupName || titleGroup?.groupName}</p>
                            <p><strong>Description:</strong> {messages[0]?.description || titleGroup?.description || "No description provided."}</p>
                            <p><strong>Admin:</strong> {messages[0]?.admin || titleGroup?.admin || "Unknown"}</p>
                            <p><strong>Created On:</strong>
                                {messages[0]?.timestamp ? new Date(messages[0].timestamp).toLocaleString() : "N/A"}
                            </p>
                            <div className="group-members">
                                <h4>Members:</h4>
                                <ul>
                                    {(messages[0]?.members || titleGroup?.members || []).map((member, index) => (
                                        <li key={index}>{member}</li>
                                    ))}
                                </ul>
                            </div>
                            {titleGroup?.admin === username && titleGroup?.askToJoin && titleGroup?.askToJoin.length > 0 && (
                                <div className="join-request-section">
                                    <h5 className="join-request-heading">Join Requests:</h5>
                                    {titleGroup.askToJoin.map((user, index) => (
                                        <div key={index} className="join-request-item">
                                            <span className="join-request-user">{user}</span>
                                            <button className="join-request-approve-btn" onClick={() => { updateAskToJoinStatus("approve", user) }}>✔</button>
                                            <button className="join-request-reject-btn" onClick={() => { updateAskToJoinStatus("reject", user) }}>✖</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) :
                        <>
                            <div className="chat-messages">
                                {messages.map((msg, index) => (
                                    <>
                                        {msg?.message &&
                                            <div key={index} className={`message ${msg.sender === username ? 'sent' : 'received'}`}>
                                                {msg.message}
                                            </div>
                                        }
                                    </>
                                ))}
                            </div>
                            <div className="chat-input-container">
                                <input type="text" placeholder="Type your message..." value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} />
                                <button onClick={handleSendMessage}>Send</button>
                            </div>
                        </>
                    }
                </>
                :
                <>
                    {hasRequestedToJoin ? (
                        <div className="group-status-msg">
                            ⏳ Waiting for admin approval...
                        </div>
                    ) : (
                        <button className="join-group-btn" onClick={askToJoinGroup}>
                            Join Group
                        </button>
                    )}

                </>
            }
        </div>
    )
}

export default GroupChat