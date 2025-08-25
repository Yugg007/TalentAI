import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import cors from "cors";

import registerSocketHandlers from "./socket/SocketManager.js";
import { ConnectToMongo } from "./DbConfig/ConnectionConfig/DbConnection.js";
import messageRoutes from "./Route/MessageRoute.js";
import groupRoutes from "./Route/GroupRoute.js";
import aiRoute from "./Route/AI-Route.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Register socket handlers
registerSocketHandlers(io);

// Middleware to parse JSON requests
app.use(cors({
  origin: 'http://localhost:9001', // your React app origin
  methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/ai", aiRoute);

// Server listening to port 8000
server.listen(9004, async () => {
  await ConnectToMongo();
  console.log("✅ MongoDB connected successfully");
  console.log('🚀 Server is running on port 9004');
});
