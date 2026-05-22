import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Multiplayer Game State
  const rooms = new Map();

  function generateRoomCode() {
    let result = '';
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < 4; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  io.on('connection', (socket) => {
    socket.on('createRoom', (callback) => {
      let code;
      do {
        code = generateRoomCode();
      } while (rooms.has(code));
      
      const newRoom = {
        code,
        host: socket.id,
        players: [],
        status: 'waiting', // waiting, playing, finished
        state: null
      };
      
      rooms.set(code, newRoom);
      socket.join(code);
      callback({ code });
      io.to(code).emit('roomUpdate', newRoom);
    });

    socket.on('joinRoom', ({ code, playerName }, callback) => {
      const room = rooms.get(code.toUpperCase());
      if (!room) {
        return callback({ error: 'Sala no trobada' });
      }
      if (room.status !== 'waiting') {
        return callback({ error: 'La partida ja ha començat' });
      }
      
      const player = {
        id: socket.id,
        name: playerName,
        score: 0,
        answeredCorrectly: false,
        streak: 0
      };
      
      room.players.push(player);
      socket.join(room.code);
      callback({ success: true, room });
      io.to(room.code).emit('roomUpdate', room);
    });

    socket.on('startGame', ({ code, allComarcas, mode }) => {
      const room = rooms.get(code);
      if (room && room.host === socket.id) {
        // Initialize game state
        // We receive the shuffled array of comarcas IDs from the host to ensure consistency
        room.status = 'playing';
        room.state = {
          mode,
          allComarcas,
          currentIndex: 0, // Current target to find
          roundScores: {}
        };
        io.to(code).emit('roomUpdate', room);
      }
    });

    socket.on('nextRound', ({ code }) => {
      const room = rooms.get(code);
      if (room && room.host === socket.id) {
        if (room.state) {
          room.state.currentIndex++;
          room.players.forEach(p => p.answeredCorrectly = false);
          if (room.state.currentIndex >= room.state.allComarcas.length) {
            room.status = 'finished';
          }
          io.to(code).emit('roomUpdate', room);
        }
      }
    });

    socket.on('submitAnswer', ({ code, isCorrect }) => {
       const room = rooms.get(code);
       if (room && room.status === 'playing') {
          const player = room.players.find(p => p.id === socket.id);
          if (player && !player.answeredCorrectly) {
             if (isCorrect) {
                player.score += 10;
                player.streak++;
                player.answeredCorrectly = true;
             } else {
                player.streak = 0;
             }
             io.to(code).emit('roomUpdate', room);
          }
       }
    });

    socket.on('disconnect', () => {
      rooms.forEach((room, code) => {
        if (room.host === socket.id) {
          // Host left, destroy room
          io.to(code).emit('roomDestroyed');
          rooms.delete(code);
        } else {
          // Player left
          const idx = room.players.findIndex(p => p.id === socket.id);
          if (idx !== -1) {
            room.players.splice(idx, 1);
            io.to(code).emit('roomUpdate', room);
          }
        }
      });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on http://localhost:" + PORT);
  });
}

startServer();
