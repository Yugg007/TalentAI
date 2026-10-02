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
    console.log("🔌 New client connected: ", socket.id);
    const username = socket.handshake.auth?.username || socket.handshake.query?.username;
    if (username) {
      addUser(username, socket.id);
      socket.emit('connected', { socketId: socket.id, username });
      io.sockets.emit('allUsers', getAllUsers());
      console.log(`🔗 User connected: ${username} (${socket.id})`);
    }

    // Handle user disconnection
    socket.on("disconnect", () => {
      removeUser(socket.id);
      io.sockets.emit("allUsers", getAllUsers());
      console.log("❌ User disconnected: ", socket.id);
    });

    // Handle incoming private messages
    socket.on('sendPrivateMessage', async (message) => {
      try {
        if (!message || !message.sender || !message.receiver || !message.message) {
          return socket.emit('error', { message: 'Invalid private message payload' });
        }

        const receiverSocketId = getUserSocketId(message.receiver);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', message);
        }

        await savePrivateMessage(message);
      } catch (error) {
        console.error('Error handling sendPrivateMessage:', error);
        socket.emit('error', { message: 'Unable to save private message' });
      }
    });

    // Handle incoming group messages
    socket.on('sendGroupMessage', async (message) => {
      try {
        if (!message || !message.sender || !message.groupName || !Array.isArray(message.members)) {
          return socket.emit('error', { message: 'Invalid group message payload' });
        }

        const recipientSocketIds = getGroupSocketIds(message.members);
        const senderSocketId = getUserSocketId(message.sender);

        recipientSocketIds.forEach((socketId) => {
          if (socketId !== senderSocketId) {
            io.to(socketId).emit('receiveMessage', message);
          }
        });

        await saveGroupMessage(message);
      } catch (error) {
        console.error('Error handling sendGroupMessage:', error);
        socket.emit('error', { message: 'Unable to save group message' });
      }
    });





    // code for video calling feature
    socket.on('offer', (data) => {
      socket.to(data.roomId).emit('offer', data);
    });

    socket.on('answer', (data) => {
      if (data?.roomId) {
        socket.to(data.roomId).emit('answer', data);
      }
    });

    socket.on('ice-candidate', (data) => {
      if (data?.roomId) {
        socket.to(data.roomId).emit('ice-candidate', data);
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
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
