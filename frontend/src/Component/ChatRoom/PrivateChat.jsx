import React, { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import './ChatRoom.css'

const PrivateChat = ({ title, messages, sendMessage, username, activeUser, onBack }) => {
    const [typedMessage, setTypedMessage] = useState("");
    const messagesEndRef = useRef(null);
    const isActive = Boolean(activeUser?.username);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    const handleSendMessage = () => {
        if (typedMessage.trim() && sendMessage(typedMessage)) {
            setTypedMessage("");
        }
    };

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
          <span className="conversation-avatar">{activeUser?.username?.slice(0, 1).toUpperCase() || "T"}</span>
          <div className="chat-header-copy">
            <strong>{isActive ? title.replace("Chatting with ", "") : "Your messages"}</strong>
            <span>{isActive ? (activeUser.status === "online" ? "Available now" : "Conversation") : "TalentAI connections"}</span>
          </div>
          {isActive && <span className={`header-presence ${activeUser.status === "online" ? "is-online" : ""}`} />}
        </header>
        {isActive ? (
          <>
            <div className="chat-messages" aria-live="polite">
              {messages.filter((message) => message?.message).map((message, index) => (
                <div key={message._id || `${message.timestamp || "message"}-${index}`} className={`message ${message.sender === username ? "sent" : "received"}`}>
                  <p>{message.message}</p>
                  {message.timestamp && <time>{new Date(message.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>}
                </div>
              ))}
              {messages.length === 0 && <p className="conversation-empty-hint">This is the beginning of your conversation.</p>}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-container" onSubmit={(event) => { event.preventDefault(); handleSendMessage(); }}>
              <textarea
                aria-label="Write a message"
                placeholder="Write a message..."
                value={typedMessage}
                onChange={(event) => setTypedMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button type="submit" aria-label="Send message" title="Send message" disabled={!typedMessage.trim()}><Send size={17} /></button>
            </form>
          </>
        ) : (
          <div className="chat-empty-state">
            <span className="empty-state-mark" aria-hidden="true">t</span>
            <p className="chat-eyebrow">TALENTAI / CONNECT</p>
            <h2>Good conversations start here.</h2>
            <p>Choose a person or group to pick up where you left off.</p>
          </div>
        )}
      </div>
  )
}

export default PrivateChat