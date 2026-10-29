import React from 'react';
import { X, ShieldCheck, Award, AlertTriangle, Scale, Coins, Zap, Rocket, Bomb, Disc, CircleDot, CheckCircle2 } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface HouseRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HouseRulesModal: React.FC<HouseRulesModalProps> = ({ isOpen, onClose }) => {
  const { adminSettings, currencySymbol, formatMoney } = useGame();

  if (!isOpen) return null;

  const minB = adminSettings.minBet || 2;
  const maxB = adminSettings.maxBet || 85;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg leading-tight flex items-center gap-2">
                <span>Regras da Banca & Transparência</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  Provably Fair
                </span>
              </h3>
              <p className="text-xs text-slate-400">Termos Oficiais • Limites • Moeda MZN • Meios Locais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-300 text-xs sm:text-sm">
          {/* Main Key Rules Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Aposta Mínima</span>
              <span className="font-mono font-black text-base text-emerald-400">
                {currencySymbol} {minB.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block">Por rodada</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Aposta Máxima</span>
              <span className="font-mono font-black text-base text-amber-400">
                {currencySymbol} {maxB.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block">Teto de proteção</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Bônus Boas-Vindas</span>
              <span className="font-mono font-black text-base text-cyan-400">
                +{adminSettings.firstDepositBonusPercent ?? 15}%
              </span>
              <span className="text-[10px] text-slate-500 block">1º Depósito</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Margem Banca (Edge)</span>
              <span className="font-mono font-black text-base text-rose-400">
                {adminSettings.houseEdgePercent ?? 60}%
              </span>
              <span className="text-[10px] text-slate-500 block">Margem 60% • RTP 40%</span>
            </div>
          </div>

          {/* Section: Moeda e Pagamentos Moçambique */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Moeda Principal & Pagamentos Oficiais de Moçambique</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              A moeda padrão da plataforma é o <strong>Metical de Moçambique (MZN / MT)</strong>. A plataforma oferece integração para carteiras móveis nacionais sem taxas ocultas:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2">
                <span className="text-lg">🇲🇿</span>
                <div>
                  <strong className="text-rose-300 font-bold block text-xs">M-Pesa (Vodacom)</strong>
                  <span className="text-[10px] text-slate-400">Prefixos 84 e 85 • Instantâneo</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-2">
                <span className="text-lg">🇲🇿</span>
                <div>
                  <strong className="text-amber-300 font-bold block text-xs">E-Mola (Movitel)</strong>
                  <span className="text-[10px] text-slate-400">Prefixos 86 e 87 • Instantâneo</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2">
                <span className="text-lg">🇲🇿</span>
                <div>
                  <strong className="text-emerald-300 font-bold block text-xs">M-Kesh (Tmcel)</strong>
                  <span className="text-[10px] text-slate-400">Prefixos 82 e 83 • Instantâneo</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              * Também suporta jogadores internacionais via conversor de moeda em tempo real (Kz Angola, R$ Brasil, € Euro e $ Dólar).
            </p>
          </div>

          {/* Section: 4 Jogos Oficiais da Casa */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Regras dos 4 Jogos Oficiais da Casa</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Aviador */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                  <Rocket className="w-4 h-4" />
                  <span>1. Aviador Crash</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  O avião decola e o multiplicador cresce de 1.01x a mais de 100x. Você deve sacar o lucro antes que o avião fuja ou exploda. Se não sacar a tempo, a aposta é perdida.
                </p>
              </div>

              {/* Campo Minado */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <Bomb className="w-4 h-4" />
                  <span>2. Campo Minado (Mines)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Grade de 25 casas (5x5). Configure entre 1 e 10 bombas. Cada diamante descoberto multiplica seu saldo. Você pode sacar os lucros a qualquer momento ou arriscar o próximo clique.
                </p>
              </div>

              {/* Roleta Double */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <Disc className="w-4 h-4" />
                  <span>3. Roleta Double</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Aposte nas cores: <strong>Vermelho</strong> paga 2x, <strong>Preto</strong> paga 2x, e a rara casa <strong>Branca (0)</strong> paga 14x o valor apostado!
                </p>
              </div>

              {/* Cara ou Coroa */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                  <CircleDot className="w-4 h-4" />
                  <span>4. Cara ou Coroa (Coin Flip)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Duelo rápido 50/50. Escolha Cara ou Coroa. Em caso de vitória, recebe 1.95x a aposta (5% de rake transparente da banca).
                </p>
              </div>
            </div>
          </div>

          {/* Provably Fair & Segurança */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantia de Jogo Justo (Provably Fair SHA-256)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Todos os sorteios utilizam sementes geradas antes do início de cada rodada. O resultado não pode ser alterado durante a execução do jogo. A taxa matemática da banca (6%) é fixa e os limites de aposta (mínimo de 2 MT e máximo de 85 MT) protegem tanto a saúde financeira dos jogadores quanto o lastro de liquidez da banca.
            </p>
          </div>

          {/* Jogo Responsável */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>Jogo Responsável (+18):</strong> Aposte apenas o que pode arriscar. Esta plataforma é voltada exclusivamente para entretenimento de adultos.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Regulamento oficial • {adminSettings.corporateEntityName || 'OUROBET GLOBAL'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition"
          >
            Entendi as Regras
          </button>
        </div>
      </div>
    </div>
  );
};
