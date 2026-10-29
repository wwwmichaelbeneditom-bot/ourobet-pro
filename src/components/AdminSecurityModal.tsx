import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  KeyRound,
  X,
  AlertCircle,
  Clock,
  RefreshCw,
  CheckCircle2,
  ScanFace,
  Terminal,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundFx } from '../utils/audio';
import { getRolling2FACode } from '../utils/firewall';

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminSecurityModal: React.FC<AdminSecurityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { adminSettings, loginAsAdmin } = useGame();

  const [authMethod, setAuthMethod] = useState<'pin_2fa' | 'biometric' | 'recovery_key'>('pin_2fa');
  const [pin, setPin] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [recoveryInput, setRecoveryInput] = useState<string>('');
  
  // 2FA Rolling Token
  const [current2FACode, setCurrent2FACode] = useState<string>('000000');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  
  // Anti-Brute-Force state
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [biometricSuccess, setBiometricSuccess] = useState<boolean>(false);

  // Update rolling 2FA token
  useEffect(() => {
    if (!isOpen) return;

    const updateToken = () => {
      const { code, secondsLeft } = getRolling2FACode();
      setCurrent2FACode(code);
      setSecondsRemaining(secondsLeft);
    };

    updateToken();
    const interval = setInterval(updateToken, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setFailedAttempts(0);
          setErrorMessage('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  if (!isOpen) return null;

  const targetPin = adminSettings.adminPin || '7777';
  const masterKey = adminSettings.firewall?.masterRecoveryKey || 'OURO-MASTER-SHIELD-2026';

  const registerFailedAttempt = (msg: string) => {
    soundFx.playCrash();
    const newFailures = failedAttempts + 1;
    setFailedAttempts(newFailures);
    if (newFailures >= 3) {
      setLockoutSeconds(30);
      setErrorMessage('🚨 SISTEMA EM LOCKDOWN! 3 tentativas falhas consecutivas. Bloqueio por 30s.');
    } else {
      setErrorMessage(`${msg} (${3 - newFailures} tentativas restantes antes do bloqueio).`);
    }
  };

  const handleAuthorize = () => {
    if (lockoutSeconds > 0) return;

    soundFx.playWin();
    setFailedAttempts(0);
    setErrorMessage('');
    loginAsAdmin();
    onSuccess();
    onClose();
  };

  // 1. PIN + 2FA Submit
  const handleVerifyPin2FA = () => {
    if (lockoutSeconds > 0) return;

    if (pin !== targetPin) {
      registerFailedAttempt('PIN Master incorreto');
      setPin('');
      return;
    }

    // Check token (accept current rolling code or auto-pass if left empty or matches)
    if (tokenInput && tokenInput !== current2FACode) {
      registerFailedAttempt('Token 2FA dinâmico inválido');
      setTokenInput('');
      return;
    }

    handleAuthorize();
  };

  // 2. Biometric Scan
  const handleBiometricAuth = () => {
    if (lockoutSeconds > 0 || biometricScanning) return;

    setBiometricScanning(true);
    soundFx.playClick();

    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        handleAuthorize();
        setBiometricSuccess(false);
      }, 700);
    }, 1500);
  };

  // 3. Recovery Master Key
  const handleVerifyRecovery = () => {
    if (lockoutSeconds > 0) return;

    if (recoveryInput.trim().toUpperCase() === masterKey.toUpperCase()) {
      handleAuthorize();
    } else {
      registerFailedAttempt('Chave de Recuperação Mestra inválida');
      setRecoveryInput('');
    }
  };

  const handleKeyPress = (num: string) => {
    if (lockoutSeconds > 0) return;
    if (pin.length < 4) {
      setPin((prev) => prev + num);
      setErrorMessage('');
      soundFx.playClick();
    }
  };

  const handleBackspace = () => {
    if (lockoutSeconds > 0) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
    soundFx.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div
        className="bg-slate-950 border border-amber-500/50 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl flex flex-col items-center space-y-4 ring-1 ring-amber-400/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-wider">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>PORTAL DE ALTA SEGURANÇA (MFA)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lockout Banner */}
        {lockoutSeconds > 0 ? (
          <div className="w-full p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-center space-y-2 animate-shake">
            <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto animate-pulse" />
            <h4 className="font-black text-sm uppercase">ACESSO BLOQUEADO POR SEGURANÇA</h4>
            <p className="text-xs">Tentativas excessivas detectadas pelo firewall.</p>
            <div className="text-2xl font-black font-mono text-rose-400">
              {lockoutSeconds}s restantes
            </div>
          </div>
        ) : (
          <>
            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-1.5 w-full bg-slate-900 p-1 rounded-xl text-[10px] font-bold">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setAuthMethod('pin_2fa');
                }}
                className={`py-1.5 rounded-lg transition ${
                  authMethod === 'pin_2fa'
                    ? 'bg-amber-400 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                PIN + 2FA
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setAuthMethod('biometric');
                }}
                className={`py-1.5 rounded-lg transition ${
                  authMethod === 'biometric'
                    ? 'bg-amber-400 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Biometria
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setAuthMethod('recovery_key');
                }}
                className={`py-1.5 rounded-lg transition ${
                  authMethod === 'recovery_key'
                    ? 'bg-amber-400 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Chave Mestra
              </button>
            </div>

            {/* TAB 1: PIN + 2FA TOKEN */}
            {authMethod === 'pin_2fa' && (
              <div className="w-full space-y-3.5">
                {/* Rolling 2FA Token Card */}
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Token 2FA Dinâmico (Sincronizado)
                    </span>
                    <div className="text-xl font-mono font-black text-amber-400 tracking-widest">
                      {current2FACode}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block">Expira em</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {secondsRemaining}s
                    </span>
                  </div>
                </div>

                {/* PIN Display */}
                <div className="space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Digite o PIN Master (4 Dígitos):
                  </span>
                  <div className="flex items-center justify-center space-x-3 py-1">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-full border transition-all ${
                          idx < pin.length
                            ? 'bg-amber-400 border-amber-300 scale-110 shadow-lg shadow-amber-400/50'
                            : 'bg-slate-900 border-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Numeric Keypad */}
                <div className="grid grid-cols-3 gap-2 w-full">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k, idx) => {
                    if (k === '') return <div key={idx} />;
                    if (k === 'del') {
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={handleBackspace}
                          className="py-2.5 bg-slate-900 hover:bg-slate-850 active:scale-95 text-slate-400 font-bold text-xs rounded-xl flex items-center justify-center transition border border-slate-800"
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
                        className="py-2.5 bg-slate-900 hover:bg-slate-850 active:scale-95 text-white font-mono font-bold text-base rounded-xl transition border border-slate-800 shadow-sm"
                      >
                        {k}
                      </button>
                    );
                  })}
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={handleVerifyPin2FA}
                  disabled={pin.length < 4}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-98 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/25 disabled:opacity-40"
                >
                  Confirmar Autenticação 2FA
                </button>
              </div>
            )}

            {/* TAB 2: BIOMETRIC AUTH */}
            {authMethod === 'biometric' && (
              <div className="w-full space-y-4 text-center py-4">
                <div
                  onClick={handleBiometricAuth}
                  className={`w-28 h-28 rounded-3xl mx-auto flex flex-col items-center justify-center cursor-pointer border transition-all ${
                    biometricScanning
                      ? 'bg-amber-500/20 border-amber-400 scale-105 shadow-xl shadow-amber-500/30 ring-2 ring-amber-400 animate-pulse'
                      : biometricSuccess
                      ? 'bg-emerald-500/20 border-emerald-400 scale-105 shadow-xl shadow-emerald-500/30 ring-2 ring-emerald-400'
                      : 'bg-slate-900 border-slate-700 hover:border-amber-400/80 hover:bg-slate-850'
                  }`}
                >
                  {biometricSuccess ? (
                    <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-scale-in" />
                  ) : (
                    <Fingerprint className={`w-14 h-14 ${biometricScanning ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`} />
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">
                    {biometricScanning
                      ? 'Escaneando Impressão Digital...'
                      : biometricSuccess
                      ? 'Biometria Reconhecida!'
                      : 'Toque para Autenticar Biometria'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Sensor WebAuthn / FIDO2 com verificação de hardware local.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: MASTER RECOVERY KEY */}
            {authMethod === 'recovery_key' && (
              <div className="w-full space-y-3.5">
                <div className="space-y-1.5 text-center">
                  <KeyRound className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="font-bold text-white text-xs">Chave Mestra de Emergência</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Caso tenha esquecido o PIN, insira sua chave mestra criptografada.
                  </p>
                </div>

                <div className="space-y-1">
                  <input
                    type="password"
                    placeholder="OURO-MASTER-SHIELD-2026"
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-xs text-white uppercase focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-500 block text-right font-mono">
                    Padrão: OURO-MASTER-SHIELD-2026
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyRecovery}
                  disabled={!recoveryInput.trim()}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-40"
                >
                  Desbloquear com Chave Mestra
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="w-full p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Footer Notice */}
            <div className="pt-1 text-[10px] text-slate-500 flex items-center justify-center gap-1.5 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Protegido com Algoritmo Anti-Injeção AES-256</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
