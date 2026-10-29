import React, { useState, useEffect, useRef, useCallback } from 'react';
import { History, Sparkles, ShieldAlert, Zap, Timer } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface BetOnColor {
  red: number;
  white: number;
  black: number;
}

export const RouletteGame: React.FC = () => {
  const {
    currentUser,
    placeBet,
    winBet,
    loseBet,
    adminSettings,
    adminUpdateSettings,
    rouletteHistory,
    addRouletteHistory,
    isAdminView,
    currencySymbol,
    formatMoney,
  } = useGame();

  const [gameState, setGameState] = useState<'betting' | 'spinning' | 'result'>('betting');
  const [countdown, setCountdown] = useState<number>(8);
  const [userBets, setUserBets] = useState<BetOnColor>({ red: 0, white: 0, black: 0 });
  const [chipAmount, setChipAmount] = useState<number>(10);
  const [winningItem, setWinningItem] = useState<{ color: 'red' | 'black' | 'white'; number: number } | null>(null);
  const [wheelOffset, setWheelOffset] = useState<number>(0);

  // Wheel tiles sequence (standard Double 15 numbers: 0=white, 1-7=red, 8-14=black)
  const wheelSequence = [
    { color: 'white', number: 0 },
    { color: 'red', number: 1 },
    { color: 'black', number: 8 },
    { color: 'red', number: 2 },
    { color: 'black', number: 9 },
    { color: 'red', number: 3 },
    { color: 'black', number: 10 },
    { color: 'red', number: 4 },
    { color: 'black', number: 11 },
    { color: 'red', number: 5 },
    { color: 'black', number: 12 },
    { color: 'red', number: 6 },
    { color: 'black', number: 13 },
    { color: 'red', number: 7 },
    { color: 'black', number: 14 },
  ] as const;

  // We repeat the sequence multiple times for seamless scrolling
  const repeatedWheel = Array.from({ length: 8 }).flatMap(() => wheelSequence);
  const TILE_WIDTH = 70; // px

  // Decide winner based on admin override or fair RNG
  const decideWinningTile = useCallback((): { color: 'red' | 'black' | 'white'; number: number } => {
    // 1. Admin forced result
    if (adminSettings.roulette.nextResult) {
      const forcedColor = adminSettings.roulette.nextResult;
      // Reset admin override
      adminUpdateSettings({
        roulette: {
          ...adminSettings.roulette,
          nextResult: null,
        }
      });

      if (forcedColor === 'white') {
        return { color: 'white', number: 0 };
      }
      if (forcedColor === 'red') {
        const redNums = [1, 2, 3, 4, 5, 6, 7];
        return { color: 'red', number: redNums[Math.floor(Math.random() * redNums.length)] };
      }
      const blackNums = [8, 9, 10, 11, 12, 13, 14];
      return { color: 'black', number: blackNums[Math.floor(Math.random() * blackNums.length)] };
    }

    // 2. Standard RNG (White: ~1/15, Red: 7/15, Black: 7/15)
    const roll = Math.floor(Math.random() * 15);
    return wheelSequence[roll];
  }, [adminSettings.roulette, adminUpdateSettings, wheelSequence]);

  // Round loop
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === 'betting') {
      setCountdown(8);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Switch to spinning
            setGameState('spinning');
            return 0;
          }
          soundFx.playRouletteTick(350);
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }

    if (gameState === 'spinning') {
      const winner = decideWinningTile();
      setWinningItem(winner);

      // Find an occurrence of the winner around the 5th repeat
      const targetRepeatIndex = 5;
      const indexInSequence = wheelSequence.findIndex(
        (w) => w.color === winner.color && w.number === winner.number
      );
      const targetTileIndex = targetRepeatIndex * wheelSequence.length + indexInSequence;

      // Add a slight random jitter within the tile (-15px to +15px)
      const jitter = (Math.random() - 0.5) * 30;
      const targetScroll = targetTileIndex * TILE_WIDTH + jitter;

      setWheelOffset(targetScroll);

      // Spin audio ticks
      const tickInterval = setInterval(() => {
        soundFx.playRouletteTick(450);
      }, 180);

      // Spin duration
      timer = setTimeout(() => {
        clearInterval(tickInterval);
        setGameState('result');
      }, 4200);

      return () => {
        clearTimeout(timer);
        clearInterval(tickInterval);
      };
    }

    if (gameState === 'result' && winningItem) {
      addRouletteHistory(winningItem.color, winningItem.number);

      // Calculate player payouts
      const betRed = userBets.red;
      const betWhite = userBets.white;
      const betBlack = userBets.black;
      const totalBetPlaced = betRed + betWhite + betBlack;

      let won = false;
      let totalPayout = 0;

      if (winningItem.color === 'red' && betRed > 0) {
        won = true;
        totalPayout += betRed * 2;
      }
      if (winningItem.color === 'black' && betBlack > 0) {
        won = true;
        totalPayout += betBlack * 2;
      }
      if (winningItem.color === 'white' && betWhite > 0) {
        won = true;
        totalPayout += betWhite * 14;
      }

      if (won) {
        winBet('roulette', totalBetPlaced, winningItem.color === 'white' ? 14 : 2, totalPayout);
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {
          // Ignored
        }
      } else if (totalBetPlaced > 0) {
        loseBet('roulette', totalBetPlaced);
      }

      // Reset for next betting phase
      timer = setTimeout(() => {
        setUserBets({ red: 0, white: 0, black: 0 });
        setGameState('betting');
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [gameState, decideWinningTile, addRouletteHistory, winningItem, userBets, winBet, loseBet]);

  // Place bet on color
  const handleBetColor = (color: 'red' | 'white' | 'black') => {
    if (gameState !== 'betting') return;
    const res = placeBet('roulette', chipAmount);
    if (!res.success) return;

    setUserBets((prev) => ({
      ...prev,
      [color]: prev[color] + chipAmount,
    }));
  };

  return (
    <div className="space-y-4">
      {/* Recent History Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center text-slate-400 text-[11px] font-semibold pr-1 shrink-0">
          <History className="w-3.5 h-3.5 mr-1" />
          Giros Recentes:
        </div>
        {rouletteHistory.slice(0, 12).map((h) => (
          <div
            key={h.id}
            className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 border shadow-sm ${
              h.color === 'red'
                ? 'bg-rose-600/90 border-rose-400 text-white'
                : h.color === 'black'
                ? 'bg-slate-900 border-slate-700 text-white'
                : 'bg-amber-400 border-amber-300 text-slate-950 font-black glow-amber'
            }`}
          >
            {h.number}
          </div>
        ))}
      </div>

      {/* Main Roulette Wheel Strip Stage */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Admin Secret Rigging Indicator */}
        {isAdminView && adminSettings.roulette.nextResult && (
          <div className="absolute top-2 left-3 z-30 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1 animate-pulse">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            Rigged Roleta: Forçando {adminSettings.roulette.nextResult.toUpperCase()}
          </div>
        )}

        {/* Center Pointer / Arrow Marker */}
        <div className="absolute top-1 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
        <div className="absolute bottom-1 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[14px] border-b-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />

        {/* Center vertical indicator beam */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-amber-400/50 pointer-events-none z-10" />

        {/* Sliding Wheel Strip */}
        <div className="w-full overflow-hidden py-6 relative">
          <div
            className="flex items-center transition-transform duration-[4200ms] ease-out"
            style={{
              transform: `translateX(calc(50% - ${wheelOffset}px))`,
            }}
          >
            {repeatedWheel.map((item, idx) => (
              <div
                key={idx}
                style={{ width: `${TILE_WIDTH}px`, height: '70px' }}
                className={`flex-shrink-0 flex items-center justify-center rounded-xl border text-base font-mono font-black mx-1 shadow-md ${
                  item.color === 'red'
                    ? 'bg-gradient-to-b from-rose-500 to-rose-700 border-rose-400/80 text-white'
                    : item.color === 'black'
                    ? 'bg-gradient-to-b from-slate-800 to-slate-950 border-slate-700 text-slate-100'
                    : 'bg-gradient-to-b from-amber-300 to-amber-500 border-amber-200 text-slate-950 glow-amber'
                }`}
              >
                {item.number}
              </div>
            ))}
          </div>
        </div>

        {/* Stage Status / Countdown */}
        <div className="pt-2 text-center">
          {gameState === 'betting' && (
            <div className="flex items-center justify-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Timer className="w-4 h-4 animate-spin" />
              <span>Giro em {countdown}s • Faça suas apostas!</span>
            </div>
          )}
          {gameState === 'spinning' && (
            <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider animate-pulse">
              Girando a Roleta...
            </div>
          )}
          {gameState === 'result' && winningItem && (
            <div className="text-xs font-bold uppercase tracking-wider">
              Resultado:{' '}
              <span
                className={`font-mono font-black px-2 py-0.5 rounded text-sm ${
                  winningItem.color === 'red'
                    ? 'text-rose-400 bg-rose-500/10'
                    : winningItem.color === 'black'
                    ? 'text-slate-300 bg-slate-800'
                    : 'text-amber-300 bg-amber-500/10'
                }`}
              >
                {winningItem.number} (
                {winningItem.color === 'red'
                  ? 'Vermelho 2x'
                  : winningItem.color === 'black'
                  ? 'Preto 2x'
                  : 'Branco 14x'}
                )
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chip Selection Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">Ficha (Mín {currencySymbol} 2 / Máx {currencySymbol} 85):</span>
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
          {[2, 5, 10, 25, 50, 85].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChipAmount(c)}
              className={`w-9 h-9 rounded-full font-mono text-xs font-bold flex items-center justify-center transition border shadow-sm shrink-0 ${
                chipAmount === c
                  ? 'bg-amber-400 text-slate-950 border-amber-300 scale-105 shadow-md glow-amber font-black'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Color Betting Zones (Red 2x, White 14x, Black 2x) */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Vermelho (2x) */}
        <button
          type="button"
          disabled={gameState !== 'betting'}
          onClick={() => handleBetColor('red')}
          className="p-3.5 bg-gradient-to-b from-rose-600/90 to-rose-700 rounded-xl border border-rose-500 text-white flex flex-col items-center justify-between min-h-[95px] active:scale-95 transition shadow-lg shadow-rose-600/20 disabled:opacity-60"
        >
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-wider block">Vermelho</span>
            <span className="text-[11px] font-bold text-rose-200">Paga 2x</span>
          </div>
          <div className="w-full bg-rose-950/60 rounded-lg py-1 px-2 text-center">
            <span className="font-mono text-xs font-black">
              {formatMoney(userBets.red)}
            </span>
          </div>
        </button>

        {/* Branco (14x) */}
        <button
          type="button"
          disabled={gameState !== 'betting'}
          onClick={() => handleBetColor('white')}
          className="p-3.5 bg-gradient-to-b from-amber-400 to-amber-500 rounded-xl border border-amber-300 text-slate-950 flex flex-col items-center justify-between min-h-[95px] active:scale-95 transition shadow-lg shadow-amber-400/25 glow-amber disabled:opacity-60"
        >
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-wider block">Branco (0)</span>
            <span className="text-[11px] font-extrabold text-slate-900">Paga 14x 🔥</span>
          </div>
          <div className="w-full bg-slate-950/20 rounded-lg py-1 px-2 text-center">
            <span className="font-mono text-xs font-black">
              {formatMoney(userBets.white)}
            </span>
          </div>
        </button>

        {/* Preto (2x) */}
        <button
          type="button"
          disabled={gameState !== 'betting'}
          onClick={() => handleBetColor('black')}
          className="p-3.5 bg-gradient-to-b from-slate-800 to-slate-950 rounded-xl border border-slate-700 text-white flex flex-col items-center justify-between min-h-[95px] active:scale-95 transition shadow-lg disabled:opacity-60"
        >
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-wider block">Preto</span>
            <span className="text-[11px] font-bold text-slate-400">Paga 2x</span>
          </div>
          <div className="w-full bg-slate-900 rounded-lg py-1 px-2 text-center border border-slate-800">
            <span className="font-mono text-xs font-black text-slate-200">
              {formatMoney(userBets.black)}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
