import React, { ReactNode } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface AndroidFrameWrapperProps {
  children: ReactNode;
}

export const AndroidFrameWrapper: React.FC<AndroidFrameWrapperProps> = ({ children }) => {
  const { isMobileDeviceFrame, setIsMobileDeviceFrame } = useGame();

  if (!isMobileDeviceFrame) {
    return <>{children}</>;
  }

  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-950/90 py-6 px-3 flex flex-col items-center justify-center">
      {/* Top Helper bar */}
      <div className="mb-3 flex items-center justify-between w-full max-w-sm text-xs text-slate-400 px-2">
        <span className="flex items-center gap-1.5 font-bold text-emerald-400">
          <Smartphone className="w-4 h-4" />
          Modo Android Smartphone
        </span>
        <button
          onClick={() => setIsMobileDeviceFrame(false)}
          className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition"
        >
          <Monitor className="w-3.5 h-3.5" />
          Tela Cheia
        </button>
      </div>

      {/* Android Device Mockup Chassis */}
      <div className="relative w-full max-w-[400px] h-[840px] max-h-[94vh] bg-slate-950 border-[9px] border-slate-800 rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col ring-1 ring-slate-700/50">
        {/* Camera Punch Hole & Android Status Bar */}
        <div className="bg-slate-950 px-6 pt-2 pb-1.5 flex items-center justify-between text-[11px] text-slate-400 select-none z-30 shrink-0 border-b border-slate-900">
          <span className="font-semibold text-white">{currentTime}</span>

          {/* Camera Notch */}
          <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
          </div>

          <div className="flex items-center space-x-1.5 text-slate-300">
            <span className="text-[9px] font-black tracking-wider text-emerald-400">5G</span>
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <div className="flex items-center space-x-0.5">
              <span className="text-[9px] font-mono">98%</span>
              <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Device screen viewport content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#070a12]">
          {children}
        </div>

        {/* Android bottom navigation home bar */}
        <div className="bg-slate-950 py-1.5 flex items-center justify-center z-30 shrink-0">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
