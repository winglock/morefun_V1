import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { TrendingUp, TrendingDown, XCircle, Wallet, Zap } from 'lucide-react';

const BACKEND_URL = 'http://localhost:3001/rektrace';

interface Player {
  id: string;
  balance: number;
  positionSize: number;
  leverage: number;
  totalEquity: number;
  roi: number;
  positionType: 'LONG' | 'SHORT' | 'NONE';
  entryPrice: number;
  lastPnL: number;
}

export default function RektGame() {
  const [price, setPrice] = useState(0);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRacing, setIsRacing] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // UI 상태값
  const [betPercent, setBetPercent] = useState(50); // 투자 비율
  const [leverage, setLeverage] = useState(50);     // 레버리지
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [lastTradeResult, setLastTradeResult] = useState(0);

  const socketRef = useRef<any>(null);

  // 1. 소켓 연결
  useEffect(() => {
    socketRef.current = io(BACKEND_URL);

    socketRef.current.on('game_update', (data: any) => {
      setPrice(data.price);
      setLeaderboard(data.leaderboard);
    });

    socketRef.current.on('trade_closed', () => {
      setShowResultPopup(true);
      setTimeout(() => setShowResultPopup(false), 3000);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // 2. 타이머 로직
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRacing && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRacing(false);
      setIsGameOver(true);
    }
    return () => clearInterval(interval);
  }, [isRacing, timeLeft]);

  // 내 데이터 찾기
  const myData = leaderboard.find(p => p.id === socketRef.current?.id);
  const myEquity = myData?.totalEquity || 1000;
  const myBalance = myData?.balance || 1000;
  const myRoi = myData?.roi || 0;

  // 팝업 데이터 갱신
  useEffect(() => {
    if (myData) setLastTradeResult(myData.lastPnL);
  }, [myData?.lastPnL]);

  // 트레이딩 핸들러
  const handleTrade = (type: 'LONG' | 'SHORT' | 'CLOSE') => {
    if (isGameOver && type !== 'CLOSE') return;
    if (!isRacing && !isGameOver && type !== 'CLOSE') setIsRacing(true);

    if (type === 'CLOSE') {
      socketRef.current.emit('trade_action', { type });
    } else {
      const betAmount = Math.floor(myBalance * (betPercent / 100));
      if (betAmount <= 0) return alert("잔고가 부족합니다!");
      
      socketRef.current.emit('trade_action', { 
        type, 
        amount: betAmount, 
        leverage: leverage 
      });
    }
  };

  const resetGame = () => window.location.reload();
  const calculatedBetAmount = Math.floor(myBalance * (betPercent / 100));

  return (
    <div className="max-w-2xl mx-auto p-4 text-center relative font-sans text-white">
      
      {/* 결과 팝업 */}
      {showResultPopup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className={`px-10 py-8 rounded-2xl border-4 shadow-2xl ${lastTradeResult >= 0 ? 'bg-green-900 border-green-400' : 'bg-red-900 border-red-400'}`}>
            <div className="text-white text-xl font-bold mb-2">Trade Closed</div>
            <div className={`text-5xl font-black ${lastTradeResult >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {lastTradeResult >= 0 ? '+' : ''}{lastTradeResult.toFixed(2)}
            </div>
            <div className="text-sm text-slate-300 mt-2">PnL Realized</div>
          </div>
        </div>
      )}

      {/* 상단 정보창 */}
      <div className="flex justify-between items-center mb-6 bg-slate-900 p-5 rounded-xl border border-slate-700 shadow-lg">
        <div className="text-left">
           <div className="text-xs text-slate-400 font-bold mb-1">TIME LEFT</div>
           <div className={`text-3xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
             00:{timeLeft.toString().padStart(2, '0')}
           </div>
        </div>
        <div className="text-right">
           <div className="text-xs text-slate-400 font-bold mb-1">TOTAL EQUITY</div>
           <div className={`text-3xl font-mono font-bold ${myRoi < 0 ? 'text-green-400' : 'text-white'}`}>
             ${myEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
           </div>
        </div>
      </div>

      <div className="mb-2 text-slate-400 text-sm font-bold tracking-widest">BTC/USDT LIVE PRICE</div>
      <div className="text-6xl font-black text-white mb-8 tracking-tighter drop-shadow-lg">
        ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>

      {isGameOver ? (
        <div className="bg-slate-800 p-8 rounded-2xl border-2 border-red-500 mb-8 animate-bounce">
          <h2 className="text-4xl font-black mb-2 text-white">🏁 TIME'S UP!</h2>
          <button onClick={resetGame} className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition shadow-lg mt-4">
             Try Again
          </button>
        </div>
      ) : (
        <div className="mb-8">
           {/* [A] 포지션이 없을 때: 베팅 컨트롤 패널 */}
           {!myData || myData.positionType === 'NONE' ? (
             <div className="space-y-4">
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 shadow-inner space-y-4">
                    
                    {/* 1. 금액 슬라이더 */}
                    <div>
                        <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
                            <span className="flex items-center gap-2">
                              <Wallet size={14} className="text-blue-400"/> 
                              Avail: <span className="text-white font-mono">${myBalance.toFixed(0)}</span>
                            </span>
                            <span className="text-blue-400 font-bold">{betPercent}%</span>
                        </div>
                        <input 
                            type="range" min="1" max="100" value={betPercent} 
                            onChange={(e) => setBetPercent(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    {/* 2. 레버리지 슬라이더 */}
                    <div>
                        <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
                            <span className="flex items-center gap-2">
                              <Zap size={14} className="text-yellow-400"/> 
                              Leverage
                            </span>
                            <span className="text-yellow-400 font-black text-lg">{leverage}x</span>
                        </div>
                        <input 
                            type="range" min="1" max="100" value={leverage} 
                            onChange={(e) => setLeverage(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                    </div>

                    <div className="pt-2 border-t border-slate-700 mt-2 text-center">
                        <span className="text-slate-400 text-sm mr-2">Est. Position:</span>
                        <span className="text-xl font-bold text-white">${(calculatedBetAmount * leverage).toLocaleString()}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleTrade('LONG')} className="h-28 rounded-xl bg-gradient-to-br from-green-600 to-green-800 hover:scale-[1.02] transition shadow-lg border-b-4 border-green-900 active:border-b-0 active:translate-y-1">
                        <TrendingUp size={36} className="text-green-100 mx-auto"/>
                        <span className="text-2xl font-black text-white block">LONG</span>
                    </button>
                    
                    <button onClick={() => handleTrade('SHORT')} className="h-28 rounded-xl bg-gradient-to-br from-red-600 to-red-800 hover:scale-[1.02] transition shadow-lg border-b-4 border-red-900 active:border-b-0 active:translate-y-1">
                        <TrendingDown size={36} className="text-red-100 mx-auto"/>
                        <span className="text-2xl font-black text-white block">SHORT</span>
                    </button>
                </div>
             </div>
           ) : (
             /* [B] 포지션이 있을 때: 상세 정보 및 청산 버튼 */
             <div className="space-y-4">
                <button 
                    onClick={() => handleTrade('CLOSE')}
                    className="w-full h-24 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 hover:bg-slate-700 border-2 border-slate-500 shadow-lg flex items-center justify-center gap-4 transition-all"
                >
                    <XCircle size={40} className="text-slate-300"/>
                    <div className="text-left">
                        <div className="text-2xl font-black text-white">CLOSE POSITION</div>
                        <div className="text-sm text-slate-300">Click to Realize PnL</div>
                    </div>
                </button>

                <div className="bg-slate-900 rounded-xl p-5 border border-slate-700 grid grid-cols-2 gap-y-4 text-sm relative overflow-hidden shadow-lg">
                    {/* 포지션 사이드바 표시 */}
                    <div className={`absolute top-0 left-0 w-2 h-full ${myData.positionType === 'LONG' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    
                    <div className="flex flex-col text-left pl-4">
                        <span className="text-slate-500 text-xs font-bold uppercase">Side & Lev</span>
                        <div className={`font-black text-xl ${myData.positionType === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                            {myData.positionType} <span className="text-white text-sm bg-slate-800 px-2 rounded">x{myData.leverage}</span>
                        </div>
                    </div>

                    <div className="flex flex-col text-right">
                        <span className="text-slate-500 text-xs font-bold uppercase">Position Size</span>
                        <div className="font-mono font-bold text-white text-xl">
                            ${(myData.positionSize * myData.leverage).toLocaleString()}
                        </div>
                    </div>

                    <div className="flex flex-col text-left pl-4">
                         <span className="text-slate-500 text-xs font-bold uppercase">Entry Price</span>
                         <div className="font-mono text-slate-300 text-lg">
                             ${myData.entryPrice.toLocaleString()}
                         </div>
                    </div>

                    <div className="flex flex-col text-right">
                         <span className="text-slate-500 text-xs font-bold uppercase">Unrealized PnL</span>
                         <div className={`font-mono font-bold text-2xl ${(myData.totalEquity - myData.balance - myData.positionSize) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                             {(myData.totalEquity - myData.balance - myData.positionSize).toFixed(2)}
                         </div>
                    </div>
                </div>
             </div>
           )}
        </div>
      )}

      {/* 리더보드 */}
      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="p-4 bg-slate-800 font-bold text-slate-400 border-b border-slate-700 flex justify-between">
            <span>🏆 LIVE LOSERBOARD</span>
            <span className="text-xs opacity-50 font-normal">Rank by Lowest ROI</span>
        </div>
        <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto">
            {leaderboard.map((p, idx) => {
              const isMe = p.id === socketRef.current?.id;
              return (
                <div key={p.id} className={`flex justify-between items-center p-4 ${isMe ? 'bg-white/10' : ''}`}>
                    <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${idx < 3 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-700 text-slate-400'}`}>
                            {idx + 1}
                        </span>
                        <div className="flex flex-col text-left">
                            <span className="text-sm font-mono text-slate-300 font-bold">
                               {p.id.slice(0, 6)}... 
                            </span>
                            {isMe && <span className="text-[10px] text-blue-400 font-bold tracking-wider">YOU</span>}
                        </div>
                    </div>
                    <div className={`font-mono font-bold text-lg ${p.roi < 0 ? 'text-green-400' : 'text-red-500'}`}>
                        {p.roi > 0 ? '+' : ''}{p.roi.toFixed(2)}%
                    </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  );
}