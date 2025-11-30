import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupDeathFunSocket } from './games/deathfun/socket';
import { setupSumoSocket } from './games/sumo/socket';
import { setupRektSocket } from './games/rektrace/socket';
import { setupBombSocket } from './games/bomb/socket'; // ★ 필수

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 게임 소켓들 연결
setupDeathFunSocket(io);
setupSumoSocket(io);
setupRektSocket(io);
setupBombSocket(io); // ★ 필수: 이게 없으면 연결 안됨

httpServer.listen(3001, () => {
  console.log('🚀 Backend Server running on port 3001');
});