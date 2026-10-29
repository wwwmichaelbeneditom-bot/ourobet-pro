import React, { useState } from 'react';
import { CircleDot, Sparkles, Zap, Award } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';

export const CoinFlipGame: React.FC = () => {
  const { currentUser, placeBet, winBet, loseBet, adminSettings, currencySymbol, formatMoney } = useGame();
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [resultSide, setResultSide] = useState<'heads' | 'tails' | null>(null);

  const handleFlip = () => {
    if (isFlipping) return;
    const res = placeBet('coinflip', betAmount);
    if (!res.success) return;

    setIsFlipping(true);
    setResultSide(null);

    // Audio ticks during flip
    const tickInterval = setInterval(() => {
      soundFx.playRouletteTick(520);
    }, 150);

    setTimeout(() => {
      clearInterval(tickInterval);
      const isHeads = Math.random() > 0.5;
      const outcome: 'heads' | 'tails' = isHeads ? 'heads' : 'tails';
      setResultSide(outcome);
      setIsFlipping(false);

      if (outcome === selectedSide) {
        // Payout 1.95x (House takes 5% rake)
        const payout = Number((betAmount * 1.95).toFixed(2));
        winBet('coinflip', betAmount, 1.95, payout);
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch {
          // Ignored
        }
      } else {
        loseBet('coinflip', betAmount);
        soundFx.playCrash();
      }
    }, 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col items-center space-y-5">
      <div className="text-center space-y-1">
        <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
          <CircleDot className="w-4 h-4 text-amber-400" />
          Duelo da Moeda (Cara ou Coroa)
        </h3>
        <p className="text-xs text-slate-400">Multiplicador de 1.95x • Taxa da Casa: 5%</p>
      </div>

      {/* 3D Coin Display */}
      <div className="py-6 flex flex-col items-center">
        <div
          className={`w-28 h-28 rounded-full border-4 flex items-center justify-center font-black text-2xl shadow-2xl transition-all duration-300 ${
            isFlipping
              ? 'animate-spin border-amber-400 bg-amber-500/20 text-amber-300 scale-110'
              : resultSide === 'heads' || (!resultSide && selectedSide === 'heads')
              ? 'border-amber-400 bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 glow-amber'
              : 'border-cyan-400 bg-gradient-to-tr from-cyan-500 to-blue-400 text-slate-950 glow-cyan'
          }`}
        >
          {isFlipping ? (
            <Sparkles className="w-10 h-10 animate-pulse text-amber-300" />
          ) : resultSide ? (
            resultSide === 'heads' ? 'CARA' : 'COROA'
          ) : selectedSide === 'heads' ? (
            'CARA'
          ) : (
            'COROA'
          )}
        </div>

        {resultSide && !isFlipping && (
          <div className="mt-4 text-xs font-bold uppercase tracking-wider">
            {resultSide === selectedSide ? (
              <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                <Award className="w-4 h-4" /> Você Ganhou {formatMoney(betAmount * 1.95)}!
              </span>
            ) : (
              <span className="text-rose-400">Você Perdeu a Moeda</span>
            )}
          </div>
        )}
      </div>

      {/* Side Selector */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        <button
          type="button"
          disabled={isFlipping}
          onClick={() => setSelectedSide('heads')}
          className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition border ${
            selectedSide === 'heads'
              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black glow-amber'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
          }`}
        >
          Escolher Cara
        </button>
        <button
          type="button"
          disabled={isFlipping}
          onClick={() => setSelectedSide('tails')}
          className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition border ${
            selectedSide === 'tails'
              ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md font-black glow-cyan'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
          }`}
        >
          Escolher Coroa
        </button>
      </div>

      {/* Bet Amount Input */}
      <div className="w-full max-w-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">Valor da Aposta (Mín {currencySymbol} 2 / Máx {currencySymbol} 85)</span>
          <span className="font-mono text-slate-400">
            Saldo: <strong className="text-white">{formatMoney(currentUser.balance)}</strong>
          </span>
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
            {currencySymbol}
          </span>
          <input
            type="number"
            disabled={isFlipping}
            min={adminSettings.minBet || 2}
            max={adminSettings.maxBet || 85}
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(adminSettings.minBet || 2, Math.min(adminSettings.maxBet || 85, Number(e.target.value))))}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm font-bold text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Chips (Mín 2 / Máx 85) */}
        <div className="grid grid-cols-6 gap-1">
          {[2, 5, 10, 25, 50, 85].map((v) => (
            <button
              key={v}
              type="button"
              disabled={isFlipping}
              onClick={() => setBetAmount(v)}
              className={`py-1 text-xs font-semibold rounded-lg transition ${
                betAmount === v
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Half and Double */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            type="button"
            disabled={isFlipping}
            onClick={() => setBetAmount((prev) => Math.max(adminSettings.minBet || 2, Math.floor(prev / 2)))}
            className="py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold"
          >
            /2 (Metade)
          </button>
          <button
            type="button"
            disabled={isFlipping}
            onClick={() => setBetAmount((prev) => Math.min(adminSettings.maxBet || 85, prev * 2))}
            className="py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold"
          >
            2X (Dobro)
          </button>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={isFlipping}
        onClick={handleFlip}
        className="w-full max-w-xs py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] text-slate-950 font-black rounded-xl shadow-lg shadow-amber-400/25 text-sm uppercase tracking-wide transition flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        <Zap className="w-4 h-4 fill-current" />
        <span>{isFlipping ? 'Girando a Moeda...' : `Girar Moeda (${formatMoney(betAmount)})`}</span>
      </button>
    </div>
  );
};
