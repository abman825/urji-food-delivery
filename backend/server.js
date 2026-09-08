import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PORT as CONSTANT_PORT } from './src/config/constants.js';
import apiRoutes from './src/routes/apiRoutes.js';

const app = express();
const httpServer = createServer(app);

// Socket.io Config
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// controllerዎች እና req ላይ Socket.io ኤክስፖርት ለማድረግ
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes Integration
app.use('/api', apiRoutes);

// Socket.io Real-time Connection Logic
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  // 1. Admin ሲገባ 'adminRoom' የሚባል ልዩ ክፍል ይቀላቀላል
  socket.on('joinAdmin', () => {
    socket.join('adminRoom');
    console.log(`👨‍🍳 Admin joined room: adminRoom (${socket.id})`);
  });

  // 2. ደንበኛው ሲገባ የራሱን Socket ID ወይም Customer ID ይይዛል
  socket.on('joinCustomer', (customerSocketId) => {
    socket.join(customerSocketId || socket.id);
  });

  // 3. ደንበኛው አዲስ ትዕዛዝ በ Socket ሲልክ
  socket.on('sendOrder', (orderData) => {
    // ሀ) አዲሱን ትዕዛዝ ለአድሚኖች ብቻ ላክ (ለሌላው ደንበኛ እንዳይሄድ!)
    io.to('adminRoom').emit('newOrder', orderData);

    // ለ) ትዕዛዙ መላኩን ለላከው ደንበኛ ብቻ አረጋግጥለት (ለሌላው ሰው አይሄድም)
    socket.emit('orderConfirmed', { 
      message: "ትዕዛዝዎን ተቀብለናል! በፍጥነት እናደርሳለን",
      receiptId: orderData.receiptId 
    });
  });

  // 4. አድሚኑ 'ተቀብለናል' የሚል በተን ሲነካ -> ለትዕዛዙ ባለቤት (ለዚያ ስልክ) ብቻ ይልካል
  socket.on('adminAcceptOrder', (data) => {
    console.log(`✅ Order accepted by admin: ${data.receiptId}`);
    
    const notificationPayload = {
      receiptId: data.receiptId,
      message: 'ትዕዛዝዎ ደርሶናል! በፍጥነት እናደርሳለን፤ በካፌያችን ስለተስተናገዱ እናመሰግናለን!'
    };

    // targetSocketId ካለ ለዚያ ደንበኛ ብቻ፤ ከሌለ ለሁሉም አድሚኖች ማሳወቅ
    if (data.targetSocketId) {
      io.to(data.targetSocketId).emit('orderAcceptedNotification', notificationPayload);
    } else {
      socket.broadcast.emit('orderAcceptedNotification', notificationPayload);
    }
  });

  // 5. Status ሲቀየር (Pending -> In Progress -> Completed)
  socket.on('updateOrderStatus', (data) => {
    console.log(`🔄 Order ${data.receiptId} status updated to: ${data.status}`);
    
    // ሀ) በ RAM ውስጥ የትዕዛዙን Status ማስተካከል
    if (global.globalOrders) {
      const order = global.globalOrders.find(o => 
        o.receiptId === data.receiptId || o.id === data.receiptId || o._id === data.receiptId
      );
      if (order) {
        order.status = data.status;
      }
    }

    // ለ) ለአድሚኖች በሙሉ አዲሱን Status ማሳወቅ (አንዱ አድሚን ሲቀበል ሌላውም እንዲያየው)
    io.to('adminRoom').emit('orderStatusChanged', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Port Setting & Server Listening
const PORT = process.env.PORT || CONSTANT_PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});