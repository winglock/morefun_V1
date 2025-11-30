import { Server, Socket } from 'socket.io';
import { binanceService } from '../../services/binance';
import { joinQueue, tryMatch, setPlayerReady, updateRoomLoop, handleDisconnect, GameRoom } from './logic';

let globalCurrentPrice = 0;

const calculateMidPrice = (bids: string[][], asks: string[][]): number => {
  if (!bids.length || !asks.length) return 0;
  return (parseFloat(bids[0][0]) + parseFloat(asks[0][0])) / 2;
};

export const setupColiseumSocket = (io: Server) => {
  const coliseumNamespace = io.of('/coliseum');

  binanceService.subscribe((bids, asks) => {
    const price = calculateMidPrice(bids, asks);
    if (price > 0) globalCurrentPrice = price;

    const rooms = coliseumNamespace.adapter.rooms;
    if (rooms) {
      rooms.forEach((_, roomId) => {
        if (roomId.startsWith('room-')) {
             const roomState = updateRoomLoop(roomId, globalCurrentPrice);
             if (roomState) {
               coliseumNamespace.to(roomId).volatile.emit('game_update', { room: roomState, price: globalCurrentPrice });
             }
        }
      });
    }
  });

  coliseumNamespace.on('connection', (socket: Socket) => {
    console.log(`[Coliseum] User Connected: ${socket.id}`);

    // 1. 매칭 큐 입장 (Callback 추가됨)
    socket.on('join_queue', (callback) => {
      console.log(`[Coliseum] Join Queue Request: ${socket.id}`);
      
      const added = joinQueue(socket.id);
      
      // 클라이언트에게 "응답" 보냄
      if (typeof callback === 'function') callback('OK');

      // 상태 전송
      socket.emit('queue_status', 'waiting');
      
      // 매칭 시도
      const match = tryMatch();
      if (match) {
        console.log(`[Coliseum] Match Created! Room: ${match.roomId}`);
        
        const p1Socket = coliseumNamespace.sockets.get(match.playerA.id);
        const p2Socket = coliseumNamespace.sockets.get(match.playerB.id);

        if (p1Socket && p2Socket) {
          p1Socket.join(match.roomId);
          p2Socket.join(match.roomId);

          coliseumNamespace.to(match.roomId).emit('match_found', match);
        }
      }
    });

    // 2. 포지션 선택
    socket.on('select_side', (side: 'LONG' | 'SHORT') => {
      console.log(`[Coliseum] ${socket.id} selected ${side}`);
      const room = setPlayerReady(socket.id, side, globalCurrentPrice);
      if (room) {
        coliseumNamespace.to(room.roomId).emit('game_update', { room, price: globalCurrentPrice });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Coliseum] User Disconnected: ${socket.id}`);
      const roomId = handleDisconnect(socket.id);
      if (roomId) {
        coliseumNamespace.to(roomId).emit('opponent_left');
      }
    });
  });
};