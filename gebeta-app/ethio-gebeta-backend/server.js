const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// CORS Policy ለሁሉም (ወይም ለተወሰኑ) እንዲፈቅድ ማድረግ
const io = new Server(server, {
  cors: {
    origin: "*", // ወይም ["https://ethio-gebeta.onrender.com", "https://ethio-gebeta.vercel.app"]
    methods: ["GET", "POST"]
  }
});

// የክፍሎችን (Rooms) ዳታ መያዣ
const rooms = {};

io.on('connection', (socket) => {
  console.log(`🔌 አዲስ ተጫዋች ተገናኝቷል ID: ${socket.id}`);

  // 1. ክፍል መፍጠር ወይም መቀላቀል (Join Room)
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      // የመጀመሪያው ተጫዋች (Player 1 / Host)
      rooms[roomId] = [socket.id];
      socket.emit('playerAssignment', { player: 0 });
      console.log(`🏠 Room ${roomId} ተፈጠረ በ Player 1 (${socket.id})`);
    } else if (rooms[roomId].length === 1) {
      // ሁለተኛው ተጫዋች (Player 2)
      rooms[roomId].push(socket.id);
      socket.emit('playerAssignment', { player: 1 });
      
      // ለሁለቱም ጨዋታው መጀመሩን ማሳወቅ
      io.to(roomId).emit('gameStart', { message: 'ሁለቱም ተጫዋቾች ተገናኝተዋል!' });
      console.log(`🎮 Player 2 (${socket.id}) Room ${roomId}ን ተቀላቀለ`);
    } else {
      // ክፍሉ ከሁለት ሰው በላይ አይቀበልም
      socket.emit('roomFull');
    }
  });

  // 2. የእንቅስቃሴ (Move) ዳታ ማስተላለፍ
  socket.on('makeMove', ({ roomId, index, player }) => {
    // የነካውን ጉድጓድ (index) ለሌላው ተጫዋች ብቻ ይልካል
    socket.to(roomId).emit('opponentMoved', { index, player });
  });
socket.on('sendGameState', ({ roomId, newBoard, newScores, nextTurn, winnerMsg }) => {
  // እንቅስቃሴውን ያደረገው ሰው ሳይሆን ለሌላኛው ተጫዋች ብቻ ላክ
  socket.to(roomId).emit('gameStateUpdate', { newBoard, newScores, nextTurn, winnerMsg });
});
  // 3. ተጫዋች ከኢንተርኔት ሲቋረጥ (Disconnect)
  socket.on('disconnect', () => {
    console.log(`❌ ተጫዋች ወጥቷል ID: ${socket.id}`);
    
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      
      if (rooms[roomId].length === 0) {
        delete rooms[roomId]; // ክፍሉ ባዶ ከሆነ ማጽዳት
      } else {
        // ላለው ተጫዋች ሌላኛው መውጣቱን ማሳወቅ
        io.to(roomId).emit('playerLeft');
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend Server በ Port ${PORT} ላይ መስራት ጀምሯል!`);
});