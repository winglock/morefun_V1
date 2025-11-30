import { Server, Socket } from 'socket.io';
import { addPlayer, removePlayer, startGame, passBomb, updateBombLoop, settleSurvivors } from './logic';

export const setupBombSocket = (io: Server) => {
  const bombNamespace = io.of('/bomb');

  // 1초마다 게임 상태 업데이트 (Game Loop)
  setInterval(() => {
    const result = updateBombLoop();
    
    // 봇이 패스했으면 이벤트 전송
    if (result.bombPassed) {
      bombNamespace.emit('bomb_passed', { from: 'bot' });
    }

    if (result.exploded) {
      // 폭발 발생!
      bombNamespace.emit('game_exploded', { 
        victimId: result.victimId,
        players: result.players 
      });
      
      // 생존자 정산 후 업데이트
      settleSurvivors();
      setTimeout(() => {
        bombNamespace.emit('game_update', { players: result.players, isActive: false });
      }, 3000);

    } else {
      // 일반 진행 상태 전송
      bombNamespace.volatile.emit('game_update', {
        players: result.players
      });
    }
  }, 1000);

  bombNamespace.on('connection', (socket: Socket) => {
    console.log(`[Bomb] User Connected: ${socket.id}`);
    addPlayer(socket.id);

    // 입장 시 즉시 업데이트
    bombNamespace.emit('game_update', { players: updateBombLoop().players });

    socket.on('start_game', () => {
      const success = startGame();
      if (success) {
        bombNamespace.emit('game_start_announce');
      } else {
        socket.emit('error_msg', 'Not enough players (Need 2+)');
      }
    });

    socket.on('pass_bomb', () => {
      const success = passBomb(socket.id);
      if (success) {
        bombNamespace.emit('bomb_passed', { from: socket.id });
      }
    });

    socket.on('disconnect', () => {
      removePlayer(socket.id);
    });
  });
};