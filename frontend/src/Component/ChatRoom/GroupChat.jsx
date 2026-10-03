import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, Info, Send, X } from 'lucide-react'
import './ChatRoom.css'
import { NodeBackendService } from '../../Utils/Api\'s/ApiMiddleWare';
import ApiEndpoints from '../../Utils/Api\'s/ApiEndpoints';

const GroupChat = ({ title, messages, sendMessage, username, titleGroup, fetchGroupDetails, onBack }) => {
    const [typedMessage, setTypedMessage] = useState("");
    const [showGroupDescription, setShowGroupDescription] = useState(false);
    const [areYouMember, setAreYouMember] = useState(true);
    const [hasRequestedToJoin, setHasRequestedToJoin] = useState(false);
    const messagesEndRef = useRef(null);

    const handleSendMessage = () => {
        console.log("Sending group message:", typedMessage);
        if (typedMessage.trim() !== "") {
            if (sendMessage(typedMessage)) {
                setTypedMessage(""); // Clear the input after sending
            }
        }
    };

    const fetchMemberJoinStatus = useCallback(async () => {
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
    }, [titleGroup?.groupName, username]);

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
        const isMember = Boolean(titleGroup?.members?.includes(username));
        setAreYouMember(isMember);
        if (!isMember && titleGroup?.groupName) fetchMemberJoinStatus();
    }, [titleGroup, username, fetchMemberJoinStatus]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chat-area">
            <header className="chat-header">
                <button type="button" className="mobile-back-button" onClick={onBack} aria-label="Back to conversations"><ArrowLeft size={18} /></button>
                <span className="conversation-avatar group-avatar">{titleGroup?.groupName?.slice(0, 1).toUpperCase() || "G"}</span>
                <div className="chat-header-copy"><strong>{title}</strong><span>{titleGroup?.members?.length || 0} members</span></div>
                {areYouMember && (
                    <button className={`group-details-btn${showGroupDescription ? " is-open" : ""}`} type="button" onClick={() => setShowGroupDescription(!showGroupDescription)} aria-label={showGroupDescription ? "Hide group details" : "Show group details"} title={showGroupDescription ? "Hide details" : "Group details"}>
                        <Info size={17} />
                    </button>
                )}
            </header>
            {areYouMember ?
                <>
                    {showGroupDescription ? (
                        <div className="group-details">
                            <div className="group-details-heading"><h2>Group details</h2><button className="icon-action" type="button" onClick={() => setShowGroupDescription(false)} aria-label="Close group details"><X size={17} /></button></div>
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
                                                <button className="join-request-approve-btn" onClick={() => { updateAskToJoinStatus("approve", user) }} aria-label={`Approve ${user}`} title="Approve"><Check size={16} /></button>
                                                <button className="join-request-reject-btn" onClick={() => { updateAskToJoinStatus("reject", user) }} aria-label={`Reject ${user}`} title="Reject"><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) :
                        <>
                            <div className="chat-messages" aria-live="polite">
                                {messages.filter((message) => message?.message).map((message, index) => (
                                    <div key={message._id || `${message.timestamp || "message"}-${index}`} className={`message ${message.sender === username ? "sent" : "received"}`}>
                                        {message.sender !== username && <span className="message-sender">{message.sender}</span>}
                                        <p>{message.message}</p>
                                        {message.timestamp && <time>{new Date(message.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>}
                                    </div>
                                ))}
                                {messages.length === 0 && <p className="conversation-empty-hint">Start the conversation with your group.</p>}
                                <div ref={messagesEndRef} />
                            </div>
                            <form className="chat-input-container" onSubmit={(event) => { event.preventDefault(); handleSendMessage(); }}>
                                <textarea aria-label="Write a message" placeholder="Write a message..." value={typedMessage} onChange={(event) => setTypedMessage(event.target.value)} onKeyDown={handleKeyDown} rows={1} />
                                <button type="submit" aria-label="Send message" title="Send message" disabled={!typedMessage.trim()}><Send size={17} /></button>
                            </form>
                        </>
                    }
                </>
                :
                <>
                    {hasRequestedToJoin ? (
                        <div className="group-access-state">
                            <span className="empty-state-mark" aria-hidden="true">t</span>
                            <h2>Request pending</h2>
                            <p>The group admin will review your request.</p>
                        </div>
                    ) : (
                        <div className="group-access-state">
                            <span className="empty-state-mark" aria-hidden="true">t</span>
                            <h2>Join the conversation</h2>
                            <p>Ask the group admin to add you to this conversation.</p>
                            <button className="join-group-btn" onClick={askToJoinGroup}>
                            Join Group
                            </button>
                        </div>
                    )}

                </>
            }
        </div>
    )
}

export default GroupChat