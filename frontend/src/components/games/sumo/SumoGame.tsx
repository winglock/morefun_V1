import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3001/sumo';

export default function SumoGame() {
  const [position, setPosition] = useState(0); // -100 ~ 100
  const [winner, setWinner] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io(BACKEND_URL);

    socketRef.current.on('game_update', (data: any) => {
      setPosition(data.position);
      setWinner(data.winner);
    });

    socketRef.current.on('game_reset', () => {
      setWinner(null);
      setPosition(0);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleReset = () => {
    socketRef.current.emit('reset_game');
  };

  // 위치를 퍼센트(%)로 변환 (UI 표시용)
  // position이 -100이면 left 0%, 0이면 left 50%, 100이면 left 100%
  const uiPosition = 50 + (position / 2);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-slate-900 rounded-xl border border-slate-700">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">🤼 Orderbook Sumo (BTC/USDT)</h2>

      {/* 경기장 (Progress Bar 형태) */}
      <div className="relative w-full h-24 bg-slate-800 rounded-full overflow-hidden border-4 border-slate-600 shadow-inner">

        {/* 중앙선 */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/20 z-0"></div>

        {/* 배경 색상 (왼쪽 Red / 오른쪽 Green) */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 via-transparent to-green-900/50"></div>

        {/* 스모 선수 (움직이는 원) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-100 ease-linear z-10 flex flex-col items-center"
          style={{ left: `${uiPosition}%` }}
        >
          <div className="text-4xl transform -translate-x-1/2">
            🥋
          </div>
          <div className="text-xs font-mono text-white bg-black/50 px-1 rounded -translate-x-1/2 mt-1">
            {position.toFixed(1)}
          </div>
        </div>
      </div>

      {/* 상태 표시 및 컨트롤 */}
      <div className="mt-8 text-center space-y-4">
        {winner ? (
          <div className="animate-bounce">
            <h3 className={`text-4xl font-black ${winner === 'GREEN' ? 'text-green-500' : 'text-red-500'}`}>
              {winner} TEAM WINS!
            </h3>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white font-bold"
            >
              Restart Round
            </button>
          </div>
        ) : (
          <p className="text-slate-400">
            Real-time Binance Orderbook Pressure
            <br />
            <span className="text-red-400">Seller (Short)</span> vs <span className="text-green-400">Buyer (Long)</span>
          </p>
        )}
      </div>
    </div>
  );
}
