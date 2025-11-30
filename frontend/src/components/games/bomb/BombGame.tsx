import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Bomb, Skull, ShieldCheck, Coins, Users, Activity } from 'lucide-react';

const BACKEND_URL = 'http://localhost:3001/bomb';

interface Player {
  id: string;
  name: string;
  balance: number;
  roundProfit: number;
  isDead: boolean;
}

export default function BombGame() {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [isExploded, setIsExploded] = useState(false);
  const [msg, setMsg] = useState("Waiting for players...");
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<any>(null);
  const myId = socketRef.current?.id;

  useEffect(() => {
    socketRef.current = io(BACKEND_URL);

    socketRef.current.on('connect', () => {
      console.log("✅ Bomb Game Connected!");
      setIsConnected(true);
      setMsg("Ready to Start");
    });

    socketRef.current.on('disconnect', () => {
      console.log("❌ Bomb Game Disconnected");
      setIsConnected(false);
      setMsg("Connection Lost...");
    });

    socketRef.current.on('error_msg', (error: string) => {
      alert(`⚠️ ${error}`);
    });

    socketRef.current.on('game_update', (data: any) => {
      setPlayers(data.players);
    });
    
    socketRef.current.on('game_exploded', (data: any) => {
      setIsExploded(true);
      setPlayers(data.players);
      setMsg("BOOM! 💥");
      
      setTimeout(() => {
        setIsExploded(false);
        setMsg("Ready for next round");
      }, 3000);
    });

    socketRef.current.on('game_start_announce', () => {
      setIsExploded(false);
      setMsg("PASS THE BOMB! 😡");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleStart = () => {
    if (!isConnected) return alert("서버와 연결되지 않았습니다. 백엔드를 확인하세요.");
    socketRef.current.emit('start_game');
  };

  const handlePass = () => {
    socketRef.current.emit('pass_bomb');
  };

  const playerList = Object.values(players);
  const currentHolder = playerList.reduce((prev, current) => {
    if (prev.isDead) return current;
    if (current.isDead) return prev;
    return (prev.roundProfit > current.roundProfit) ? prev : current;
  }, playerList[0] || { roundProfit: -1 });
  
  const isGameRunning = playerList.some(p => p.roundProfit > 0);
  const amIHolder = currentHolder?.id === myId && isGameRunning;

  return (
    <div className="max-w-md mx-auto p-4 text-center min-h-screen flex flex-col items-center justify-center font-sans text-white">
      
      {/* 연결 상태 배지 */}
      <div className={`fixed top-4 right-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border ${isConnected ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400'}`}>
        <Activity size={12} className={isConnected ? "animate-pulse" : ""} />
        {isConnected ? "Server Online" : "Disconnected"}
      </div>

      <h2 className="text-3xl font-black mb-8 animate-pulse text-red-500 drop-shadow-lg uppercase">
        {msg}
      </h2>

      <div className={`mb-10 transition-all duration-300 ${isGameRunning ? 'scale-110' : 'scale-100'}`}>
        {isExploded ? (
          <div className="text-9xl animate-ping">💥</div>
        ) : (
          <div className={`relative ${isGameRunning ? 'animate-bounce' : ''}`}>
            <Bomb size={120} className={isGameRunning ? "text-red-500 filter drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" : "text-slate-600"} />
            {isGameRunning && (
               <span className="absolute -top-4 -right-4 text-yellow-400 font-bold text-xl animate-pulse bg-black/50 px-2 rounded-full border border-yellow-400">
                 +10%/s
               </span>
            )}
          </div>
        )}
      </div>

      {isGameRunning ? (
        amIHolder ? (
          <button 
            onClick={handlePass}
            className="w-full py-8 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-3xl rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.6)] active:scale-95 transition-all mb-8 border-4 border-red-400 animate-pulse"
          >
            PASS BOMB! 🤬
          </button>
        ) : (
          <div className="w-full py-6 bg-slate-800/50 text-slate-400 font-bold text-xl rounded-xl mb-8 border border-slate-700 backdrop-blur-sm">
            {currentHolder?.name} has the bomb... 🙏
          </div>
        )
      ) : (
        <button 
          onClick={handleStart}
          disabled={!isConnected}
          className={`px-10 py-4 font-bold text-xl rounded-full mb-8 shadow-lg transition-transform hover:scale-105 flex items-center gap-2 ${isConnected ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
        >
          {isConnected ? "START ROUND (with 10 Bots 🤖)" : "Connecting to Server..."}
        </button>
      )}

      <div className="w-full bg-slate-900/80 rounded-xl overflow-hidden border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="p-3 bg-slate-800/80 font-bold text-slate-400 flex justify-between items-center">
            <span className="flex items-center gap-2"><Users size={16}/> PLAYERS ({playerList.length})</span>
            <span className="text-xs font-normal bg-slate-700 px-2 py-1 rounded">Last Man Standing</span>
        </div>
        <div className="divide-y divide-slate-700/50 max-h-60 overflow-y-auto">
          {playerList.map(p => {
            const isMe = p.id === myId;
            const isThisHolder = p.id === currentHolder?.id && isGameRunning;
            
            return (
              <div key={p.id} className={`flex justify-between items-center p-3 transition-colors ${isThisHolder ? 'bg-red-500/20' : ''} ${p.isDead ? 'opacity-40 grayscale bg-black/40' : ''}`}>
                <div className="flex items-center gap-3">
                  {p.isDead ? <Skull className="text-slate-500"/> : isThisHolder ? <Bomb className="text-red-500 animate-pulse"/> : <ShieldCheck className="text-green-500"/>}
                  <div className="text-left">
                    <div className="text-white font-bold text-sm flex items-center gap-1">
                      {p.name} {isMe && <span className="text-[10px] bg-blue-500 px-1 rounded text-white">YOU</span>}
                    </div>
                    <div className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Coins size={10}/> ${p.balance.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">Unrealized PnL</div>
                  <div className={`font-mono font-bold text-lg ${p.roundProfit > 0 ? 'text-yellow-400' : 'text-slate-600'}`}>
                    +${p.roundProfit.toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })}
          {playerList.length === 0 && (
            <div className="p-4 text-slate-500 text-sm">
               Waiting for server connection...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}