import React, { useState, useRef, useEffect } from "react";
import "./style.css";
import axios from "axios";
import { NodeBackendService } from "../../Utils/Api's/ApiMiddleWare";
import ApiEndpoints from "../../Utils/Api's/ApiEndpoints";
import Loader from "../Utility/Loader"

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi! I’m your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [loader, setLoader] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setTyping(true);
    setLoader(true);

    try {
      const body = {
        messages : JSON.stringify(newMessages)
      }
      const response = await NodeBackendService(ApiEndpoints.chatWithAI, body);
      console.log("Server response:", response.data);
      const botReply =
        response.data.reply ||
        "⚠️ Sorry, I couldn’t generate a response right now.";

      setMessages([...newMessages, { role: "assistant", content: botReply }]);
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "❌ Error contacting server." },
      ]);
    } finally {
      setTyping(false);
    }
    setLoader(false);
  };

  return (
    <div className="chatbot-container">
      {loader && <Loader />}
      <header className="chat-header">💬 AI Chat Assistant</header>

      <div className="chat-window">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${msg.role === "user" ? "user" : "bot"}`}
          >
            <div className="message-text">{msg.content}</div>
          </div>
        ))}
        {typing && (
          <div className="chat-message bot">
            <div className="message-text typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} disabled={typing}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
