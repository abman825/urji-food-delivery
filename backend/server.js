import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import Order from './src/models/Order.js';
import { PORT as CONSTANT_PORT } from './src/config/constants.js';
import apiRoutes from './src/routes/apiRoutes.js';

// 1. Connect to MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.io Config
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.set('socketio', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// Socket.io Real-time Connection Logic
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  socket.on('joinAdmin', () => socket.join('adminRoom'));

  socket.on('joinOrderRoom', (receiptId) => {
    if (receiptId) socket.join(`order_${String(receiptId).trim()}`);
  });

  // አዲስ ትዕዛዝ በ Socket ሲመጣ DB ላይ ማስቀመጥ
  socket.on('placeOrder', async (orderData) => {
    try {
      const newOrder = new Order({ ...orderData, socketId: socket.id });
      await newOrder.save();

      // ለአድሚኖች በ Real-time ማሳወቅ
      io.to('adminRoom').emit('newOrder', newOrder);
    } catch (err) {
      console.error("Error saving order to MongoDB:", err);
    }
  });

  // Status ሲቀየር (Pending -> In Progress -> Completed) DB ላይ Update ማድረግ
  socket.on('updateOrderStatus', async (data) => {
    const { receiptId, status } = data;
    console.log(`🔄 Updating Order ${receiptId} to: ${status}`);

    try {
      // 1. MongoDB ላይ Statusን Update አድርግ
      const updatedOrder = await Order.findOneAndUpdate(
        { receiptId: receiptId },
        { status: status },
        { new: true }
      );

      const receiptRoom = `order_${String(receiptId).trim()}`;
      const payload = { receiptId, status, updatedOrder };

      // 2. ለተወሰነው ደንበኛ እና ለአድሚን በ Real-time ማሳወቅ
      io.to(receiptRoom).emit('orderStatusUpdated', payload);
      io.emit('orderStatusUpdated', payload);
      io.to('adminRoom').emit('adminOrderStatusChanged', payload);

    } catch (err) {
      console.error("Failed to update status in Database:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || CONSTANT_PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));