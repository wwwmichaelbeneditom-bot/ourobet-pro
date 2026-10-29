import React, { useState, useCallback } from 'react';
import { Bomb, Gem, ShieldAlert, Sparkles, Zap, RotateCcw } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';

export const MinesGame: React.FC = () => {
  const {
    currentUser,
    placeBet,
    winBet,
    loseBet,
    adminSettings,
    adminUpdateSettings,
    isAdminView,
    currencySymbol,
    formatMoney,
  } = useGame();

  const [gridSize] = useState<number>(25); // 5x5
  const [mineCount, setMineCount] = useState<number>(3);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [minePositions, setMinePositions] = useState<Set<number>>(new Set());
  const [revealedTiles, setRevealedTiles] = useState<Set<number>>(new Set());
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [cashedOut, setCashedOut] = useState<boolean>(false);
  const [payoutMultiplier, setPayoutMultiplier] = useState<number>(1.0);

  // Multiplier formula for Mines based on combinations:
  // mult = (1 - houseEdge) * nCr(25, picks) / nCr(25 - mines, picks)
  const calculateMultiplier = useCallback((diamondsFound: number, totalMines: number) => {
    if (diamondsFound === 0) return 1.0;
    const houseEdge = (adminSettings.houseEdgePercent || 5) / 100;
    let prob = 1.0;
    for (let i = 0; i < diamondsFound; i++) {
      prob *= (25 - totalMines - i) / (25 - i);
    }
    const raw = (1 - houseEdge) / prob;
    return Number(Math.max(1.05, raw).toFixed(2));
  }, [adminSettings.houseEdgePercent]);

  // Start new round
  const handleStartGame = () => {
    if (isPlaying) return;
    const res = placeBet('mines', betAmount);
    if (!res.success) return;

    // Generate random bomb positions
    const mines = new Set<number>();
    while (mines.size < mineCount) {
      const idx = Math.floor(Math.random() * gridSize);
      mines.add(idx);
    }

    setMinePositions(mines);
    setRevealedTiles(new Set());
    setGameOver(false);
    setCashedOut(false);
    setPayoutMultiplier(1.0);
    setIsPlaying(true);
    soundFx.playClick();
  };

  // Click a tile
  const handleTileClick = (index: number) => {
    if (!isPlaying || gameOver || cashedOut || revealedTiles.has(index)) return;

    let isBomb = minePositions.has(index);

    // Admin rigging intervention
    if (adminSettings.mines.forceNextBomb || adminSettings.mines.rigMode === 'forced_loss') {
      isBomb = true;
      const updatedMines = new Set(minePositions);
      updatedMines.add(index);
      setMinePositions(updatedMines);
      
      // Reset force trigger
      if (adminSettings.mines.forceNextBomb) {
        adminUpdateSettings({
          mines: {
            ...adminSettings.mines,
            forceNextBomb: false,
          }
        });
      }
    }

    const nextRevealed = new Set(revealedTiles);
    nextRevealed.add(index);
    setRevealedTiles(nextRevealed);

    if (isBomb) {
      // Hit a bomb!
      soundFx.playCrash();
      setGameOver(true);
      setIsPlaying(false);
      loseBet('mines', betAmount);
    } else {
      // Safe diamond
      soundFx.playGem();
      const diamondsFound = nextRevealed.size;
      const nextMult = calculateMultiplier(diamondsFound, mineCount);
      setPayoutMultiplier(nextMult);

      // Check if all diamonds found!
      if (diamondsFound === 25 - mineCount) {
        handleCashOut(nextMult);
      }
    }
  };

  // Cash out current winnings
  const handleCashOut = (forcedMult?: number) => {
    if (!isPlaying || gameOver || cashedOut) return;
    const mult = forcedMult || payoutMultiplier;
    const totalWin = Number((betAmount * mult).toFixed(2));

    setCashedOut(true);
    setIsPlaying(false);
    winBet('mines', betAmount, mult, totalWin);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignored
    }
  };

  const currentProfits = Number((betAmount * payoutMultiplier).toFixed(2));

  return (
    <div className="space-y-4">
      {/* Game status & Admin indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <Gem className="w-4 h-4 text-emerald-400" />
            {25 - mineCount - (revealedTiles.size - (gameOver ? 1 : 0))} Diamantes
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold text-rose-400">
            <Bomb className="w-4 h-4 text-rose-400" />
            {mineCount} Bombas
          </span>
        </div>

        {isAdminView && adminSettings.mines.showXRayInAdmin && (
          <div className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            Raio-X Admin Ativo
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left/Top: 5x5 Mines Grid */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center relative min-h-[340px]">
          {/* 5x5 Grid */}
          <div className="grid grid-cols-5 gap-2 w-full max-w-xs sm:max-w-sm aspect-square">
            {Array.from({ length: 25 }).map((_, idx) => {
              const isRevealed = revealedTiles.has(idx);
              const isBomb = minePositions.has(idx);
              const showAsMineGameOver = (gameOver || cashedOut) && isBomb;
              const isXrayVisible = isAdminView && adminSettings.mines.showXRayInAdmin && isPlaying && isBomb;

              let tileBg = 'bg-slate-800 hover:bg-slate-750 border-slate-700/60';
              if (isRevealed) {
                tileBg = isBomb
                  ? 'bg-rose-500/20 border-rose-500/80 shadow-rose-500/20 shadow-md'
                  : 'bg-emerald-500/20 border-emerald-500/80 shadow-emerald-500/20 shadow-md';
              } else if (showAsMineGameOver) {
                tileBg = 'bg-rose-950/40 border-rose-800/40 opacity-70';
              } else if (isXrayVisible) {
                tileBg = 'bg-amber-500/20 border-amber-500/60 border-dashed';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!isPlaying || isRevealed || gameOver || cashedOut}
                  onClick={() => handleTileClick(idx)}
                  className={`relative rounded-xl border flex items-center justify-center transition-all duration-150 aspect-square active:scale-95 disabled:active:scale-100 ${tileBg}`}
                >
                  {isRevealed && isBomb && (
                    <div className="animate-scale-in">
                      <Bomb className="w-6 h-6 sm:w-7 sm:h-7 text-rose-500 fill-rose-500/30" />
                    </div>
                  )}

                  {isRevealed && !isBomb && (
                    <div className="animate-scale-in">
                      <Gem className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 fill-emerald-400/30" />
                    </div>
                  )}

                  {!isRevealed && showAsMineGameOver && (
                    <Bomb className="w-5 h-5 text-rose-400/50" />
                  )}

                  {!isRevealed && isXrayVisible && (
                    <div className="absolute top-1 right-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 block animate-ping" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Overlay Result Badge */}
          {gameOver && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 animate-fade-in z-20">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mb-2">
                <Bomb className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Você Explodiu!</h4>
              <p className="text-xs text-slate-400 mb-3">Tente novamente na próxima rodada</p>
              <button
                onClick={handleStartGame}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                Jogar Novamente
              </button>
            </div>
          )}

          {cashedOut && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 animate-fade-in z-20">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-2 animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Saque Realizado!</h4>
              <p className="text-sm font-mono text-emerald-400 font-bold mb-3">
                +R$ {currentProfits.toFixed(2)} ({payoutMultiplier.toFixed(2)}x)
              </p>
              <button
                onClick={handleStartGame}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                Nova Partida
              </button>
            </div>
          )}
        </div>

        {/* Right/Bottom: Controls */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            {/* Bet Amount */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Valor da Aposta (Mín {currencySymbol} 2 / Máx {currencySymbol} 85)</span>
                <span className="text-xs font-mono text-slate-400">
                  {formatMoney(currentUser.balance)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  disabled={isPlaying}
                  min={adminSettings.minBet || 2}
                  max={adminSettings.maxBet || 85}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(adminSettings.minBet || 2, Math.min(adminSettings.maxBet || 85, Number(e.target.value))))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl font-mono text-sm font-bold text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
              </div>

              {/* Chips (Mín 2 / Máx 85) */}
              <div className="grid grid-cols-6 gap-1">
                {[2, 5, 10, 25, 50, 85].map((v) => (
                  <button
                    key={v}
                    type="button"
                    disabled={isPlaying}
                    onClick={() => setBetAmount(v)}
                    className={`py-1 text-xs font-semibold rounded-lg transition disabled:opacity-50 ${
                      betAmount === v
                        ? 'bg-emerald-500 text-slate-950 font-black'
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
                  disabled={isPlaying}
                  onClick={() => setBetAmount((prev) => Math.max(adminSettings.minBet || 2, Math.floor(prev / 2)))}
                  className="py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  /2 (Metade)
                </button>
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={() => setBetAmount((prev) => Math.min(adminSettings.maxBet || 85, prev * 2))}
                  className="py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  2X (Dobro)
                </button>
              </div>
            </div>

            {/* Mines Count Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Número de Minas</span>
                <span className="text-xs font-bold text-rose-400">{mineCount} bombas</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[1, 3, 5, 10].map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={isPlaying}
                    onClick={() => setMineCount(m)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 ${
                      mineCount === m
                        ? 'bg-rose-500 text-white font-extrabold shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {m} Minas
                  </button>
                ))}
              </div>
            </div>

            {/* Current Multiplier / Next Tile Multiplier */}
            {isPlaying && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Multiplicador Atual:</span>
                  <span className="font-mono font-bold text-emerald-400 text-base">
                    {payoutMultiplier.toFixed(2)}x
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Lucro Se Sacar Agora:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatMoney(currentProfits)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action button: Start Game or Cash Out */}
          <div>
            {!isPlaying ? (
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/25 text-sm tracking-wide transition uppercase flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Iniciar Jogo ({formatMoney(betAmount)})</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={revealedTiles.size === 0}
                onClick={() => handleCashOut()}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/30 text-sm tracking-wide transition uppercase flex flex-col items-center justify-center disabled:opacity-50"
              >
                <span>Sacar Lucro</span>
                <span className="text-xs font-mono">
                  {formatMoney(currentProfits)} ({payoutMultiplier.toFixed(2)}x)
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
