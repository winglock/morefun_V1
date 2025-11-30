import React from 'react';
import Link from "next/link";
import WalletConnect from "../components/shared/WalletConnect";

export default function Home() {
  const games = [
    { name: "☠️ Death Fun", path: "/deathfun", desc: "지뢰를 피해 끝까지 살아남으세요.", active: true },
    { name: "🤼 Sumo Orderbook", path: "/sumo", desc: "매수 vs 매도, 오더북 힘겨루기!", active: true },
    { name: "📉 Rekt Race", path: "/rektrace", desc: "가장 낮은 수익률(-%)이 승리한다.", active: true },
    { name: "💣 Tick Tock Bomb", path: "/bomb", desc: "터지기 전에 폭탄을 넘기세요.", active: true },
    { name: "⚔️ Coliseum", path: "/coliseum", desc: "1000x 레버리지 단판 승부.", active: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-slate-800">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          MOREFUN
        </h1>
        <WalletConnect />
      </header>

      {/* Game List */}
      <main className="p-8 max-w-6xl mx-auto">
        <h2 className="text-xl text-slate-400 mb-6">Choose Your Game</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link key={game.path} href={game.active ? game.path : "#"}>
              <div className={`
                p-6 rounded-xl border border-slate-800 transition-all
                ${game.active
                  ? 'bg-slate-900 hover:bg-slate-800 hover:border-blue-500 cursor-pointer hover:-translate-y-1 shadow-lg'
                  : 'bg-slate-900/50 opacity-50 cursor-not-allowed grayscale'}
              `}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold">{game.name}</h3>
                  {!game.active && <span className="text-xs bg-slate-700 px-2 py-1 rounded">Coming Soon</span>}
                </div>
                <p className="text-slate-400">{game.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
