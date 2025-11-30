import { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3001/deathfun';

export const useDeathFun = () => {
  const [gameState, setGameState] = useState('');
  const [player, setPlayer] = useState('');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('gameState', (data) => {
      setGameState(data.gameState);
      setPlayer(data.player);
      setScore(data.score);
      setGameOver(data.gameOver);
      setGameStarted(data.gameStarted);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startGame = () => {
    socketRef.current?.emit('startGame');
  };

  const endGame = () => {
    socketRef.current?.emit('endGame');
  };

  return { gameState, player, score, gameOver, gameStarted, startGame, endGame };
};