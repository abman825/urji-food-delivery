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

// ✅ CORS ቅንብሩን ማስተካከል (ሁሉም ፖርቶች እና ሞባይል በፕላትፎርም እንዲገናኙ)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Socket.io Config
const io = new Server(httpServer, {
  cors: { 
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // ለሞባይል ግንኙነት መረጋጋት በጣም ጠቃሚ ነው
});

// Payload Limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Express Request ላይ Socket.io ማስተዋወቅ
app.set('socketio', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
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

  // Specific Order Room Join (ደንበኛው ትዕዛዙን ለመከታተል) - 💡 እዚህ ጋር ተስተካክሏል
  socket.on('joinOrderRoom', (data) => {
    const receiptId = typeof data === 'object' && data !== null 
      ? (data.receiptId || data.id || data._id) 
      : data;

    if (receiptId) {
      const roomName = `order_${String(receiptId).trim()}`;
      socket.join(roomName);
      console.log(`📌 Socket ${socket.id} joined room: ${roomName}`);
    } else {
      console.log(`⚠️ Invalid receiptId received for joinOrderRoom from socket ${socket.id}`, data);
    }
  });

 // Real-time Order Placement via Socket
  socket.on('placeOrder', async (orderData) => {
    try {
      // 1. receiptId ኦብጀክት ወይም ሌላ ነገር ሆኖ እንዳይመጣ ጥንቃቄ ማድረግ
      const rawReceiptId = orderData.receiptId || orderData.customerInfo?.receiptId;
      const cleanReceiptId = (typeof rawReceiptId === 'object' && rawReceiptId !== null)
        ? (rawReceiptId.receiptId || rawReceiptId.id || `REC-${Math.floor(100000 + Math.random() * 900000)}`)
        : (rawReceiptId || `REC-${Math.floor(100000 + Math.random() * 900000)}`);

      const formattedOrder = {
        receiptId: String(cleanReceiptId).trim(),
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