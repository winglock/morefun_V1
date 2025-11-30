import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Swords, TrendingUp, TrendingDown, Timer, Activity, Users } from 'lucide-react';

const BACKEND_URL = 'http://localhost:3001/coliseum';

interface ColiPlayer {
  id: string;
  side: 'LONG' | 'SHORT' | 'NONE';
  pnl: number;
  isReady: boolean;
}

interface GameRoom {
  roomId: string;
  playerA: ColiPlayer;
  playerB: ColiPlayer;
  endTime: number;
  isActive: boolean;
  winnerId: string | null;
}

export default function ColiseumGame() {
  const [status, setStatus] = useState<'IDLE' | 'WAITING' | 'MATCHED' | 'PLAYING' | 'FINISHED'>('IDLE');
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [price, setPrice] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]); // 디버그 로그

  const socketRef = useRef<any>(null);
  const myId = socketRef.current?.id;

  // 로그 추가 함수
  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));
  };

  useEffect(() => {
    socketRef.current = io(BACKEND_URL);

    socketRef.current.on('connect', () => {
      addLog(`Connected: ${socketRef.current.id}`);
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      addLog("Disconnected");
      setIsConnected(false);
      setStatus('IDLE');
    });

    socketRef.current.on('queue_status', (msg: string) => {
      addLog(`Queue Status: ${msg}`);
      if (msg === 'waiting') setStatus('WAITING');
    });

    socketRef.current.on('match_found', (initialRoom: GameRoom) => {
      addLog(`Match Found! Room: ${initialRoom.roomId}`);
      setRoom(initialRoom);
      setStatus('MATCHED');
    });

    socketRef.current.on('game_update', (data: { room: GameRoom, price: number }) => {
      setRoom(data.room);
      setPrice(data.price);
      if (data.room.isActive) {
        setStatus('PLAYING');
        const left = Math.max(0, Math.ceil((data.room.endTime - Date.now()) / 1000));
        setTimeLeft(left);
      }
      if (data.room.winnerId) {
        setStatus('FINISHED');
      }
    });

    socketRef.current.on('opponent_left', () => {
      alert("상대방이 도망갔습니다! (Opponent Left)");
      window.location.reload();
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const joinQueue = () => {
    if (!isConnected) return alert("서버 연결 안됨");
    
    addLog("Sending join_queue...");
    // 즉시 화면 전환 (Optimistic UI)
    setStatus('WAITING'); 
    
    // 서버에 요청 보내고 응답 기다림 (Callback)
    socketRef.current.emit('join_queue', (response: string) => {
        addLog(`Server Response: ${response}`);
    });
  };

  const selectSide = (side: 'LONG' | 'SHORT') => {
    socketRef.current.emit('select_side', side);
  };

  const resetGame = () => window.location.reload();

  const me = room ? (room.playerA.id === myId ? room.playerA : room.playerB) : null;
  const opponent = room ? (room.playerA.id === myId ? room.playerB : room.playerA) : null;

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen flex flex-col items-center justify-center font-sans text-white relative">
      
      {/* 🛠️ 디버그 로그창 (왼쪽 상단) */}
      <div className="fixed top-20 left-4 bg-black/80 p-3 rounded text-xs font-mono text-green-400 border border-slate-700 w-64 z-50 pointer-events-none">
        <div className="font-bold border-b border-gray-700 mb-1 pb-1 flex justify-between">
            <span>DEBUG LOG</span>
            <span className={isConnected ? "text-green-500" : "text-red-500"}>●</span>
        </div>
        {logs.map((log, i) => (
            <div key={i} className="truncate">{log}</div>
        ))}
      </div>

      {/* 우측 상단 연결 상태 */}
      <div className={`fixed top-4 right-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border ${isConnected ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400'}`}>
        <Activity size={12} className={isConnected ? "animate-pulse" : ""} />
        {isConnected ? "Server Online" : "Disconnected"}
      </div>

      <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 uppercase flex items-center gap-3 drop-shadow-sm">
        <Swords size={40} className="text-yellow-500"/> Coliseum 1000x
      </h1>

      {/* 상태별 화면 */}
      {status === 'IDLE' && (
        <button 
          onClick={joinQueue}
          disabled={!isConnected}
          className={`px-10 py-5 text-2xl font-black rounded-xl shadow-lg transition transform active:scale-95 ${isConnected ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:scale-105 animate-pulse' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
        >
          {isConnected ? "ENTER ARENA (Join Queue)" : "Connecting..."}
        </button>
      )}

      {status === 'WAITING' && (
        <div className="text-center p-8 bg-slate-900/50 rounded-2xl border border-slate-700 w-full max-w-md">
          <div className="loader border-t-4 border-yellow-500 rounded-full w-16 h-16 animate-spin mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-white mb-2">Searching for Opponent...</p>
          <div className="text-slate-400 flex flex-col gap-2 items-center text-sm bg-black/20 p-4 rounded-lg">
             <span className="flex items-center gap-2"><Users size={16}/> Waiting for Player 2...</span>
             <span className="text-yellow-500 font-bold">⚠️ Tip: Open another tab to simulate Player 2!</span>
          </div>
        </div>
      )}

      {(status === 'MATCHED' || status === 'PLAYING' || status === 'FINISHED') && room && me && opponent && (
        <div className="w-full animate-in fade-in zoom-in duration-300">
          {/* 상단 정보 */}
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl mb-6 border border-slate-700 shadow-lg">
             <div className={`text-3xl font-mono font-bold flex items-center gap-2 ${timeLeft <= 3 && status === 'PLAYING' ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                <Timer /> {status === 'FINISHED' ? '0' : timeLeft}s
             </div>
             <div className="text-xl font-bold text-slate-300">
                BTC: <span className="text-white">${price.toLocaleString()}</span>
             </div>
          </div>

          {/* 대결 구도 */}
          <div className="grid grid-cols-2 gap-4 md:gap-8 relative">
            
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white font-black text-2xl w-14 h-14 rounded-full flex items-center justify-center border-4 border-slate-900 z-10 shadow-xl">
                VS
            </div>

            {/* 나 (왼쪽) */}
            <div className={`p-6 rounded-2xl border-4 ${me.pnl >= opponent.pnl ? 'border-green-500 bg-green-900/10' : 'border-red-500 bg-red-900/10'} flex flex-col items-center transition-all`}>
                <div className="text-blue-400 font-bold mb-2 bg-blue-900/30 px-3 py-1 rounded-full text-sm">YOU</div>
                <div className={`text-5xl font-black mb-6 ${me.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {me.pnl > 0 ? '+' : ''}{me.pnl.toFixed(1)}%
                </div>
                
                {status === 'MATCHED' && !me.isReady ? (
                    <div className="flex flex-col w-full gap-3 animate-pulse">
                        <button onClick={() => selectSide('LONG')} className="w-full py-4 bg-green-600 rounded-xl font-black text-xl hover:bg-green-500 flex items-center justify-center gap-2 shadow-lg transition hover:-translate-y-1">
                           <TrendingUp /> LONG
                        </button>
                        <button onClick={() => selectSide('SHORT')} className="w-full py-4 bg-red-600 rounded-xl font-black text-xl hover:bg-red-500 flex items-center justify-center gap-2 shadow-lg transition hover:-translate-y-1">
                           <TrendingDown /> SHORT
                        </button>
                    </div>
                ) : (
                    <div className={`text-2xl font-black px-6 py-3 rounded-xl border-2 ${me.side === 'LONG' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>
                        {me.side} <span className="text-slate-500 text-sm ml-1">x1000</span>
                    </div>
                )}
            </div>

            {/* 상대방 (오른쪽) */}
            <div className={`p-6 rounded-2xl border-4 ${opponent.pnl > me.pnl ? 'border-green-500 bg-green-900/10' : 'border-slate-700 bg-slate-800/10'} flex flex-col items-center`}>
                <div className="text-red-400 font-bold mb-2 bg-red-900/30 px-3 py-1 rounded-full text-sm">OPPONENT</div>
                <div className="text-5xl font-black mb-6 text-slate-500 blur-sm select-none">
                    {status === 'MATCHED' ? '???' : `${opponent.pnl > 0 ? '+' : ''}${opponent.pnl.toFixed(1)}%`}
                </div>
                
                <div className="text-xl font-bold bg-slate-800 px-6 py-3 rounded-xl opacity-50">
                    {status === 'MATCHED' ? (opponent.isReady ? 'READY' : 'CHOOSING...') : opponent.side}
                </div>
            </div>
          </div>

          {/* 결과 화면 */}
          {status === 'FINISHED' && (
            <div className="mt-8 text-center animate-bounce">
                {room.winnerId === myId ? (
                    <div className="text-6xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
                        🏆 VICTORY!
                    </div>
                ) : room.winnerId === 'DRAW' ? (
                    <div className="text-6xl font-black text-slate-400">
                        🤝 DRAW
                    </div>
                ) : (
                    <div className="text-6xl font-black text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">
                        💀 DEFEATED
                    </div>
                )}
                <button onClick={resetGame} className="mt-8 px-10 py-4 bg-white text-black font-black text-xl rounded-full hover:scale-105 transition shadow-xl">
                    Play Again
                </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}