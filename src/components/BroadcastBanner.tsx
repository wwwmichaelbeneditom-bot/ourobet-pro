import React from 'react';
import { Megaphone, AlertTriangle, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const BroadcastBanner: React.FC = () => {
  const { adminSettings } = useGame();

  if (adminSettings.maintenanceMode) {
    return (
      <div className="bg-rose-600 px-4 py-2 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg animate-pulse">
        <AlertTriangle className="w-4 h-4" />
        <span>PLATAFORMA EM MODO DE MANUTENÇÃO PELO ADMINISTRADOR • APOSTAS TEMPORARIAMENTE SUSPENSAS</span>
      </div>
    );
  }

  if (!adminSettings.broadcastActive || !adminSettings.broadcastMessage) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-3 py-1.5 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-md">
      <Megaphone className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{adminSettings.broadcastMessage}</span>
    </div>
  );
};
