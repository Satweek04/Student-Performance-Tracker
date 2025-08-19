require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { sequelize, Message, User } = require('./models');
const routes = require('./routes');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/v1', routes);

const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io accessible to controllers
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected: ' + socket.id);

  // FIXED: Handle both string and object formats for join
  socket.on('join', (data) => {
    console.log('Join event received:', data);
    
    if (typeof data === 'string') {
      // Handle string format: "user-123" or "group-456"
      socket.join(data);
      console.log(`Socket ${socket.id} joined room: ${data}`);
      
      // Store user ID for debugging
      if (data.startsWith('user-')) {
        socket.userId = data.replace('user-', '');
      }
    } else if (typeof data === 'object') {
      // Handle object format: { chatGroupId, userId }
      if (data.chatGroupId) {
        const groupRoom = `group-${data.chatGroupId}`;
        socket.join(groupRoom);
        console.log(`Socket ${socket.id} joined group room: ${groupRoom}`);
      }
      if (data.userId) {
        const userRoom = `user-${data.userId}`;
        socket.join(userRoom);
        socket.userId = data.userId;
        console.log(`Socket ${socket.id} joined user room: ${userRoom}`);
      }
    }
  });

  // Handle leaving rooms
  socket.on('leave', (room) => {
    console.log(`Socket ${socket.id} leaving room: ${room}`);
    socket.leave(room);
  });

  // Keep your existing sendMessage handler but add more logging
  socket.on('sendMessage', async (data) => {
    console.log('Socket sendMessage received:', data);
    try {
      // Validate and save message in DB
      const message = await Message.create({
        id: require('uuid').v4(),
        senderId: data.senderId,
        receiverId: data.receiverId || null,
        chatGroupId: data.chatGroupId || null,
        messageText: data.messageText,
        sentAt: new Date(),
        isRead: false,
      });

      // Include sender info for better real-time updates
      const messageWithSender = await Message.findByPk(message.id, {
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name'] },
          { model: User, as: 'receiver', attributes: ['id', 'name'] }
        ]
      });

      console.log('Message created, emitting to rooms...');

      // Emit to recipient rooms
      if (data.chatGroupId) {
        const groupRoom = `group-${data.chatGroupId}`;
        console.log(`Emitting to group room: ${groupRoom}`);
        io.to(groupRoom).emit('newMessage', messageWithSender);
      }
      if (data.receiverId) {
        const receiverRoom = `user-${data.receiverId}`;
        const senderRoom = `user-${data.senderId}`;
        console.log(`Emitting to receiver room: ${receiverRoom}`);
        console.log(`Emitting to sender room: ${senderRoom}`);
        io.to(receiverRoom).emit('newMessage', messageWithSender);
        io.to(senderRoom).emit('newMessage', messageWithSender);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected: ' + socket.id);
  });
});

sequelize.sync().then(() => {
  console.log("Database connected");
  server.listen(port, () => console.log(`Server running on port ${port}`));
});
