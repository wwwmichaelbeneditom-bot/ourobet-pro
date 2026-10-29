import React, { useState } from 'react';
import {
  ShieldAlert,
  Wallet,
  Plus,
  ArrowUpRight,
  Volume2,
  VolumeX,
  Smartphone,
  Lock,
  ChevronDown,
  Sparkles,
  Crown,
  KeyRound,
  Globe,
  Scale,
  Music,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundFx } from '../utils/audio';

interface NavbarProps {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenRules: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDeposit, onOpenWithdraw, onOpenRules }) => {
  const {
    currentUser,
    users,
    switchUser,
    isAdminView,
    setIsAdminView,
    toggleAdminMode,
    musicPlaying,
    toggleMusic,
    setFirewallModalOpen,
    isMobileDeviceFrame,
    setIsMobileDeviceFrame,
    soundMuted,
    setSoundMuted,
    adminSettings,
    formatMoney,
    activeCountry,
    countries,
    switchCountry,
  } = useGame();

  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showCountryMenu, setShowCountryMenu] = useState<boolean>(false);

  const brandParts = (adminSettings.brandName || 'OUROBET PRO').split(' ');
  const brandFirst = brandParts[0] || 'OUROBET';
  const brandRest = brandParts.slice(1).join(' ') || 'PRO';

  // 1-Click Secret Switcher between Admin and Player mode
  const handleAdminToggle = () => {
    soundFx.playClick();
    toggleAdminMode();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#060912]/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div
              onClick={() => setIsAdminView(false)}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition glow-amber">
                <Crown className="w-5 h-5 fill-current stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-black text-white text-base tracking-tight font-sans">
                    {brandFirst}
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 uppercase tracking-wider">
                    {brandRest}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Cassino & Apostas Online
                </span>
              </div>
            </div>

            {/* 1-Click Secret Switcher: Admin Mode <-> Player Mode */}
            <button
              onClick={handleAdminToggle}
              title="Alternar entre Modo Administrador e Jogador com 1 clique"
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition active:scale-95 shadow-md ${
                isAdminView
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-500/30 glow-amber'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-amber-500/50'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 ${isAdminView ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{isAdminView ? 'Modo Jogador (1 Clique)' : 'Modo Admin (1 Clique)'}</span>
            </button>
          </div>

          {/* Center/Right: Country selector, Balance, Deposit, Profile & Device switches */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Country & Currency Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowCountryMenu(!showCountryMenu);
                }}
                className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-900/95 hover:bg-slate-800 border border-slate-750 text-xs font-bold text-slate-200 transition shadow-inner"
                title={`País ativo: ${activeCountry.name} (${activeCountry.symbol})`}
              >
                <span className="text-base leading-none">{activeCountry.flag}</span>
                <span className="font-mono text-amber-400 font-extrabold text-[11px] sm:text-xs">
                  {activeCountry.symbol}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showCountryMenu && (
                <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span>🌍 Moeda por País</span>
                    <span className="text-emerald-400 font-bold">Câmbio Real</span>
                  </div>
                  {countries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        switchCountry(c.code);
                        setShowCountryMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition ${
                        activeCountry.code === c.code
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl">{c.flag}</span>
                        <div className="text-left">
                          <span className="block leading-tight">{c.name}</span>
                          <span className={`text-[10px] block ${activeCountry.code === c.code ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                            {c.currencyName}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-xs px-1.5 py-0.5 rounded bg-black/20">
                        {c.symbol}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Balance Chip */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-2 sm:px-3 py-1.5 space-x-2 shadow-inner">
              <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block leading-none">
                  Saldo Real
                </span>
                <span className="font-mono font-black text-xs sm:text-sm text-emerald-400 leading-tight">
                  {formatMoney(currentUser.balance)}
                </span>
              </div>
            </div>

            {/* Deposit Button (PIX) */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenDeposit();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">Depositar</span>
            </button>

            {/* Saque Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenWithdraw();
              }}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 active:scale-95 transition"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sacar</span>
            </button>

            {/* Super Blindado Firewall Status Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                setFirewallModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition shadow-sm active:scale-95"
              title="Firewall Blindado Ativo • SHA-256 Provably Fair • 100% Inviolável"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Firewall Blindado</span>
            </button>

            {/* Regras da Banca Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenRules();
              }}
              className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs font-bold border border-slate-700/80 active:scale-95 transition"
              title="Regras da Banca, Limites 2-85 e Moeda MZN"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Regras da Banca</span>
            </button>

            {/* Ambient Lounge Melody Toggle */}
            <button
              onClick={() => {
                toggleMusic();
              }}
              className={`p-2 rounded-xl border transition flex items-center space-x-1.5 ${
                musicPlaying
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border-slate-800'
              }`}
              title={musicPlaying ? 'Pausar Melodia Suave de Cassino' : 'Tocar Melodia Suave e Atraente'}
            >
              <Music className={`w-4 h-4 ${musicPlaying ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden xl:inline text-[10px] font-bold">
                {musicPlaying ? 'Música: ON' : 'Música: OFF'}
              </span>
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition"
              title={soundMuted ? 'Ativar Efeitos Sonoros' : 'Desativar Efeitos Sonoros'}
            >
              {soundMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Android Mobile Frame Simulator toggle */}
            <button
              onClick={() => setIsMobileDeviceFrame(!isMobileDeviceFrame)}
              className={`hidden md:flex items-center space-x-1 p-2 rounded-xl border transition text-xs font-semibold ${
                isMobileDeviceFrame
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Alternar Modo Celular Android"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* User selector dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-medium text-slate-200 transition"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                />
                <span className="hidden md:inline max-w-[80px] truncate">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-scale-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3.5 py-2 border-b border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Jogador Ativo:
                    </span>
                    <div className="font-bold text-white text-xs truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                  </div>

                  {/* Public user switcher: displays players */}
                  <div className="py-1">
                    <span className="px-3.5 py-1 text-[10px] uppercase font-semibold text-slate-500 block">
                      Alternar Conta:
                    </span>
                    {users
                      .filter((u) => u.role !== 'admin')
                      .map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowUserMenu(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-slate-800 text-xs transition ${
                            u.id === currentUser.id
                              ? 'bg-slate-800/60 font-bold text-amber-300'
                              : 'text-slate-300'
                          }`}
                        >
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="flex-1 truncate">
                            <span className="truncate block">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatMoney(u.balance)}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>

                  {/* 1-Click Secret Switcher */}
                  <div className="border-t border-slate-800 pt-1 mt-1 px-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleAdminToggle();
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isAdminView ? 'Modo Jogador (1 Clique)' : 'Modo Administrador (1 Clique)'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
