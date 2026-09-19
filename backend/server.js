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

app.use(cors());

// Socket.io Config
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }
});

// Payload Limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Express Request ላይ Socket.io ማያያዝ
app.set('socketio', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes (Webhook እና ሌሎች የኤፒአይ መንገዶች እዚህ ይስተናገዳሉ)
app.use('/api', apiRoutes);

// Socket.io Real-time Connection Logic
io.on('connection', (socket) => {
  console.log('⚡ አዲስ ደንበኛ ተገናኝቷል:', socket.id);

  // Menu Update Sync
  socket.on('updateMenu', (updatedMenu) => {
    io.emit('updateMenu', updatedMenu);
  });

  // Admin Room Join
  socket.on('joinAdmin', () => socket.join('adminRoom'));

  // Specific Order Room Join (ደንበኛው ትዕዛዙን ለመከታተል)
  socket.on('joinOrderRoom', (receiptId) => {
    if (receiptId) {
      const roomName = `order_${String(receiptId).trim()}`;
      socket.join(roomName);
      console.log(`📌 Socket ${socket.id} joined room: ${roomName}`);
    }
  });

  // Real-time Order Placement via Socket
  socket.on('placeOrder', async (orderData) => {
    try {
      const formattedOrder = {
        receiptId: orderData.receiptId || `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName: orderData.customerInfo?.name || orderData.customerName || '',
        phone: orderData.customerInfo?.phone || orderData.phone || '-',
        tableNo: orderData.customerInfo?.tableNo || orderData.tableNo || '-',
        address: orderData.customerInfo?.address || orderData.address || '',
        time: orderData.customerInfo?.time || orderData.time || '',
        note: orderData.customerInfo?.note || orderData.note || '',
        lang: orderData.lang || 'am',
        orderType: orderData.customerInfo?.orderType || orderData.orderType || 'Dine-in',
        paymentMethod: orderData.paymentMethod || 'Screenshot',
        items: orderData.items || [],
        totalPrice: Number(orderData.totalPrice) || 0,
        socketId: socket.id
      };

      const newOrder = new Order(formattedOrder);
      await newOrder.save();

      io.to('adminRoom').emit('newOrder', newOrder);
      io.emit('newOrderCreated', newOrder);
    } catch (err) {
      console.error("Error saving order via Socket to MongoDB:", err);
    }
  });

  // Order Status Update Real-time Event
  socket.on('updateOrderStatus', async (data) => {
    const { receiptId, status } = data;
    console.log(`🔄 Updating Order ${receiptId} to: ${status}`);

    try {
      const updatedOrder = await Order.findOneAndUpdate(
        { receiptId: String(receiptId).trim() },
        { status: status },
        { new: true }
      );

      const receiptRoom = `order_${String(receiptId).trim()}`;
      const payload = { 
        receiptId, 
        status, 
        lang: updatedOrder?.lang || 'am',
        updatedOrder 
      };

      io.to(receiptRoom).emit('orderStatusUpdated', payload);
      io.emit('orderStatusUpdated', payload);
      io.to('adminRoom').emit('adminOrderStatusChanged', payload);

    } catch (err) {
      console.error("Failed to update status in Database:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ ደንበኛ ተቋርጧል:', socket.id);
  });
});

const PORT = process.env.PORT || CONSTANT_PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));