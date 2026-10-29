import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rocket, Sparkles, TrendingUp, DollarSign, ShieldAlert, Zap, History, Users } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Crash3DPlane } from './Crash3DPlane';

interface PlayerBetInRound {
  id: string;
  name: string;
  avatar: string;
  amount: number;
  cashedOutAt?: number;
  payout?: number;
  isBot?: boolean;
}

export const CrashGame: React.FC = () => {
  const {
    currentUser,
    placeBet,
    winBet,
    loseBet,
    adminSettings,
    adminUpdateSettings,
    crashHistory,
    addCrashHistory,
    isAdminView,
    currencySymbol,
    formatMoney,
  } = useGame();

  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'flying' | 'crashed'>('waiting');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [countdown, setCountdown] = useState<number>(4);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [autoCashout, setAutoCashout] = useState<string>('2.00');
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [cashedAmount, setCashedAmount] = useState<number>(0);
  const [roundBets, setRoundBets] = useState<PlayerBetInRound[]>([]);

  const targetCrashRef = useRef<number>(2.0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate target crash point based on admin rigging or standard RTP curve
  const calculateCrashPoint = useCallback(() => {
    // 1. If admin pre-set a crash multiplier, use it!
    if (adminSettings.crash.nextCrashMultiplier !== null && adminSettings.crash.nextCrashMultiplier > 1.0) {
      const rigged = adminSettings.crash.nextCrashMultiplier;
      // Reset the one-time override in admin
      adminUpdateSettings({
        crash: {
          ...adminSettings.crash,
          nextCrashMultiplier: null,
        }
      });
      return Number(rigged.toFixed(2));
    }

    // 2. Check rig modes
    if (adminSettings.crash.rigMode === 'forced_loss') {
      return Number((1.01 + Math.random() * 0.15).toFixed(2)); // Crash right away 1.01 - 1.16x
    }
    if (adminSettings.crash.rigMode === 'forced_win') {
      return Number((10.0 + Math.random() * 25).toFixed(2));
    }

    // 3. Mathematical house edge algorithm with 60% house profit margin (40% player RTP)
    const houseEdge = (adminSettings.houseEdgePercent ?? 60) / 100;
    
    // 60% of rounds trigger an aggressive early crash between 1.00x and 1.25x to guarantee 60% bank margin
    if (Math.random() < houseEdge) {
      return Number((1.00 + Math.random() * 0.25).toFixed(2));
    }

    // Remaining 40% allows player wins with controlled multipliers up to 18x
    const rawMultiplier = Math.floor((40 / (100 - Math.random() * 85)) * 100) / 100;
    return Math.max(1.15, Math.min(rawMultiplier, 18.0));
  }, [adminSettings, adminUpdateSettings]);

  // Generate fake active players betting in this round
  const generateRoundBots = useCallback((): PlayerBetInRound[] => {
    const bots: PlayerBetInRound[] = [
      { id: 'b1', name: 'Marcos R.', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80', amount: 20, isBot: true },
      { id: 'b2', name: 'Beatriz L.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80', amount: 50, isBot: true },
      { id: 'b3', name: 'Rafael S.', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&auto=format&fit=crop&q=80', amount: 15, isBot: true },
      { id: 'b4', name: 'Gabriel K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80', amount: 100, isBot: true },
    ];
    return bots;
  }, []);

  // Check for admin "Force Crash Now" trigger
  useEffect(() => {
    if (adminSettings.crash.forceCrashNow && gameState === 'flying') {
      targetCrashRef.current = multiplier;
      adminUpdateSettings({
        crash: {
          ...adminSettings.crash,
          forceCrashNow: false,
        }
      });
    }
  }, [adminSettings.crash.forceCrashNow, gameState, multiplier, adminUpdateSettings]);

  // Round loop controller
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === 'waiting') {
      soundFx.stopRocketSound();
      setCountdown(4);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Launch round
            targetCrashRef.current = calculateCrashPoint();
            setMultiplier(1.0);
            setHasCashedOut(false);
            setCashedAmount(0);
            setGameState('flying');
            startTimeRef.current = performance.now();
            return 0;
          }
          soundFx.playRouletteTick(300);
          return prev - 1;
        });
      }, 1000);

      // Populate round bets
      const bots = generateRoundBots();
      if (hasBet) {
        setRoundBets([
          {
            id: currentUser.id,
            name: `${currentUser.name} (Você)`,
            avatar: currentUser.avatar,
            amount: betAmount,
            isBot: false,
          },
          ...bots,
        ]);
      } else {
        setRoundBets(bots);
      }

      return () => clearInterval(countdownInterval);
    }

    if (gameState === 'crashed') {
      soundFx.stopRocketSound();
      soundFx.playCrash();
      addCrashHistory(multiplier);

      // If user had bet and didn't cash out
      if (hasBet && !hasCashedOut) {
        loseBet('crash', betAmount);
      }

      setHasBet(false);

      // Wait 3 seconds before next round
      timer = setTimeout(() => {
        setGameState('waiting');
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [gameState, calculateCrashPoint, addCrashHistory, hasBet, hasCashedOut, betAmount, currentUser, loseBet, generateRoundBots, multiplier]);

  // Flight multiplier tick & animation loop
  useEffect(() => {
    if (gameState !== 'flying') return;

    soundFx.startRocketSound(multiplier);

    const updateFlight = (timestamp: number) => {
      const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;
      
      // Exponential growth curve: starts gentle, accelerates higher
      const currentMult = Number((1.0 + Math.pow(elapsedSeconds * 0.45, 1.85)).toFixed(2));
      setMultiplier(currentMult);

      soundFx.startRocketSound(currentMult);

      // Check auto-cashout for player
      const autoVal = parseFloat(autoCashout);
      if (hasBet && !hasCashedOut && !isNaN(autoVal) && autoVal > 1.0 && currentMult >= autoVal) {
        handleCashOut(autoVal);
      }

      // Check auto-cashouts for simulated bots
      setRoundBets((prev) =>
        prev.map((b) => {
          if (b.isBot && !b.cashedOutAt) {
            // Random bot cashout logic
            const botGoal = 1.2 + (parseInt(b.id.replace('b', ''), 10) * 0.6);
            if (currentMult >= botGoal && Math.random() < 0.4) {
              return {
                ...b,
                cashedOutAt: currentMult,
                payout: Number((b.amount * currentMult).toFixed(2)),
              };
            }
          }
          return b;
        })
      );

      // Crash condition
      if (currentMult >= targetCrashRef.current) {
        setGameState('crashed');
        return;
      }

      animationFrameRef.current = requestAnimationFrame(updateFlight);
    };

    animationFrameRef.current = requestAnimationFrame(updateFlight);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, autoCashout, hasBet, hasCashedOut]);

  // Canvas drawing for dynamic rocket flight path
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (gameState === 'waiting') {
      // Waiting radar circle
      ctx.save();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Flight Curve Calculation with finite number safeguards
    const startX = 30;
    const startY = height - 30;
    const safeMult = (typeof multiplier === 'number' && Number.isFinite(multiplier)) ? Math.max(1.0, multiplier) : 1.0;
    const progress = Math.max(0, Math.min(1, (safeMult - 1) / 10));
    const endX = startX + progress * (width - 70);
    const endY = startY - Math.min(height - 60, Math.pow(progress, 0.75) * (height - 80));

    const safeEndX = Number.isFinite(endX) ? endX : startX;
    const safeEndY = Number.isFinite(endY) ? Math.max(20, Math.min(height - 20, endY)) : startY;

    // Gradient fill under curve
    const gradient = ctx.createLinearGradient(0, safeEndY, 0, height);
    if (gameState === 'crashed') {
      gradient.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
      gradient.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
    } else {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    }

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + (safeEndX - startX) * 0.45, startY, safeEndX, safeEndY);
    ctx.lineTo(safeEndX, startY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Curve Line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + (safeEndX - startX) * 0.45, startY, safeEndX, safeEndY);
    ctx.strokeStyle = gameState === 'crashed' ? '#f43f5e' : '#10b981';
    ctx.lineWidth = 4;
    ctx.shadowColor = gameState === 'crashed' ? '#f43f5e' : '#10b981';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Rocket or Explosion icon point
    if (gameState === 'crashed') {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(safeEndX, safeEndY, 12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(safeEndX, safeEndY, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [gameState, multiplier]);

  // Actions
  const handlePlaceBet = () => {
    if (hasBet) return;
    const res = placeBet('crash', betAmount);
    if (res.success) {
      setHasBet(true);
      setHasCashedOut(false);
    }
  };

  const handleCashOut = (forcedMult?: number) => {
    if (!hasBet || hasCashedOut || gameState !== 'flying') return;
    const exitMult = forcedMult || multiplier;
    const winAmount = Number((betAmount * exitMult).toFixed(2));
    
    setHasCashedOut(true);
    setCashedAmount(winAmount);
    winBet('crash', betAmount, exitMult, winAmount);

    try {
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { y: 0.7 }
      });
    } catch {
      // Ignored
    }

    setRoundBets((prev) =>
      prev.map((b) =>
        b.id === currentUser.id
          ? { ...b, cashedOutAt: exitMult, payout: winAmount }
          : b
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Multiplier History Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center text-slate-400 text-[11px] font-semibold pr-1 shrink-0">
          <History className="w-3.5 h-3.5 mr-1" />
          Anteriores:
        </div>
        {crashHistory.slice(0, 10).map((h) => (
          <div
            key={h.id}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition ${
              h.multiplier >= 10.0
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 glow-amber'
                : h.multiplier >= 2.0
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700/60'
            }`}
          >
            {h.multiplier.toFixed(2)}x
          </div>
        ))}
      </div>

      {/* Main Crash Stage with 3D Avioneta */}
      <div className="relative w-full h-80 sm:h-96 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl flex flex-col">
        {/* 3D Aerodynamic Racing Airplane */}
        <Crash3DPlane gameState={gameState} multiplier={multiplier} />

        {/* Admin Secret Rigging Indicator */}
        {isAdminView && adminSettings.crash.nextCrashMultiplier !== null && (
          <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/50 text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Crash Rigged Admin: {adminSettings.crash.nextCrashMultiplier.toFixed(2)}x</span>
          </div>
        )}

        {/* Dynamic Flight Curve HUD Canvas */}
        <canvas
          ref={canvasRef}
          width={600}
          height={380}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
        />

        {/* Center Display */}
        <div className="relative z-10 m-auto text-center pointer-events-none select-none">
          {gameState === 'waiting' && (
            <div className="space-y-2 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <Rocket className="w-7 h-7 animate-bounce" />
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Decolando em
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400">
                {countdown}s
              </div>
              <div className="w-36 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {gameState === 'flying' && (
            <div className="space-y-1">
              <div className="text-5xl sm:text-7xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                {multiplier.toFixed(2)}
                <span className="text-emerald-400 text-3xl sm:text-5xl">x</span>
              </div>
              <div className="text-xs font-semibold text-emerald-400/80 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <TrendingUp className="w-4 h-4 animate-pulse" />
                Subindo...
              </div>
            </div>
          )}

          {gameState === 'crashed' && (
            <div className="space-y-1 animate-scale-in">
              <div className="text-xs uppercase tracking-widest text-rose-400 font-extrabold">
                CRASHOU EM
              </div>
              <div className="text-5xl sm:text-6xl font-black font-mono text-rose-500 tracking-tight drop-shadow-[0_0_30px_rgba(244,63,94,0.5)]">
                {multiplier.toFixed(2)}x
              </div>
            </div>
          )}
        </div>

        {/* Live cashed out alert overlay */}
        {hasCashedOut && (
          <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg glow-emerald">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Você Sacou: {formatMoney(cashedAmount)}</span>
          </div>
        )}
      </div>

      {/* Control Panel (Bet Inputs & Action Button) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Bet inputs */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Valor da Aposta (Mín {currencySymbol} 2 / Máx {currencySymbol} 85)</span>
            <span className="text-xs font-mono text-slate-400">
              Saldo: <strong className="text-white">{formatMoney(currentUser.balance)}</strong>
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              {currencySymbol}
            </span>
            <input
              type="number"
              disabled={hasBet && gameState !== 'waiting'}
              min={adminSettings.minBet}
              max={adminSettings.maxBet}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl font-mono text-base font-bold text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
          </div>

          {/* Quick chips (Mín 2 / Máx 85) */}
          <div className="grid grid-cols-6 gap-1">
            {[2, 5, 10, 25, 50, 85].map((v) => (
              <button
                key={v}
                type="button"
                disabled={hasBet && gameState !== 'waiting'}
                onClick={() => setBetAmount(v)}
                className={`py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 ${
                  betAmount === v
                    ? 'bg-emerald-500 text-slate-950 font-extrabold'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              type="button"
              disabled={hasBet && gameState !== 'waiting'}
              onClick={() => setBetAmount((prev) => Math.max(adminSettings.minBet || 2, Math.floor(prev / 2)))}
              className="py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              /2 (Metade)
            </button>
            <button
              type="button"
              disabled={hasBet && gameState !== 'waiting'}
              onClick={() => setBetAmount((prev) => Math.min(adminSettings.maxBet || 85, prev * 2))}
              className="py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              2X (Dobro)
            </button>
          </div>
        </div>

        {/* Auto cashout & Main Action Button */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Auto Saque (Opcional)</span>
              <span className="text-[11px] text-emerald-400 font-semibold">Ex: 2.00x</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="1.01"
                placeholder="2.00"
                disabled={hasBet && gameState !== 'waiting'}
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl font-mono text-sm font-bold text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                MULTIPLICADOR
              </span>
            </div>
          </div>

          {/* Big Action Button */}
          {!hasBet ? (
            <button
              type="button"
              onClick={handlePlaceBet}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/25 text-base tracking-wide transition uppercase flex items-center justify-center space-x-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Apostar {formatMoney(betAmount)}</span>
            </button>
          ) : gameState === 'waiting' ? (
            <div className="w-full py-4 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold rounded-xl text-center text-sm flex items-center justify-center space-x-2">
              <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Aposta Confirmada • Aguardando Voo...</span>
            </div>
          ) : hasCashedOut ? (
            <div className="w-full py-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-center text-sm flex items-center justify-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Ganhou {formatMoney(cashedAmount)}!</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleCashOut()}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/30 text-base tracking-wide transition uppercase flex flex-col items-center justify-center animate-pulse"
            >
              <span className="text-xs font-extrabold uppercase">Sacar Lucro</span>
              <span className="text-lg font-mono font-black">
                {formatMoney(betAmount * multiplier)} ({multiplier.toFixed(2)}x)
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Live Players Table in Round */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            Jogadores na Sala ({roundBets.length})
          </span>
          <span>Status / Saque</span>
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {roundBets.map((b) => (
            <div
              key={b.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                b.id === currentUser.id
                  ? 'bg-emerald-500/10 border border-emerald-500/30 font-semibold'
                  : 'bg-slate-950/60 border border-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <img
                  src={b.avatar}
                  alt={b.name}
                  className="w-6 h-6 rounded-full object-cover border border-slate-700"
                />
                <span className="text-slate-200">{b.name}</span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {currencySymbol} {b.amount.toFixed(2)}
                </span>
              </div>

              <div>
                {b.cashedOutAt ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px] border border-emerald-500/30">
                    {b.cashedOutAt.toFixed(2)}x (+{currencySymbol} {b.payout?.toFixed(2)})
                  </span>
                ) : gameState === 'crashed' ? (
                  <span className="text-[11px] text-rose-400/80 font-medium">Perdeu</span>
                ) : (
                  <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    Voando
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
