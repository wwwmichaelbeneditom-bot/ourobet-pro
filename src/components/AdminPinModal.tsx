import React, { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, X, AlertCircle, Fingerprint } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundFx } from '../utils/audio';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { adminSettings, loginAsAdmin } = useGame();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetPin = adminSettings.adminPin || '7777';

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      soundFx.playClick();

      if (nextPin.length === 4) {
        if (nextPin === targetPin) {
          soundFx.playWin();
          loginAsAdmin();
          onSuccess();
          setPin('');
        } else {
          soundFx.playCrash();
          setError(true);
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
    soundFx.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-slate-950 border border-amber-500/40 rounded-3xl p-6 max-w-xs w-full shadow-2xl flex flex-col items-center space-y-4 ring-1 ring-amber-400/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Cofre Master</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center space-y-1">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
            <Fingerprint className="w-7 h-7 animate-pulse" />
          </div>
          <h3 className="font-black text-white text-base">Acesso Criptografado</h3>
          <p className="text-[11px] text-slate-400">
            Digite o PIN de 4 dígitos para gerenciar a plataforma
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center justify-center space-x-3 py-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                idx < pin.length
                  ? error
                    ? 'bg-rose-500 border-rose-400 scale-110'
                    : 'bg-amber-400 border-amber-300 scale-110 glow-amber'
                  : 'bg-slate-900 border-slate-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="text-[11px] text-rose-400 font-bold flex items-center gap-1 animate-shake">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>PIN Incorreto. Tente novamente.</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k, idx) => {
            if (k === '') {
              return <div key={idx} />;
            }
            if (k === 'del') {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={handleBackspace}
                  className="py-3 bg-slate-900 hover:bg-slate-850 active:scale-95 text-slate-400 font-bold text-xs rounded-xl flex items-center justify-center transition border border-slate-800"
                >
                  Apagar
                </button>
              );
            }
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleKeyPress(k)}
                className="py-3 bg-slate-900 hover:bg-slate-850 active:scale-95 text-white font-mono font-bold text-lg rounded-xl transition border border-slate-800 shadow-sm"
              >
                {k}
              </button>
            );
          })}
        </div>

        <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-1 text-center">
          <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Identidade do Proprietário Oculta a 7 Chaves</span>
        </div>
      </div>
    </div>
  );
};
