import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PORT as CONSTANT_PORT } from './src/config/constants.js';
import apiRoutes from './src/routes/apiRoutes.js';

const app = express();
const httpServer = createServer(app);

// Cors Config
app.use(cors({
  origin: "*", 
  credentials: true
}));

app.use(express.json());

// Socket.io Config
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PATCH"]
  }
});

// Health check endpoint (Render ሰርቨሩ መነሳቱን ለማረጋገጥ)
app.get('/', (req, res) => {
  res.send('Urji Food Delivery Backend is Running Live!');
});

// API Routes
app.use('/api', apiRoutes);

// Socket.io Real-time Connection Logic
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  socket.on('newOrder', (orderData) => {
    console.log('📦 New Order received:', orderData);
    io.emit('newOrder', orderData);
  });

  socket.on('newOrderPlaced', (orderData) => {
    console.log('📦 New Order Placed:', orderData);
    io.emit('orderReceived', orderData);
  });

  socket.on('updateOrderStatus', (data) => {
    console.log(`🔄 Order ${data.receiptId} status updated to: ${data.status}`);
    io.emit('orderStatusUpdated', data);
  });

  socket.on('adminAcceptOrder', (data) => {
    console.log(`✅ Order accepted by admin: ${data.receiptId}`);
    io.emit('orderAcceptedNotification', {
      receiptId: data.receiptId,
      message: 'ትዕዛዝዎ ደርሶናል! በፍጥነት እናደርሳለን። በካፌያችን ስለተጠቀሙ እናመሰግናለን!'
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Port Setting for Production (Render auto assigns process.env.PORT)
const PORT = process.env.PORT || CONSTANT_PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});