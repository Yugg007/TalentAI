import React, {useState} from 'react'
import './ChatRoom.css'

const PrivateChat = ({title, messages, sendMessage, username}) => {
    const  [typedMessage, setTypedMessage] = useState("");
    const handleSendMessage = () => {
        if (typedMessage.trim() !== "") {
            if(sendMessage(typedMessage)){
                setTypedMessage(""); // Clear the input after sending
            }
        }
    };
  return (
      <div className="chat-area">
        <div className="chat-header">{title}</div>
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
      </div>
  )
}

export default PrivateChat