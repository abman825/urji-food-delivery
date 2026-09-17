import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import Order from './src/models/Order.js';
import { PORT as CONSTANT_PORT } from './src/config/constants.js';
import apiRoutes from './src/routes/apiRoutes.js';
import { handleTelegramCallback, sendDailyReportToTelegram } from './src/services/telegramService.js';

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

// Telegram Webhook Route
app.post('/api/telegram-webhook', async (req, res) => {
  try {
    const update = req.body;
    const socketIo = req.app.get('socketio');

    // 1. አድሚኑ በቴሌግራም አዝራር (Button) ሲጫን
    if (update && update.callback_query) {
      await handleTelegramCallback(update.callback_query, socketIo);
      return res.sendStatus(200);
    }

    // 2. አድሚኑ /today ወይም /stats ብሎ ሲጽፍ
    if (update && update.message && update.message.text) {
      const command = update.message.text.trim().toLowerCase();

      if (command === '/today' || command === '/stats') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // የዛሬዎቹን ትዕዛዞች ከ Database መፈለግ
        const todayOrders = await Order.find({
          createdAt: { $gte: startOfDay,$lte: endOfDay }
        });

        const totalOrdersCount = todayOrders.length;
        const totalRevenue = todayOrders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);

        // ሪፖርቱን ወደ ቴሌግራም መላክ
        await sendDailyReportToTelegram(totalOrdersCount, totalRevenue);
        return res.sendStatus(200);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Telegram Webhook Error:", err);
    res.sendStatus(500);
  }
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

  // Specific Order Room Join (ደንበኛው ትዕዛዙን ለመከታተል)
  socket.on('joinOrderRoom', (receiptId) => {
    if (receiptId) socket.join(`order_${String(receiptId).trim()}`);
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