import { 
  addUser, 
  removeUser, 
  getAllUsers, 
  getUserSocketId, 
  getGroupSocketIds 
} from "../DbConfig/CrudConfig/Users.js";

import { 
  savePrivateMessage, 
  saveGroupMessage 
} from "../DbConfig/CrudConfig/Message.js";

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    const username = socket.handshake.query.username;
    if (username) {
      //add user to the users list
      addUser(username, socket.id);

      // Emit the user's ID and all users to the client
      socket.emit("yourID", socket.id);
      io.sockets.emit("allUsers", getAllUsers());

      console.log(`${username} connected, socketId: ${socket.id}`);
      console.log("🔗 New user connected: ", socket.id);
    }

    // Handle user disconnection
    socket.on("disconnect", () => {
      removeUser(socket.id);
      io.sockets.emit("allUsers", getAllUsers());
      console.log("❌ User disconnected: ", socket.id);
    });

    // Handle incoming private messages
    socket.on("sendPrivateMessage", (message) => {
      console.log(`📩 Message from ${message.sender} to ${message.receiver}:`, message);
      const receiverSocketId = getUserSocketId(message.receiver);
      console.log(`Receiver socket ID for ${message.receiver}:`, receiverSocketId);
      console.log("Get all user socket IDs:", getAllUsers());
      if (receiverSocketId) {
        console.log(`📩 Sending message from ${message.sender} to ${message.receiver}`);
        io.to(receiverSocketId).emit("receiveMessage", message);
      }
      savePrivateMessage(message);
      console.log("✅ Private message saved successfully");
    });

    // Handle incoming group messages
    socket.on("sendGroupMessage", (message) => {
      console.log(`📩 Group message from ${message.sender} in group ${message.groupName}:`, message);
      const groupSocketIds = getGroupSocketIds(message.members);
      const senderSocketId = getUserSocketId(message.sender);
      if (groupSocketIds.length > 0) {
        groupSocketIds.forEach(socketId => {
          if (senderSocketId && socketId !== senderSocketId) {
            console.log(`📩 Sending group message from ${message.sender} to group members`);
            io.to(socketId).emit("receiveMessage", message);
          }
        });
      }
      saveGroupMessage(message);
      console.log("✅ Group message saved successfully");
    });





    // code for video calling feature
    socket.on('offer', (data) => {
      socket.to(data.roomId).emit('offer', data);
    });

    socket.on('answer', (data) => {
      socket.to(data.roomId).emit('answer', data);
    });

    socket.on('ice-candidate', (data) => {
      socket.to(data.roomId).emit('ice-candidate', data);
    });




















  });
}

export default registerSocketHandlers;


// socket.on("callUser", (data) => {
//   console.log(`📞 Calling user ${data.userToCall} from ${data.from}`);
//   io.to(data.userToCall).emit("hey", {
//     signal: data.signalData,
//     from: data.from,
//   });
// });

// socket.on("acceptCall", (data) => {
//   console.log(`✅ Call accepted by ${data.to}`);
//   io.to(data.to).emit("callAccepted", data.signal);
// });
