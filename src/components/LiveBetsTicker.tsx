import React from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const LiveBetsTicker: React.FC = () => {
  const { liveBets } = useGame();

  if (liveBets.length === 0) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2 overflow-hidden">
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-0.5">
        <div className="flex items-center text-[10px] font-black uppercase text-amber-400 shrink-0 px-1">
          <Flame className="w-3.5 h-3.5 mr-1 fill-amber-400" />
          Ganhos Recentes:
        </div>
        {liveBets.slice(0, 8).map((b) => (
          <div
            key={b.id}
            className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 shrink-0 text-[11px]"
          >
            <img src={b.avatar} alt={b.userName} className="w-4 h-4 rounded-full object-cover" />
            <span className="text-slate-300 font-medium truncate max-w-[70px]">{b.userName}</span>
            <span className="font-mono font-bold text-emerald-400">
              +R$ {(b.amount * (1.5 + Math.random() * 2)).toFixed(2)}
            </span>
            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">
              {b.game}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
