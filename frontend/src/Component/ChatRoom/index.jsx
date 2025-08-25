import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import Storage from "../../Utils/Storage";
import PrivateChat from "./PrivateChat";
import GroupChat from "./GroupChat";
import { BackendService, NodeBackendService } from "../../Utils/Api's/ApiMiddleWare";
import ApiEndpoints from "../../Utils/Api's/ApiEndpoints";

import "./ChatRoom.css";
import Property from "../../Utils/Property";

const ChatRoom = () => {
  const location = useLocation();
  const { state } = location;
  console.log("State:", state?.allConnections);
  const username = Storage.getStorageData("username");
  const friendUsername = state?.friendUsername;
  const [allConnections, setAllConnections] = useState(state?.allConnections || []);

  const socketRef = useRef(null);

  const [onlineSocketIds, setOnlineSocketIds] = useState([]);
  const [offlineSocketIds, setOfflineSocketIds] = useState(state?.allConnections || []);

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

  const fetchConnections = async () => {
    const response = await BackendService(ApiEndpoints.getConnections, { username });
    if (response?.data) {
      setAllConnections(response.data.myConnections || []);
      setOfflineSocketIds(response.data.myConnections || []);
    }
  };
  useEffect(() => {
    if (allConnections?.length === 0) {
      fetchConnections();
    }
  }, [allConnections]);

  useEffect(() => {
    socketRef.current = io(Property.NodeBackendPath, {
      autoConnect: false,
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
      console.log("All users received:", users);
      const filterSocketIs = users.filter((user) => user.username !== username);
      setOnlineSocketIds(filterSocketIs);
      if (friendUsername) {
        const friend = users.find(user => user.username === friendUsername);
        if (friend) {
          startPrivateChatting(friend);
        }
      }

      if (allConnections.length > 0) {
        const filterConnections = allConnections.filter((user) => {
          return (user.username !== username && !filterSocketIs.some((fi) => fi.username === user.username));
        });
        console.log("Filtered connections:", filterConnections);
        setOfflineSocketIds(filterConnections);
      }
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

  const fetchPrivateMessages = async (uname) => {
    try {
      const body = {
        username1: username,
        username2: uname
      }
      const response = await NodeBackendService(ApiEndpoints.fetchPrivateMessages, body);
      if (!response) {
        throw new Error("Network response was not ok");
      }
      const data = response.data;
      setMessages(data);
      console.log("Fetched private messages:", data);
    } catch (error) {
      console.error("Error fetching private messages:", error);
    }
  };

  const startPrivateChatting = (user, status) => {
    setTitle(`Chatting with ${user.username}`);
    let ur = user;
    ur.type = "private";
    ur.status = status;
    setIsGroupChat(false);
    setMessages([]);
    setTitleUser(ur);
    console.log("Starting private chat with:", ur);
    fetchPrivateMessages(user.username);
  };

  const fetchGroupMessages = async (groupName) => {
    try {
      const response = await NodeBackendService(ApiEndpoints.fetchGroupMessages, { groupName });
      if (response.status >= 400) {
        console.error("Failed to fetch group messages");
        return;
      }
      const data = response.data;
      console.log("Fetched group messages:", data);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching group messages:", error);
    }
  };

  const startGroupChatting = (group) => {
    setTitle(`Chatting in group: ${group.groupName}`);
    setTitleGroup(group);
    console.log("Starting group chat with:", group);
    setIsGroupChat(true);
    setMessages([]);
    fetchGroupMessages(group.groupName);
  }

  const sendPrivateMessage = (typedMessage) => {
    if (typedMessage.trim() === "") return;

    const message = {
      message: typedMessage,
      sender: username,
      receiver: titleUser.username,
      timestamp: new Date().toISOString(),
      type: "private"
    };

    setMessages((prevMessages) => [...prevMessages, message]);

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("sendPrivateMessage", message);
      console.log("📩 Sent:", message);
    }
    else {
      console.warn("⚠️ Socket not connected. Message not sent.");
      return false;
    }
    return true;
  };

  const sendGroupMessage = async (typedMessage) => {
    if (typedMessage.trim() === "") return;

    const message = {
      message: typedMessage,
      sender: username,
      groupName: titleGroup.groupName,
      members: titleGroup.members,
      type: "group",
    }

    setMessages((prevMessages) => [...prevMessages, message]);

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("sendGroupMessage", message);
      console.log("📩 Sent:", message);
    }
    else {
      console.warn("⚠️ Socket not connected. Message not sent.");
      return false;
    }
    return true;
  }

  const createGroup = async () => {
    if (groupName.trim() === "") return;

    const group = {
      groupName: groupName,
      members: [username],
      type: "group",
      admin: username
    };

    const response = await NodeBackendService(ApiEndpoints.createGroup, group);
    if (response.status >= 400) {
      console.error("Failed to create group");
      alert("Failed to create group. Please try again.");
      return;
    }
    const data = response.data;
    console.log("Group created successfully:", data);
    setAllConnections((prev) => [...prev, groupName]);
    setGroupName("");
    setCreateGroupSection(false);
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
    <div className="chatroom-container">
      <div className="sidebar">
        <h2 className="sidebar-title">Welcome to chat room</h2>

        <div className="sidebar-section">

          <h3 className="group-header">
            Groups
            <button className="create-group-btn" onClick={() => setCreateGroupSection(true)}>
              Create Group
            </button>
          </h3>

          {createGroupSection && (
            <div className="create-group-section">
              <input type="text" placeholder="Group Name" className="group-input" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
              <button className="confirm-btn" onClick={createGroup}>✔</button>
              <button className="cancel-btn" onClick={() => setCreateGroupSection(false)}>✖</button>
            </div>
          )}

          <ul>
            {groupDetails.map((group) => (
              <li key={group._id} onClick={() => startGroupChatting(group, "group")}>
                {group.groupName}
              </li>
            ))}
          </ul>
        </div>

        {onlineSocketIds.length > 0 && (
          <div className="sidebar-section">
            <h3>Your Connections(Online)</h3>
            <ul>
              {onlineSocketIds?.map((user) => (
                <li key={user.username} onClick={() => startPrivateChatting(user, "online")}>
                  {user?.username}
                </li>
              ))}
            </ul>
          </div>
        )}

        {offlineSocketIds?.length > 0 && (
          <div className="sidebar-section">
            <h3>Your Connections</h3>
            <ul>
              {offlineSocketIds?.map((user) => (
                <li key={user.username} onClick={() => startPrivateChatting(user, "offline")}>
                  {user?.username}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {
        isGroupChat
          ?
          <GroupChat title={title} messages={messages} sendMessage={sendGroupMessage} username={username} titleGroup={titleGroup} fetchGroupDetails={fetchGroupDetails} />
          :
          <PrivateChat title={title} messages={messages} sendMessage={sendPrivateMessage} username={username} />
      }



    </div>
  );
};

export default ChatRoom;
