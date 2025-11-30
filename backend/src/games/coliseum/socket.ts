import { Server, Socket } from 'socket.io';
import { binanceService } from '../../services/binance';
import { joinQueue, tryMatch, setPlayerReady, updateRoomLoop, handleDisconnect, GameRoom } from './logic';

let globalCurrentPrice = 0;

// 미드 프라이스 계산 헬퍼
const calculateMidPrice = (bids: string[][], asks: string[][]): number => {
  if (!bids.length || !asks.length) return 0;
  return (parseFloat(bids[0][0]) + parseFloat(asks[0][0])) / 2;
};

export const setupColiseumSocket = (io: Server) => {
  const coliseumNamespace = io.of('/coliseum');

  // 바이낸스 틱마다 모든 활성화된 방 업데이트
  binanceService.subscribe((bids, asks) => {
    const price = calculateMidPrice(bids, asks);
    if (price > 0) globalCurrentPrice = price;

    // 모든 방을 순회하며 게임 로직 실행 (비효율적일 수 있으나 방 개수가 적다고 가정)
    // 실제 서비스에선 활성화된 방 목록을 따로 관리
    const rooms = coliseumNamespace.adapter.rooms;
    if (rooms) {
      rooms.forEach((_, roomId) => {
        if (roomId.startsWith('room-')) { // room- 으로 시작하는 방만
             // 로직 업데이트 호출은 logic.ts의 데이터 접근이 필요하므로
             // 여기서는 간단히 updateRoomLoop를 호출하고 결과를 해당 방에 쏨
             const roomState = updateRoomLoop(roomId, globalCurrentPrice);
             if (roomState) {
               coliseumNamespace.to(roomId).volatile.emit('game_update', { room: roomState, price: globalCurrentPrice });
             }
        }
      });
    }
  });

  coliseumNamespace.on('connection', (socket: Socket) => {
    // console.log(`[Coliseum] User Connected: ${socket.id}`);

    // 1. 매칭 큐 입장
    socket.on('join_queue', () => {
      const added = joinQueue(socket.id);
      if (added) {
        socket.emit('queue_status', 'waiting');
        
        // 매칭 시도
        const match = tryMatch();
        if (match) {
          // 매칭 성공! 두 유저를 방에 넣음
          const p1Socket = coliseumNamespace.sockets.get(match.playerA.id);
          const p2Socket = coliseumNamespace.sockets.get(match.playerB.id);

          if (p1Socket && p2Socket) {
            p1Socket.join(match.roomId);
            p2Socket.join(match.roomId);

            coliseumNamespace.to(match.roomId).emit('match_found', match);
          }
        }
      }
    });

    // 2. 포지션 선택 (Ready)
    socket.on('select_side', (side: 'LONG' | 'SHORT') => {
      const room = setPlayerReady(socket.id, side, globalCurrentPrice);
      if (room) {
        // 방에 있는 모두에게 업데이트 (준비 상태 or 게임 시작)
        coliseumNamespace.to(room.roomId).emit('game_update', { room, price: globalCurrentPrice });
      }
    });

    socket.on('disconnect', () => {
      const roomId = handleDisconnect(socket.id);
      if (roomId) {
        coliseumNamespace.to(roomId).emit('opponent_left');
      }
    });
  });
};