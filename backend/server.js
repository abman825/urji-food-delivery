import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PORT as CONSTANT_PORT } from './src/config/constants.js';
import apiRoutes from './src/routes/apiRoutes.js';

const app = express();
const httpServer = createServer(app);

// Socket.io Config ከ CORS ጋር
const io = new Server(httpServer, {
  cors: {
    origin: "*", // ወይም Frontend URL e.g. "http://localhost:5173"
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes Integration
app.use('/api', apiRoutes);

// Socket.io Real-time Connection Logic
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  // 1. ደንበኛው አዲስ ትዕዛዝ ሲልክ (ለ Admin Dashboard ማሳወቅ)
  socket.on('newOrder', (orderData) => {
    console.log('📦 New Order received:', orderData);
    io.emit('newOrder', orderData);
  });

  socket.on('newOrderPlaced', (orderData) => {
    console.log('📦 New Order Placed:', orderData);
    io.emit('orderReceived', orderData);
  });

  // 2. የአድሚኑ በተን ሲነካ Status ን በ Real-time ለሁሉም/ለደንበኛው ማሰራጨት (Pending/In Progress/Completed)
  socket.on('updateOrderStatus', (data) => {
    console.log(`🔄 Order ${data.receiptId} status updated to: ${data.status}`);
    io.emit('orderStatusUpdated', data);
  });

  // 3. አድሚኑ ትዕዛዝ ሲቀበል የሚላክ Notification
  socket.on('adminAcceptOrder', (data) => {
    console.log(`✅ Order accepted by admin: ${data.receiptId}`);
    io.emit('orderAcceptedNotification', {
      receiptId: data.receiptId,
      message: 'ትዕዛዝዎ ደርሶናል! በፍጥነት እናደርሳለን፤ በካፌያችን ስለተገለገሉ እናመሰግናለን!'
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Port Setting & Server Listening
const PORT = process.env.PORT || CONSTANT_PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});