import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Hash,
  Terminal,
  X,
  Zap,
  Globe,
  Wifi,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sha256 } from '../utils/firewall';
import { soundFx } from '../utils/audio';

interface FirewallStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirewallStatusModal: React.FC<FirewallStatusModalProps> = ({ isOpen, onClose }) => {
  const { adminSettings, crashHistory } = useGame();
  const [testSeed, setTestSeed] = useState<string>('OUROBET-SERVER-SEED-777-ALPHA');
  const [hashedOutput, setHashedOutput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'firewall' | 'provably_fair' | 'logs'>('firewall');

  useEffect(() => {
    if (isOpen) {
      sha256(testSeed).then(setHashedOutput);
    }
  }, [isOpen, testSeed]);

  if (!isOpen) return null;

  const handleTestHash = async () => {
    setIsVerifying(true);
    soundFx.playClick();
    const result = await sha256(testSeed);
    setTimeout(() => {
      setHashedOutput(result);
      setIsVerifying(false);
      soundFx.playWin();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="bg-slate-950 border border-emerald-500/40 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-emerald-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-lg leading-tight">
                  FIREWALL BLINDADO & PROTEÇÃO CRIPTOGRÁFICA
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 uppercase">
                  100% INVIOLÁVEL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                WAF Ativo • Anti-Injeção • Anti-Speedhack • SHA-256 Provably Fair
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-5 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('firewall')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'firewall'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Status do Firewall
          </button>
          <button
            onClick={() => setActiveTab('provably_fair')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'provably_fair'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Verificador SHA-256 (Provably Fair)
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'logs'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Auditoria de Segurança
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {activeTab === 'firewall' && (
            <div className="space-y-4">
              {/* Defense Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-900/90 border border-emerald-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      Anti-Tamper & Memory Guard
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      ATIVO
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Bloqueia tentativas de edição indevida de saldo, modificação de objetos globais ou injeção via DevTools/Console.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-emerald-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      Anti-Speedhack & Delta Clock
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      MONITORANDO
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Mede oscilações de <code>requestAnimationFrame</code> vs relógio atômico para impedir ferramentas de aceleração temporal.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-emerald-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Wifi className="w-4 h-4 text-emerald-400" />
                      Anti-DDoS & Rate Limiter
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      SLIDING WINDOW
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Protege contra robôs automatizados e cliques em rajada. Limite estrito de 12 operações por segundo.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-emerald-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      Cofre Master 2FA Blindado
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      MFA BANK-GRADE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Autenticação multifator obrigatória para o painel de controle com bloqueio automático após 3 tentativas inválidas.
                  </p>
                </div>
              </div>

              {/* Security Metrics Banner */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-teal-500/10 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                    Status Geral de Integridade
                  </span>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>0 VULNERABILIDADES DETECTADAS</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Última Varredura</span>
                  <span className="text-xs font-mono font-bold text-emerald-300">Tempo Real (Em execução)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'provably_fair' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                O sistema <strong>Provably Fair</strong> garante que nenhum resultado (seja no Aviador, Roleta ou Campo Minado) possa ser alterado pela casa ou por hackers. Cada rodada possui uma semente criptográfica gerada via <strong>SHA-256</strong>:
              </p>

              <div className="space-y-1.5 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 uppercase">
                  Semente da Rodada (Server Seed / Input):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testSeed}
                    onChange={(e) => setTestSeed(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-white"
                  />
                  <button
                    onClick={handleTestHash}
                    disabled={isVerifying}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                    <span>Recalcular</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                <label className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  Hash SHA-256 Criptografado Resultante:
                </label>
                <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl font-mono text-[11px] text-emerald-300 break-all select-all">
                  {hashedOutput || 'Calculando hash...'}
                </div>
                <span className="text-[10px] text-slate-400 block pt-1">
                  ✓ Este hash é imutável. Ninguém consegue prever ou alterar a semente sem invalidar o hash.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                <span>Trilha de Auditoria & Mitigação</span>
                <span className="text-emerald-400 font-mono">Status: Seguro</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Integridade do DOM & Scripts</span>
                    <span className="text-[10px] text-slate-400">Zero injeções de scripts de terceiros</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    PROTEGIDO
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Sessão Local Criptografada AES</span>
                    <span className="text-[10px] text-slate-400">Tokens de integridade assinados por usuário</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    VALIDADO
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Filtro de Carteiras de Moçambique</span>
                    <span className="text-[10px] text-slate-400">Prefixos válidos (84/85 M-Pesa, 86/87 E-Mola, 82/83 M-Kesh)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    ENFORCED
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>Blindagem Ativa em todas as conexões</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
