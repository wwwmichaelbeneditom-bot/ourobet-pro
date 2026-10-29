import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { BroadcastBanner } from './components/BroadcastBanner';
import { BottomNavMobile } from './components/BottomNavMobile';
import { AndroidFrameWrapper } from './components/AndroidFrameWrapper';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { HouseRulesModal } from './components/HouseRulesModal';
import { AdminDashboard } from './components/AdminPanel/AdminDashboard';
import { CrashGame } from './components/Games/CrashGame';
import { MinesGame } from './components/Games/MinesGame';
import { RouletteGame } from './components/Games/RouletteGame';
import { CoinFlipGame } from './components/Games/CoinFlipGame';
import { LiveBetsTicker } from './components/LiveBetsTicker';
import { AdminSecurityModal } from './components/AdminSecurityModal';
import { FirewallStatusModal } from './components/FirewallStatusModal';
import { GameType } from './types';
import {
  Rocket,
  Bomb,
  Disc,
  CircleDot,
  Smartphone,
  ShieldCheck,
  Zap,
  TrendingUp,
  Download,
  AlertCircle,
  HelpCircle,
  Scale,
} from 'lucide-react';
import { soundFx } from './utils/audio';

function MainApp() {
  const {
    isAdminView,
    setIsAdminView,
    adminSettings,
    currentUser,
    adminMfaModalOpen,
    setAdminMfaModalOpen,
    firewallModalOpen,
    setFirewallModalOpen,
  } = useGame();
  const [activeGame, setActiveGame] = useState<GameType>('crash');
  const [depositOpen, setDepositOpen] = useState<boolean>(false);
  const [withdrawOpen, setWithdrawOpen] = useState<boolean>(false);
  const [rulesOpen, setRulesOpen] = useState<boolean>(false);
  const [pinModalOpen, setPinModalOpen] = useState<boolean>(false);
  const [showAndroidInstallHelp, setShowAndroidInstallHelp] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  React.useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    soundFx.playClick();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch {
        // Ignored
      }
      setDeferredPrompt(null);
    } else {
      setShowAndroidInstallHelp(true);
    }
  };

  const games = [
    {
      id: 'crash',
      name: 'Aviador Crash',
      desc: 'Multiplicador até 100x',
      icon: Rocket,
      badge: 'POPULAR 🔥',
      gradient: 'from-rose-500/20 to-orange-500/20 border-rose-500/30',
      activeBorder: 'border-rose-500 text-rose-300',
    },
    {
      id: 'mines',
      name: 'Campo Minado',
      desc: 'Diamantes & Bombas',
      icon: Bomb,
      badge: 'LUCRO RÁPIDO',
      gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
      activeBorder: 'border-emerald-500 text-emerald-300',
    },
    {
      id: 'roulette',
      name: 'Roleta Double',
      desc: 'Branco Paga 14x',
      icon: Disc,
      badge: 'CLÁSSICO',
      gradient: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
      activeBorder: 'border-amber-400 text-amber-300',
    },
    {
      id: 'coinflip',
      name: 'Cara ou Coroa',
      desc: 'Duelo 50/50 1.95x',
      icon: CircleDot,
      badge: 'PVP',
      gradient: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
      activeBorder: 'border-cyan-400 text-cyan-300',
    },
  ];

  const activeHouseIds = adminSettings.activeGameHouses || ['crash', 'mines', 'roulette', 'coinflip'];
  const activeGames = games.filter(g => activeHouseIds.includes(g.id as GameType));

  React.useEffect(() => {
    if (activeGames.length > 0 && !activeHouseIds.includes(activeGame)) {
      setActiveGame(activeGames[0].id as GameType);
    }
  }, [activeHouseIds, activeGame, activeGames]);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans pb-16 sm:pb-8 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenWithdraw={() => setWithdrawOpen(true)}
        onOpenRules={() => setRulesOpen(true)}
      />

      {/* Global Real-Time Broadcast from Admin */}
      <BroadcastBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4">
        {isAdminView ? (
          /* Master Admin Control Center View */
          <AdminDashboard />
        ) : (
          /* Player Betting Experience */
          <div className="space-y-4 animate-fade-in">
            {/* Live Wins Ticker */}
            <LiveBetsTicker />

            {/* Android PWA Install Banner */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-slate-900 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    <span>Otimizado para Celulares Android</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      PWA Nativo
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Jogue em tela cheia no smartphone com vibração e sons de cassino reais.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition uppercase"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar App Oficial</span>
                </button>
                <button
                  onClick={() => setShowAndroidInstallHelp(!showAndroidInstallHelp)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Manual Android/iOS</span>
                </button>
              </div>
            </div>

            {/* Android Install Help Modal/Drawer */}
            {showAndroidInstallHelp && (
              <div className="p-4 bg-slate-900 border border-slate-700 rounded-2xl space-y-3 animate-fade-in text-xs text-slate-300">
                <div className="flex items-center justify-between font-bold text-white text-sm">
                  <span>Como instalar como aplicativo no Android:</span>
                  <button
                    onClick={() => setShowAndroidInstallHelp(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                  <li>Abra este site no <strong>Google Chrome</strong> do seu telefone Android.</li>
                  <li>Toque no menu de <strong>três pontinhos (⋮)</strong> no canto superior direito do Chrome.</li>
                  <li>Selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar aplicativo"</strong>.</li>
                  <li>Pronto! O <strong>{adminSettings.brandName || 'OUROBET PRO'}</strong> abrirá em tela cheia como um app nativo no celular.</li>
                </ol>
              </div>
            )}

            {/* Game Selector Tabs (Casas de Apostas Habilitadas: Mínimo 2, Máximo 4) */}
            <div className={`grid gap-2.5 ${activeGames.length === 2 ? 'grid-cols-2' : activeGames.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
              {activeGames.map((g) => {
                const Icon = g.icon;
                const isSelected = activeGame === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveGame(g.id as GameType);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden group active:scale-[0.98] ${
                      isSelected
                        ? `bg-slate-900 ${g.activeBorder} shadow-xl ring-1 ring-emerald-500/30`
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-950 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                        {g.badge}
                      </span>
                    </div>

                    <div className="font-bold text-white text-xs sm:text-sm tracking-tight truncate">
                      {g.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{g.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Active Game Component Stage */}
            <div className="animate-fade-in">
              {activeGame === 'crash' && <CrashGame />}
              {activeGame === 'mines' && <MinesGame />}
              {activeGame === 'roulette' && <RouletteGame />}
              {activeGame === 'coinflip' && <CoinFlipGame />}
            </div>

            {/* Quick Mozambique Gateways Banner */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center space-x-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                    <span>Depósitos e Saques: M-Pesa, E-Mola e M-Kesh</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      🇲🇿 Moçambique (MZN)
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Moeda Principal: Metical (MT) • Bônus de 15% no 1º Depósito • Apostas de 2 a 85 MT.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => setDepositOpen(true)}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
                >
                  Depositar (M-Pesa / E-Mola / M-Kesh)
                </button>
                <button
                  onClick={() => setWithdrawOpen(true)}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition active:scale-95"
                >
                  Solicitar Saque
                </button>
                <button
                  onClick={() => setRulesOpen(true)}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  title="Ver Regras da Banca"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Regras da Banca</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Android Mobile Bottom Navigation Bar */}
      <BottomNavMobile
        activeGame={activeGame}
        setActiveGame={setActiveGame}
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenPinModal={() => setPinModalOpen(true)}
      />

      {/* High-Security Multi-Factor Authentication Gate */}
      <AdminSecurityModal
        isOpen={adminMfaModalOpen || pinModalOpen}
        onClose={() => {
          setAdminMfaModalOpen(false);
          setPinModalOpen(false);
        }}
        onSuccess={() => {
          setAdminMfaModalOpen(false);
          setPinModalOpen(false);
          setIsAdminView(true);
        }}
      />

      {/* Super Blindado Firewall & Provably Fair Modal */}
      <FirewallStatusModal
        isOpen={firewallModalOpen}
        onClose={() => setFirewallModalOpen(false)}
      />

      {/* Deposit Modal */}
      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />

      {/* Withdrawal Modal */}
      <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />

      {/* House Rules & Fair Play Modal */}
      <HouseRulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AndroidFrameWrapper>
        <MainApp />
      </AndroidFrameWrapper>
    </GameProvider>
  );
}
