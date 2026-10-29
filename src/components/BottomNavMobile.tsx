import React from 'react';
import { Rocket, Bomb, CircleDot, Disc, Wallet, Lock } from 'lucide-react';
import { GameType } from '../types';
import { useGame } from '../context/GameContext';
import { soundFx } from '../utils/audio';

interface BottomNavMobileProps {
  activeGame: GameType;
  setActiveGame: (game: GameType) => void;
  onOpenDeposit: () => void;
  onOpenPinModal: () => void;
}

export const BottomNavMobile: React.FC<BottomNavMobileProps> = ({
  activeGame,
  setActiveGame,
  onOpenDeposit,
}) => {
  const { isAdminView, setIsAdminView, toggleAdminMode } = useGame();

  const navItems = [
    { id: 'crash', label: 'Aviador', icon: Rocket, color: 'text-rose-400' },
    { id: 'mines', label: 'Minas', icon: Bomb, color: 'text-emerald-400' },
    { id: 'roulette', label: 'Roleta', icon: Disc, color: 'text-amber-400' },
    { id: 'coinflip', label: 'Moeda', icon: CircleDot, color: 'text-cyan-400' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 pb-safe sm:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = !isAdminView && activeGame === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundFx.playClick();
                setIsAdminView(false);
                setActiveGame(item.id as GameType);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                isActive
                  ? 'text-white font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center mb-0.5 ${
                  isActive ? 'bg-slate-800 shadow-md' : ''
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-slate-400'}`} />
              </div>
              <span className="text-[10px] leading-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Deposit Quick Trigger */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenDeposit();
          }}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-emerald-400 font-bold"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-0.5">
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] leading-tight">Depósito</span>
        </button>

        {/* 1-Click Secret Switcher: Admin Mode <-> Player Mode */}
        <button
          onClick={() => {
            soundFx.playClick();
            toggleAdminMode();
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition active:scale-95 ${
            isAdminView ? 'text-amber-300 font-black scale-105' : 'text-slate-400'
          }`}
          title="Alternar Modo Admin / Jogador com 1 Clique"
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center mb-0.5 ${
              isAdminView ? 'bg-amber-400 text-slate-950 shadow-md glow-amber' : 'bg-slate-900 border border-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
          </div>
          <span className="text-[10px] leading-tight">{isAdminView ? 'Modo Jogador' : 'Modo Admin'}</span>
        </button>
      </div>
    </nav>
  );
};
