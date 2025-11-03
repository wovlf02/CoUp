require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { Redis } = require('@upstash/redis'); // Assuming Upstash Redis as per coup/src/lib/utils/redis.js

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8081;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY_FOR_JWT_CHANGE_IT';
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://localhost:3000/api/v1';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'YOUR_SECURE_INTERNAL_API_KEY'; // Use a strong, random key

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize Redis client for Pub/Sub
const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Middleware for JWT authentication
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded; // Attach user info to socket
    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id} (${socket.user.email})`);

  // Handle 'join_room' event
  socket.on('join_room', async (studyId) => {
    socket.join(studyId);
    console.log(`User ${socket.user.id} joined study room: ${studyId}`);
    // Optionally, fetch and emit past messages for the room
  });

  // Handle 'leave_room' event
  socket.on('leave_room', (studyId) => {
    socket.leave(studyId);
    console.log(`User ${socket.user.id} left study room: ${studyId}`);
  });

  // Handle 'send_message' event
  socket.on('send_message', async ({ studyId, content }) => {
    if (!studyId || !content) {
      socket.emit('message_error', { message: 'Study ID and content are required.' });
      return;
    }

    try {
      // Call internal Next.js API to save message to DB
      const response = await fetch(`${INTERNAL_API_URL}/internal/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-api-key': INTERNAL_API_KEY,
        },
        body: JSON.stringify({
          studyGroupId: studyId,
          senderId: socket.user.id,
          content: content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save message to DB');
      }

      const messageData = {
        userId: socket.user.id,
        userName: socket.user.name, // Assuming user.name is available from JWT
        content: content,
        sentAt: new Date().toISOString(),
      };

      // Broadcast message to all clients in the room
      io.to(studyId).emit('new_message', messageData);
      console.log(`Message sent to study ${studyId} by ${socket.user.name}: ${content}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { message: 'Failed to send message.' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.id}`);
    // Optionally, update user's online status via internal API
  });

  // WebRTC Signaling
  // Handle 'join_video_room' event
  socket.on('join_video_room', (studyId) => {
    socket.join(studyId);
    console.log(`User ${socket.user.id} joined video room: ${studyId}`);
    // Notify others in the room about the new participant
    socket.to(studyId).emit('new_participant', { userId: socket.user.id, userName: socket.user.name });
  });

  // Handle 'offer' event: relay SDP offer to a specific target user
  socket.on('offer', ({ targetUserId, studyId, sdpOffer }) => {
    console.log(`Relaying offer from ${socket.user.id} to ${targetUserId} in study ${studyId}`);
    socket.to(targetUserId).emit('offer', { senderId: socket.user.id, sdpOffer });
  });

  // Handle 'answer' event: relay SDP answer to a specific target user
  socket.on('answer', ({ targetUserId, studyId, sdpAnswer }) => {
    console.log(`Relaying answer from ${socket.user.id} to ${targetUserId} in study ${studyId}`);
    socket.to(targetUserId).emit('answer', { senderId: socket.user.id, sdpAnswer });
  });

  // Handle 'ice_candidate' event: relay ICE candidate to a specific target user
  socket.on('ice_candidate', ({ targetUserId, studyId, iceCandidate }) => {
    console.log(`Relaying ICE candidate from ${socket.user.id} to ${targetUserId} in study ${studyId}`);
    socket.to(targetUserId).emit('ice_candidate', { senderId: socket.user.id, iceCandidate });
  });
});

// Redis Pub/Sub for notifications from Next.js API Routes
const subscriber = redis.duplicate(); // Create a separate client for subscription
subscriber.subscribe('notifications', (message) => {
  try {
    const notification = JSON.parse(message);
    // Emit notification to the specific user
    io.to(notification.recipientId).emit('notification', notification);
    console.log(`Notification sent to user ${notification.recipientId}:`, notification);
  } catch (error) {
    console.error('Error processing Redis notification:', error);
  }
});

server.listen(PORT, () => {
  console.log(`Signaling server listening on port ${PORT}`);
});