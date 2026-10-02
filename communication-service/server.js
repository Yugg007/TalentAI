import dotenv from "dotenv";
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import registerSocketHandlers from './socket/SocketManager.js';
import { ConnectToMongo } from './DbConfig/ConnectionConfig/DbConnection.js';
import messageRoutes from './Route/MessageRoute.js';
import groupRoutes from './Route/GroupRoute.js';
import aiRoute from './Route/AI-Route.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 7007;
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:7000').split(',').map(origin => origin.trim());

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy violation'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

registerSocketHandlers(io);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('CORS policy violation'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/comm/messages', messageRoutes);
app.use('/api/v1/comm/groups', groupRoutes);
app.use('/api/v1/comm/ai', aiRoute);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    await ConnectToMongo();
    console.log('✅ MongoDB connected successfully');

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
