import { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3001/deathfun';

export const useDeathFun = () => {
  const [gameState, setGameState] = useState<any>(null);
  const [gameOver, setGameOver] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(BACKEND_URL);

    socketRef.current.on('game_started', (data) => {
      setGameOver(false);
      setGameState(data);
    });

    socketRef.current.on('move_result', (data) => {
      setGameState((prev: any) => ({ ...prev, ...data }));
      if (!data.success || data.status === 'WON') {
        setGameOver(true);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const startGame = () => {
    socketRef.current?.emit('start_game');
  };

  const selectTile = (index: number) => {
    if (!gameOver) {
      socketRef.current?.emit('select_tile', index);
    }
  };

  return { gameState, gameOver, startGame, selectTile };
};
