import React from 'react';
import { useDeathFun } from './useGame'; // 같은 폴더라서 ./ 사용

export default function DeathFunBoard() {
  const { gameState, gameOver, startGame, selectTile } = useDeathFun();

  // 5개의 층, 각 층 4개 타일 렌더링을 위한 헬퍼
  // UI상으로는 아래에서 위로 올라가야 하므로 reverse() 고려 필요 (여기선 단순화)
  const levels = [4, 3, 2, 1, 0]; // 0이 1층(바닥)

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-2xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400">☠️ DEATH FUN</h2>

      <div className="space-y-2 mb-6">
        {levels.map((levelIndex) => {
          const isActive = gameState?.currentLevel === levelIndex;
          const isPast = gameState?.currentLevel > levelIndex;

          return (
            <div
              key={levelIndex}
              className={`flex gap-2 justify-center p-2 rounded ${
                isActive ? 'bg-slate-800 border border-yellow-500' : ''
              }`}
            >
              {[0, 1, 2, 3].map((tileIndex) => {
                // 이미 지나온 층의 선택 여부
                const isSelectedHistory = gameState?.history?.[levelIndex] === tileIndex;

                // 폭발한 경우 해골 표시
                const isExploded =
                  gameOver &&
                  gameState?.bombIndex === tileIndex &&
                  gameState?.currentLevel === levelIndex;

                return (
                  <button
                    key={tileIndex}
                    disabled={!isActive || gameOver}
                    onClick={() => selectTile(tileIndex)}
                    className={`
                      w-16 h-16 rounded-lg font-bold text-xl transition-all
                      ${isExploded ? 'bg-red-600 animate-pulse' : ''}
                      ${
                        isSelectedHistory
                          ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]'
                          : 'bg-slate-700'
                      }
                      ${
                        isActive && !gameOver
                          ? 'hover:bg-slate-600 cursor-pointer hover:scale-105'
                          : 'cursor-default'
                      }
                    `}
                  >
                    {isExploded ? '💀' : isSelectedHistory ? '💎' : '?'}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="text-center">
        {(!gameState || gameOver) && (
          <button
            onClick={startGame}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-lg shadow-lg transition-transform active:scale-95"
          >
            {gameOver && gameState?.status !== 'WON' ? 'TRY AGAIN' : 'GAME START'}
          </button>
        )}

        {gameState?.status === 'WON' && (
          <div className="mt-4 text-yellow-400 font-bold text-xl animate-bounce">
            🎉 YOU SURVIVED! 🎉
          </div>
        )}
      </div>
    </div>
  );
}
