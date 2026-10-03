import { io } from "socket.io-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Check, Plus, Search, X } from "lucide-react";

import PrivateChat from "./PrivateChat";
import GroupChat from "./GroupChat";
import { BackendService, NodeBackendService } from "../../Utils/Api's/ApiMiddleWare";
import ApiEndpoints from "../../Utils/Api's/ApiEndpoints";
import { useAuth } from '../../context/AuthContext';

import "./ChatRoom.css";
import Property from "../../Utils/Property";

const ChatRoom = () => {
  const location = useLocation();
  const { state } = location;
  const { user } = useAuth();
  const username = user?.username;
  const friendUsername = state?.friendUsername;
  const [allConnections, setAllConnections] = useState(state?.allConnections || []);

  const socketRef = useRef(null);
  const friendAutoOpenedRef = useRef(false);

  const [onlineSocketIds, setOnlineSocketIds] = useState([]);
  const [offlineSocketIds, setOfflineSocketIds] = useState(state?.allConnections || []);
  const [searchTerm, setSearchTerm] = useState("");

  //for chat
  const [title, setTitle] = useState("Welcome to chat room");
  const [messages, setMessages] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);

  // For private chat
  const [titleUser, setTitleUser] = useState({});

  // For group chat
  const [createGroupSection, setCreateGroupSection] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDetails, setGroupDetails] = useState([]);
  const [titleGroup, setTitleGroup] = useState({});

  const fetchConnections = useCallback(async () => {
    const response = await BackendService(ApiEndpoints.getConnections, { username });
    if (response?.data) {
      setAllConnections(response.data.myConnections || []);
    }
  }, [username]);

  useEffect(() => {
    if (allConnections?.length === 0) {
      fetchConnections();
    }
  }, [allConnections, fetchConnections]);

  useEffect(() => {
    const onlineUsernames = new Set(onlineSocketIds.map((connection) => connection.username));
    setOfflineSocketIds(allConnections.filter((connection) =>
      connection?.username && connection.username !== username && !onlineUsernames.has(connection.username)
    ));
  }, [allConnections, onlineSocketIds, username]);

  useEffect(() => {
    socketRef.current = io(Property.BasePath, {
      autoConnect: false,
      path: Property.SocketPath,
      query: { username },
    });

    const socket = socketRef.current;

    socket.connect();

    socket.on("connect", () => {
      console.log("🟢 Socket connected with id:", socket.id);
    });

    socket.on("yourID", (id) => {
      console.log("Your socket ID:", id);
    });

    socket.on("allUsers", (users) => {
      const filterSocketIs = users.filter((user) => user.username !== username);
      setOnlineSocketIds(filterSocketIs);
    });

    socket.on("receiveMessage", (message) => {
      console.log("Received a message:", message);
      setMessages((prev) => [...prev, message]);
    });

    //fetch all the group details
    fetchGroupDetails();

    return () => {
      socket.disconnect();
      socket.off(); // Clean all events
    };
  }, [username]);

  const fetchPrivateMessages = useCallback(async (uname) => {
    try {
      const response = await NodeBackendService(ApiEndpoints.fetchPrivateMessages, {
        username1: username,
        username2: uname,
      });
      if (!response) throw new Error("Network response was not ok");
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching private messages:", error);
    }
  }, [username]);

  const startPrivateChatting = useCallback((user, status) => {
    setTitle(`Chatting with ${user.username}`);
    setTitleUser({ ...user, type: "private", status });
    setIsGroupChat(false);
    setMessages([]);
    fetchPrivateMessages(user.username);
  }, [fetchPrivateMessages]);

  useEffect(() => {
    if (!friendUsername || friendAutoOpenedRef.current || titleUser?.username === friendUsername) return;
    const friend = [...onlineSocketIds, ...allConnections].find((connection) => connection.username === friendUsername);
    if (friend) {
      friendAutoOpenedRef.current = true;
      startPrivateChatting(friend, onlineSocketIds.some((connection) => connection.username === friendUsername) ? "online" : "offline");
    }
  }, [friendUsername, onlineSocketIds, allConnections, titleUser?.username, startPrivateChatting]);

  const fetchGroupMessages = async (groupName) => {
    try {
      const response = await NodeBackendService(ApiEndpoints.fetchGroupMessages, { groupName });
      if (!response || response.status >= 400) {
        console.error("Failed to fetch group messages");
        return;
      }
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching group messages:", error);
    }
  };

  const startGroupChatting = (group) => {
    setTitle(`Chatting in group: ${group.groupName}`);
    setTitleGroup(group);
    setTitleUser({});
    setIsGroupChat(true);
    setMessages([]);
    fetchGroupMessages(group.groupName);
  };

  const sendPrivateMessage = (typedMessage) => {
    if (!typedMessage.trim()) return false;
    if (!socketRef.current?.connected) {
      console.warn("Socket not connected. Message not sent.");
      return false;
    }

    const message = {
      message: typedMessage,
      sender: username,
      receiver: titleUser.username,
      timestamp: new Date().toISOString(),
      type: "private",
    };
    setMessages((previousMessages) => [...previousMessages, message]);
    socketRef.current.emit("sendPrivateMessage", message);
    return true;
  };

  const sendGroupMessage = (typedMessage) => {
    if (!typedMessage.trim()) return false;
    if (!socketRef.current?.connected) {
      console.warn("Socket not connected. Message not sent.");
      return false;
    }

    const message = {
      message: typedMessage,
      sender: username,
      groupName: titleGroup.groupName,
      members: titleGroup.members,
      type: "group",
    };
    setMessages((previousMessages) => [...previousMessages, message]);
    socketRef.current.emit("sendGroupMessage", message);
    return true;
  };

  const createGroup = async () => {
    if (groupName.trim() === "") return;

    const group = {
      groupName: groupName,
      members: [username],
      type: "group",
      admin: username
    };

    const response = await NodeBackendService(ApiEndpoints.createGroup, group);
    if (!response || response.status >= 400) {
      console.error("Failed to create group");
      alert("Failed to create group. Please try again.");
      return;
    }
    const data = response.data;
    console.log("Group created successfully:", data);
    setGroupName("");
    setCreateGroupSection(false);
    fetchGroupDetails();
  };

  const fetchGroupDetails = async () => {
    try {
      const response = await NodeBackendService(ApiEndpoints.fetchGroupDetails);
      if (response.status >= 400) {
        console.error("Failed to fetch group details");
        return;
      }
      const data = response.data;
      console.log("Fetched group details:", data);
      setGroupDetails(data);
    }
    catch (error) {
      console.error("Error fetching group details:", error);
    }
  }

  return (
    <div className={`chatroom-container${(isGroupChat || titleUser.username) ? " has-active-chat" : ""}`}>
      <aside className="chat-sidebar" aria-label="Conversations">
        <div className="chat-sidebar-heading">
          <div>
            <p className="chat-eyebrow">TALENTAI / CONNECT</p>
            <h1>Messages</h1>
          </div>
          <span className="conversation-count">{groupDetails.length + onlineSocketIds.length + offlineSocketIds.length}</span>
        </div>

        <label className="conversation-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search conversations"
            placeholder="Search people or groups"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        <section className="conversation-section">
          <div className="conversation-section-heading">
            <h2>Groups</h2>
            <button className="icon-action" type="button" title="Create a group" aria-label="Create a group" onClick={() => setCreateGroupSection((open) => !open)}>
              <Plus size={17} aria-hidden="true" />
            </button>
          </div>
          {createGroupSection && (
            <form className="create-group-form" onSubmit={(event) => { event.preventDefault(); createGroup(); }}>
              <input autoFocus type="text" aria-label="Group name" placeholder="Name this group" value={groupName} onChange={(event) => setGroupName(event.target.value)} />
              <button className="icon-action is-confirm" type="submit" title="Create group" aria-label="Create group" disabled={!groupName.trim()}><Check size={16} /></button>
              <button className="icon-action" type="button" title="Cancel" aria-label="Cancel" onClick={() => { setCreateGroupSection(false); setGroupName(""); }}><X size={16} /></button>
            </form>
          )}
          <div className="conversation-list">
            {groupDetails.filter((group) => group.groupName?.toLowerCase().includes(searchTerm.toLowerCase())).map((group) => (
              <button key={group._id || group.groupName} type="button" className={`conversation-item${isGroupChat && titleGroup.groupName === group.groupName ? " is-active" : ""}`} onClick={() => startGroupChatting(group)}>
                <span className="conversation-avatar group-avatar">{group.groupName?.slice(0, 1).toUpperCase() || "G"}</span>
                <span className="conversation-copy"><strong>{group.groupName}</strong><small>Group conversation</small></span>
              </button>
            ))}
            {groupDetails.length === 0 && <p className="list-hint">No groups yet</p>}
          </div>
        </section>

        <section className="conversation-section people-section">
          <div className="conversation-section-heading"><h2>People</h2></div>
          <div className="conversation-list">
            {[...onlineSocketIds.map((connection) => ({ ...connection, status: "online" })), ...offlineSocketIds.map((connection) => ({ ...connection, status: "offline" }))]
              .filter((connection) => connection.username?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((connection) => (
                <button key={connection.username} type="button" className={`conversation-item${!isGroupChat && titleUser.username === connection.username ? " is-active" : ""}`} onClick={() => startPrivateChatting(connection, connection.status)}>
                  <span className="conversation-avatar">{connection.username?.slice(0, 1).toUpperCase()}</span>
                  <span className="conversation-copy"><strong>{connection.username}</strong><small>{connection.status === "online" ? "Available now" : "Offline"}</small></span>
                  <span className={`presence-dot ${connection.status}`} aria-label={connection.status} />
                </button>
              ))}
            {onlineSocketIds.length + offlineSocketIds.length === 0 && <p className="list-hint">Your connections will appear here</p>}
          </div>
        </section>
      </aside>

      {isGroupChat ? (
        <GroupChat title={title} messages={messages} sendMessage={sendGroupMessage} username={username} titleGroup={titleGroup} fetchGroupDetails={fetchGroupDetails} onBack={() => { setIsGroupChat(false); setTitleUser({}); setMessages([]); }} />
      ) : (
        <PrivateChat title={title} messages={messages} sendMessage={sendPrivateMessage} username={username} activeUser={titleUser} onBack={() => setTitleUser({})} />
      )}
    </div>
  );
};

export default ChatRoom;
