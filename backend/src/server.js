require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const createApp = require('./app');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const User = require('./models/User');

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const DEFAULT_DEV_ORIGINS = ['http://localhost:5174', 'http://localhost:5173','http://localhost:5173register','http://localhost:5174/register'];
const allowedOrigins = buildAllowedOrigins([
  process.env.FRONTEND_URL,
  process.env.DEV_FRONTEND_URL,
  process.env.ADDITIONAL_CORS_ORIGINS
]);
const primaryOrigin = allowedOrigins[0] || DEFAULT_DEV_ORIGINS[0];
const DIST_DIR = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
const GLOBAL_ROOM = 'global';

bootstrap();

async function bootstrap() {
  try {
    ensureRequiredEnv();
    await connectDB(process.env.MONGO_URI);

    const app = configureExpressApp();
    const server = http.createServer(app);
    const io = configureSocketServer(server);

    app.set('io', io);

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT} (${NODE_ENV})`);
    });

    handleProcessSignals(server);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

function configureExpressApp() {
  const app = createApp({ allowedOrigins, fallbackOrigin: primaryOrigin });
  app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);



  return app;
}

function attachFrontendBuild(app) {
  if (!fs.existsSync(DIST_DIR)) {
    console.warn(`frontend build not found at ${DIST_DIR}. Static file hosting skipped.`);
    return;
  }

  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    return res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

function configureSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    }
  });

  io.use(socketAuthMiddleware);
  io.on('connection', (socket) => {
    socket.join(GLOBAL_ROOM);
    socket.on('sendMessage', handleSendMessage(socket, io));
  });

  return io;
}

async function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select('username');
    if (user) {
      socket.user = { id: user._id.toString(), username: user.username };
    }
    return next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
}

const handleSendMessage = (socket, io) => async (payload = {}) => {
  const text = typeof payload.text === 'string' ? payload.text.trim() : '';
  if (!text) return;

  try {
    const senderId = await resolveSenderId(socket, payload.token);
    if (!senderId) {
      socket.emit('errorMessage', { message: 'Authentication required to send messages' });
      return;
    }

    const message = await Message.create({ sender: senderId, text });
    const populated = await message.populate('sender', 'username');

    io.to(GLOBAL_ROOM).emit('message', {
      _id: populated._id,
      text: populated.text,
      sender: populated.sender,
      createdAt: populated.createdAt
    });
  } catch (err) {
    console.error('Socket sendMessage error:', err.message);
    socket.emit('errorMessage', { message: 'Message failed to send' });
  }
};

async function resolveSenderId(socket, fallbackToken) {
  if (socket.user?.id) {
    return socket.user.id;
  }
  if (!fallbackToken) {
    return null;
  }
  try {
    const payload = jwt.verify(fallbackToken, JWT_SECRET);
    return payload.id;
  } catch (err) {
    return null;
  }
}

function buildAllowedOrigins(sourceList = []) {
  const origins = sourceList
    .flatMap((value) => (value ? value.split(',') : []))
    .map((origin) => origin.trim())
    .filter(Boolean);

  const merged = Array.from(new Set([...origins, ...DEFAULT_DEV_ORIGINS]));
  return merged.length ? merged : DEFAULT_DEV_ORIGINS;
}

function ensureRequiredEnv() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is required');
  }
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
}

function handleProcessSignals(server) {
  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
