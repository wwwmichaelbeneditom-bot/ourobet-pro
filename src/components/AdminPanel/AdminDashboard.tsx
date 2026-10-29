import React, { useState } from 'react';
import {
  ShieldAlert,
  Sliders,
  DollarSign,
  Users,
  Settings,
  Flame,
  CheckCircle2,
  XCircle,
  PlusCircle,
  MinusCircle,
  Ban,
  Check,
  Megaphone,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  ExternalLink,
  Lock,
  Unlock,
  Radio,
  Eye,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  RefreshCw,
  UserPlus,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    adminSettings,
    adminUpdateSettings,
    adminSetNextCrash,
    adminSetNextRoulette,
    adminTriggerCrashNow,
    transactions,
    adminApproveWithdrawal,
    adminRejectWithdrawal,
    adminApproveDeposit,
    adminAdjustUserBalance,
    adminToggleBanUser,
    adminToggleVipUser,
    adminResetToCleanProduction,
    adminCreatePlayer,
    setIsAdminView,
    currencySymbol,
    formatMoney,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'games' | 'finance' | 'users' | 'platform'>('games');
  const [customCrashInput, setCustomCrashInput] = useState<string>('1.15');
  const [userSearch, setUserSearch] = useState<string>('');
  const [balanceAdjustModalUser, setBalanceAdjustModalUser] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [broadcastText, setBroadcastText] = useState<string>(adminSettings.broadcastMessage);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [cleanBankBalance, setCleanBankBalance] = useState<number>(50000);
  const [showNewUserModal, setShowNewUserModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserInitialBalance, setNewUserInitialBalance] = useState<number>(100);

  // Financial computations
  const totalDeposits = transactions
    .filter((t) => t.type === 'deposit' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === 'withdraw' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingWithdrawals = transactions.filter(
    (t) => t.type === 'withdraw' && t.status === 'pending'
  );

  const pendingDeposits = transactions.filter(
    (t) => t.type === 'deposit' && t.status === 'pending'
  );

  const totalWageredAll = users.reduce((acc, u) => acc + u.totalWagered, 0);
  const totalWonAll = users.reduce((acc, u) => acc + u.totalWon, 0);
  const houseProfit = totalWageredAll - totalWonAll;
  const houseProfitMargin = totalWageredAll > 0 ? ((houseProfit / totalWageredAll) * 100).toFixed(1) : '10.0';

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Top Banner Alert / Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">PAINEL DE CONTROLE MASTER</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 uppercase tracking-wide flex items-center gap-1">
                <Lock className="w-3 h-3" /> Identidade Oculta a 7 Chaves
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Operador Offshore: <strong className="text-amber-400">{adminSettings.corporateEntityName}</strong> • Sessão Segura AES-256
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsAdminView(false)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Voltar ao Jogo</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Lucro da Banca (Casa)</span>
            <span className="text-emerald-400 font-bold">{houseProfitMargin}% Margem</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {currencySymbol} {houseProfit > 0 ? `+${houseProfit.toFixed(2)}` : houseProfit.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">Volume apostado: {currencySymbol} {totalWageredAll.toFixed(2)}</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Saques Pendentes</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pendingWithdrawals.length > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
              {pendingWithdrawals.length} aguardando
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
            {currencySymbol} {pendingWithdrawals.reduce((a, b) => a + b.amount, 0).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">Total pago: {currencySymbol} {totalWithdrawals.toFixed(2)}</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Depósitos Confirmados</span>
            <span className="text-cyan-400 font-bold">M-Pesa / E-Mola</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
            {currencySymbol} {totalDeposits.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">Entrada total de capital</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Base de Jogadores</span>
            <span className="text-purple-400 font-bold">{users.filter(u => u.status === 'active').length} Ativos</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300">
            {users.length} Contas
          </div>
          <span className="text-[10px] text-slate-500">{users.filter(u => u.isVip).length} VIPs cadastrados</span>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center space-x-1 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'games', label: 'Controle de Jogos & Rigging', icon: Flame },
          { id: 'finance', label: `Fila de Saques & Finanças (${pendingWithdrawals.length})`, icon: DollarSign },
          { id: 'users', label: 'Gestão de Usuários', icon: Users },
          { id: 'platform', label: 'Configurações & Broadcast', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/20 glow-amber'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GAME RIGGING & CONTROLS */}
      {activeTab === 'games' && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              <strong>Controle Absoluto em Tempo Real:</strong> Você tem poder para definir os resultados dos próximos jogos, forçar crashes imediatos e alterar as margens da banca.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Crash / Aviador Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                    🚀
                  </div>
                  <h3 className="font-bold text-white text-sm">Controle do Crash (Aviador)</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {adminSettings.crash.nextCrashMultiplier ? `Rigged: ${adminSettings.crash.nextCrashMultiplier}x` : 'Automático'}
                </span>
              </div>

              {/* Set Next Crash Multiplier */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Definir Próximo Multiplicador de Crash:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.05"
                    min="1.01"
                    max="1000"
                    value={customCrashInput}
                    onChange={(e) => setCustomCrashInput(e.target.value)}
                    placeholder="Ex: 1.15 ou 50.00"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => {
                      const val = parseFloat(customCrashInput);
                      if (!isNaN(val) && val > 1.0) {
                        adminSetNextCrash(val);
                        soundFx.playWin();
                      }
                    }}
                    className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition active:scale-95"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Quick Rig Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-semibold block">Presets Rápidos de Rigging:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      adminSetNextCrash(1.05);
                      soundFx.playClick();
                    }}
                    className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/20 text-center"
                  >
                    <span className="block text-[10px] text-rose-400">Crash Imediato</span>
                    1.05x
                  </button>
                  <button
                    onClick={() => {
                      adminSetNextCrash(2.00);
                      soundFx.playClick();
                    }}
                    className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-750 text-center"
                  >
                    <span className="block text-[10px] text-slate-400">Padrão</span>
                    2.00x
                  </button>
                  <button
                    onClick={() => {
                      adminSetNextCrash(25.00);
                      soundFx.playClick();
                    }}
                    className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 text-center"
                  >
                    <span className="block text-[10px] text-emerald-400">Mega Jackpot</span>
                    25.00x
                  </button>
                </div>
              </div>

              {/* Emergency Force Crash Now Button */}
              <button
                onClick={() => {
                  adminTriggerCrashNow();
                  soundFx.playCrash();
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-rose-600/30"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Explodir Foguete Agora (Crash Instantâneo)</span>
              </button>

              {adminSettings.crash.nextCrashMultiplier !== null && (
                <button
                  onClick={() => adminSetNextCrash(null)}
                  className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  Cancelar Rigging e Voltar ao Automático
                </button>
              )}
            </div>

            {/* Roulette Double Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    🎰
                  </div>
                  <h3 className="font-bold text-white text-sm">Controle da Roleta (Double)</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {adminSettings.roulette.nextResult ? `Forçando ${adminSettings.roulette.nextResult.toUpperCase()}` : 'RNG Justo'}
                </span>
              </div>

              <span className="text-xs text-slate-300 font-semibold block">
                Forçar Resultado da Próxima Rodada:
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    adminSetNextRoulette('red');
                    soundFx.playClick();
                  }}
                  className={`p-3 rounded-xl border text-center transition ${
                    adminSettings.roulette.nextResult === 'red'
                      ? 'bg-rose-600 border-rose-400 text-white font-extrabold shadow-lg'
                      : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/40'
                  }`}
                >
                  <span className="text-xs font-bold block">VERMELHO</span>
                  <span className="text-[10px] opacity-80">Paga 2x</span>
                </button>

                <button
                  onClick={() => {
                    adminSetNextRoulette('white');
                    soundFx.playClick();
                  }}
                  className={`p-3 rounded-xl border text-center transition ${
                    adminSettings.roulette.nextResult === 'white'
                      ? 'bg-amber-400 border-amber-300 text-slate-950 font-extrabold shadow-lg glow-amber'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  }`}
                >
                  <span className="text-xs font-bold block">BRANCO (0)</span>
                  <span className="text-[10px] opacity-80">Paga 14x</span>
                </button>

                <button
                  onClick={() => {
                    adminSetNextRoulette('black');
                    soundFx.playClick();
                  }}
                  className={`p-3 rounded-xl border text-center transition ${
                    adminSettings.roulette.nextResult === 'black'
                      ? 'bg-slate-800 border-slate-600 text-white font-extrabold shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span className="text-xs font-bold block">PRETO</span>
                  <span className="text-[10px] opacity-80">Paga 2x</span>
                </button>
              </div>

              {adminSettings.roulette.nextResult && (
                <button
                  onClick={() => adminSetNextRoulette(null)}
                  className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  Resetar para RNG Aleatório
                </button>
              )}

              <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">Dica de Gestão de Risco:</span>
                <p className="text-[11px] leading-relaxed">
                  Para proteger a banca, selecione a cor onde os jogadores apostaram o menor volume de dinheiro na rodada.
                </p>
              </div>
            </div>

            {/* Mines Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    💣
                  </div>
                  <h3 className="font-bold text-white text-sm">Controle de Minas (Campo Minado)</h3>
                </div>
              </div>

              {/* X-Ray Switch */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Modo Raio-X (Ver Bombas)</span>
                  <span className="text-[11px] text-slate-400">Destaca as bombas na grade</span>
                </div>
                <button
                  onClick={() => {
                    adminUpdateSettings({
                      mines: {
                        ...adminSettings.mines,
                        showXRayInAdmin: !adminSettings.mines.showXRayInAdmin,
                      }
                    });
                  }}
                  className={`w-11 h-6 rounded-full transition p-0.5 flex items-center ${
                    adminSettings.mines.showXRayInAdmin ? 'bg-amber-400 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-slate-950 shadow" />
                </button>
              </div>

              {/* Force Bomb Trigger */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white block">Rigging de Explosão:</span>
                <button
                  onClick={() => {
                    adminUpdateSettings({
                      mines: {
                        ...adminSettings.mines,
                        forceNextBomb: true,
                      }
                    });
                    soundFx.playClick();
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    adminSettings.mines.forceNextBomb
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>
                    {adminSettings.mines.forceNextBomb
                      ? 'Armado: Próximo Clique Explodirá'
                      : 'Forçar Bomba no Próximo Clique'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCE & SAQUES QUEUE */}
      {activeTab === 'finance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Fila de Liberação de Saques PIX ({pendingWithdrawals.length} pendentes)
            </h3>
            <span className="text-xs text-slate-400">Aprovação em 1 clique</span>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-sm">Fila de Saques Zerada!</h4>
              <p className="text-xs text-slate-400">Todos os saques foram aprovados ou processados.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingWithdrawals.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{tx.userName}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
                        R$ {tx.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Chave PIX ({tx.pixKeyType?.toUpperCase()}):{' '}
                      <strong className="text-slate-200 font-mono select-all">{tx.pixKey}</strong>
                    </div>
                    <div className="text-[10px] text-slate-500">{tx.date} • ID: {tx.id}</div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => adminRejectWithdrawal(tx.id)}
                      className="px-3 py-2 bg-slate-800 hover:bg-rose-950/40 text-rose-300 border border-slate-700 hover:border-rose-800 rounded-xl text-xs font-semibold flex items-center space-x-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Recusar</span>
                    </button>
                    <button
                      onClick={() => adminApproveWithdrawal(tx.id)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/25 transition active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprovar PIX</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All transactions history log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Histórico Geral de Transações da Plataforma
            </h4>

            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {transactions.slice(0, 15).map((t) => (
                <div
                  key={t.id}
                  className="px-3 py-2 bg-slate-950/70 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{t.userName}</span>
                      <span className="text-slate-400 font-normal">• {t.description}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{t.date}</div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-mono font-bold ${
                        t.type === 'deposit' || t.type === 'bet_loss'
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {t.type === 'deposit' ? '+' : t.type === 'withdraw' ? '-' : ''}
                      R$ {t.amount.toFixed(2)}
                    </div>
                    <span className="text-[10px] uppercase text-slate-500">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar jogador por nome ou email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Total: {users.length} jogadores</span>
              <button
                onClick={() => setShowNewUserModal(true)}
                className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Novo Jogador</span>
              </button>
            </div>
          </div>

          {/* Users Table / Card List */}
          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{u.name}</span>
                      {u.role === 'admin' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                          Admin
                        </span>
                      )}
                      {u.isVip && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold text-[9px] uppercase">
                          VIP
                        </span>
                      )}
                      {u.status === 'banned' && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[9px] uppercase">
                          Banido
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </div>
                </div>

                {/* User Financials */}
                <div className="grid grid-cols-3 gap-3 text-center sm:text-left bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Saldo</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      R$ {u.balance.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Apostado</span>
                    <span className="font-mono text-slate-300 text-xs">
                      R$ {u.totalWagered.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Lucro Jogador</span>
                    <span
                      className={`font-mono text-xs font-semibold ${
                        u.totalWon - u.totalWagered >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      R$ {(u.totalWon - u.totalWagered).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1.5 w-full md:w-auto justify-end">
                  <button
                    onClick={() => {
                      setBalanceAdjustModalUser(u.id);
                      setAdjustAmount(100);
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Ajustar Saldo</span>
                  </button>

                  <button
                    onClick={() => adminToggleVipUser(u.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                      u.isVip
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    VIP
                  </button>

                  {u.role !== 'admin' && (
                    <button
                      onClick={() => adminToggleBanUser(u.id)}
                      className={`p-1.5 rounded-lg border transition ${
                        u.status === 'banned'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-rose-400'
                      }`}
                      title={u.status === 'banned' ? 'Desbanir' : 'Banir Jogador'}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PLATFORM CONFIG & BROADCAST */}
      {activeTab === 'platform' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Emergency Switches & House Limits */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Trava Geral & Margem da Casa
            </h3>

            {/* Maintenance Mode Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">Modo Manutenção Geral</span>
                <span className="text-[11px] text-slate-400">
                  Congela todas as apostas e jogos imediatamente
                </span>
              </div>
              <button
                onClick={() => {
                  adminUpdateSettings({ maintenanceMode: !adminSettings.maintenanceMode });
                  soundFx.playClick();
                }}
                className={`w-12 h-6 rounded-full transition p-0.5 flex items-center ${
                  adminSettings.maintenanceMode ? 'bg-rose-600 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow" />
              </button>
            </div>

            {/* Auto-Approve Saques Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">Aprovação Automática de Saques</span>
                <span className="text-[11px] text-slate-400">
                  Aprova saques PIX instantaneamente sem fila manual
                </span>
              </div>
              <button
                onClick={() => {
                  adminUpdateSettings({ autoApproveWithdrawals: !adminSettings.autoApproveWithdrawals });
                  soundFx.playClick();
                }}
                className={`w-12 h-6 rounded-full transition p-0.5 flex items-center ${
                  adminSettings.autoApproveWithdrawals ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-slate-950 shadow" />
              </button>
            </div>

            {/* House Edge % (60% Lucro da Banca) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Margem de Lucro da Banca (House Edge):</span>
                <span className="font-bold text-amber-400 font-mono">{adminSettings.houseEdgePercent}% (RTP: {100 - adminSettings.houseEdgePercent}%)</span>
              </div>
              <input
                type="range"
                min="5"
                max="85"
                value={adminSettings.houseEdgePercent}
                onChange={(e) => adminUpdateSettings({ 
                  houseEdgePercent: Number(e.target.value),
                  globalRtpPercent: 100 - Number(e.target.value)
                })}
                className="w-full accent-amber-400"
              />
              <span className="text-[10px] text-slate-400 block">
                Configurado para 60% de retenção líquida para a banca conforme sua solicitação.
              </span>
            </div>

            {/* Min and Max Bet limits */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Aposta Mínima ({currencySymbol}):</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={adminSettings.minBet}
                  onChange={(e) => adminUpdateSettings({ minBet: Math.max(1, Number(e.target.value)) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Aposta Máxima ({currencySymbol}):</label>
                <input
                  type="number"
                  min="2"
                  max="1000"
                  value={adminSettings.maxBet}
                  onChange={(e) => adminUpdateSettings({ maxBet: Math.max(adminSettings.minBet || 2, Number(e.target.value)) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Super Blindado Firewall & Alta Segurança MFA */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 border border-emerald-500/40 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                Firewall Super Blindado & Segurança Admin
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                100% INVIOLÁVEL
              </span>
            </div>

            {/* Admin Security Level Switch */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">
                  Nível de Acesso ao Painel Admin
                </span>
                <span className="text-[11px] text-slate-400">
                  {adminSettings.firewall?.adminSecurityLevel === 'maximum_shield'
                    ? '🛡️ Modo Blindado Ativo: Exige PIN + Token 2FA + Anti-Brute-Force'
                    : '⚡ Modo Rápido: Alterna com 1-Clique para testes rápidos'}
                </span>
              </div>
              <button
                onClick={() => {
                  const nextLevel = adminSettings.firewall?.adminSecurityLevel === 'maximum_shield' ? 'standard' : 'maximum_shield';
                  adminUpdateSettings({
                    firewall: {
                      ...adminSettings.firewall,
                      adminSecurityLevel: nextLevel,
                    }
                  });
                  soundFx.playWin();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition border ${
                  adminSettings.firewall?.adminSecurityLevel === 'maximum_shield'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                    : 'bg-slate-800 text-amber-300 border-amber-500/40'
                }`}
              >
                {adminSettings.firewall?.adminSecurityLevel === 'maximum_shield'
                  ? 'Blindado (MFA)'
                  : 'Rápido (1-Clique)'}
              </button>
            </div>

            {/* Master PIN & Recovery Key inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">PIN Master do Admin:</label>
                <input
                  type="text"
                  maxLength={6}
                  value={adminSettings.adminPin || '7777'}
                  onChange={(e) => adminUpdateSettings({ adminPin: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Chave Mestra de Emergência:</label>
                <input
                  type="text"
                  value={adminSettings.firewall?.masterRecoveryKey || 'OURO-MASTER-SHIELD-2026'}
                  onChange={(e) => adminUpdateSettings({
                    firewall: {
                      ...adminSettings.firewall,
                      masterRecoveryKey: e.target.value,
                    }
                  })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-white uppercase"
                />
              </div>
            </div>

            {/* Active Firewall protections display */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-1 text-slate-300">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Proteções Ativas do Firewall WAF:</span>
                <span>SHA-256 HMAC</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                ✓ Anti-Tamper de Memória • ✓ Anti-Speedhack (Delta Clock) • ✓ Anti-DDoS Sliding Window • ✓ Lockout de 30s após 3 falhas
              </p>
            </div>
          </div>

          {/* Broadcast / Global Player Announcement */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-emerald-400" />
              Transmissão de Mensagem Global (Broadcast)
            </h3>

            <p className="text-xs text-slate-400">
              Esta mensagem aparecerá em tempo real como um letreiro ou faixa no topo para todos os jogadores conectados.
            </p>

            <div className="space-y-2">
              <textarea
                rows={3}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Ex: 🔥 BÔNUS DE 100% NO PIX HOJE! Aproveite!"
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="broadcastActive"
                    checked={adminSettings.broadcastActive}
                    onChange={(e) => adminUpdateSettings({ broadcastActive: e.target.checked })}
                    className="rounded accent-emerald-500"
                  />
                  <label htmlFor="broadcastActive" className="text-xs text-slate-300 font-semibold cursor-pointer">
                    Exibir para Jogadores
                  </label>
                </div>

                <button
                  onClick={() => {
                    adminUpdateSettings({
                      broadcastMessage: broadcastText,
                      broadcastActive: true,
                    });
                    soundFx.playWin();
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition"
                >
                  Publicar Broadcast
                </button>
              </div>
            </div>
          </div>

          {/* Database Environment & Clean Production Reset Card */}
          <div className="md:col-span-2 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  Ambiente da Plataforma & Dados de Teste
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Por que existem jogadores como Carlos, Lucas e Mariana? Eles foram criados automaticamente como <strong>dados de demonstração</strong> para você testar a fila de saques e os jogos logo após a criação da plataforma.
                </p>
              </div>

              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-rose-600/25 shrink-0 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Zerar Dados de Teste (Modo Limpo)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Bot Simulation Switch */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">Simulação de Apostadores (Bots)</span>
                  <span className="text-[11px] text-slate-400">
                    Gera movimento automático nas salas para novos jogadores
                  </span>
                </div>
                <button
                  onClick={() => {
                    adminUpdateSettings({ simulateOnlinePlayers: !adminSettings.simulateOnlinePlayers });
                    soundFx.playClick();
                  }}
                  className={`w-12 h-6 rounded-full transition p-0.5 flex items-center ${
                    adminSettings.simulateOnlinePlayers ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-slate-950 shadow" />
                </button>
              </div>

              {/* Brand and Security Identity Customizer */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 sm:col-span-2">
                <span className="font-bold text-white text-xs block flex items-center gap-1.5 text-amber-400">
                  <Lock className="w-3.5 h-3.5" />
                  Personalização de Marca & Blindagem da Identidade
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Nome da Plataforma (Marca):
                    </label>
                    <input
                      type="text"
                      value={adminSettings.brandName || 'OUROBET PRO'}
                      onChange={(e) => adminUpdateSettings({ brandName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Razão Social Offshore nos Pagamentos:
                    </label>
                    <input
                      type="text"
                      value={adminSettings.corporateEntityName || 'OUROBET GLOBAL HOLDINGS N.V.'}
                      onChange={(e) => adminUpdateSettings({ corporateEntityName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      PIN Secreto do Cofre Master (4 Dígitos):
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={adminSettings.adminPin || '7777'}
                      onChange={(e) => adminUpdateSettings({ adminPin: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-amber-400 font-bold tracking-widest text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between sm:col-span-2">
                <div>
                  <span className="font-bold text-white text-xs block">Identidade & Titularidade do Proprietário</span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {adminSettings.corporateEntityName} • CNPJ Offshore #8048/JAZ
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-black uppercase tracking-wider">
                  🛡️ 100% Blindado & Anônimo
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-white text-base">Zerar Dados de Demonstração?</h4>
                <p className="text-xs text-rose-300">Esta ação deixará a plataforma 100% limpa.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <p>Ao confirmar, o sistema irá:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Excluir todas as contas fictícias (Carlos, Lucas, Mariana, etc.).</li>
                <li>Limpar todo o histórico de transações e saques simulados.</li>
                <li>Manter <strong>apenas a Diretoria Executiva Master</strong> como proprietária da plataforma.</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Definir Saldo Inicial da Banca do Administrador (R$):
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={cleanBankBalance}
                onChange={(e) => setCleanBankBalance(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-white text-base font-bold focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  adminResetToCleanProduction(cleanBankBalance);
                  setShowResetModal(false);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition shadow-lg shadow-rose-600/30"
              >
                Confirmar e Limpar Base
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New User Modal */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h4 className="font-bold text-white text-base">Cadastrar Novo Jogador</h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Nome Completo:</label>
                <input
                  type="text"
                  placeholder="Ex: João Ferreira"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">E-mail:</label>
                <input
                  type="email"
                  placeholder="joao@gmail.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Saldo Inicial (R$):</label>
                <input
                  type="number"
                  min="0"
                  value={newUserInitialBalance}
                  onChange={(e) => setNewUserInitialBalance(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-white text-sm font-bold mt-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowNewUserModal(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                disabled={!newUserName.trim() || !newUserEmail.trim()}
                onClick={() => {
                  adminCreatePlayer(newUserName, newUserEmail, newUserInitialBalance);
                  setNewUserName('');
                  setNewUserEmail('');
                  setShowNewUserModal(false);
                }}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs disabled:opacity-50"
              >
                Criar Conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Balance Adjustment Modal */}
      {balanceAdjustModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-4">
            <h4 className="font-bold text-white text-sm">Ajustar Saldo do Jogador</h4>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Valor em R$:</label>
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-white text-base font-bold"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  adminAdjustUserBalance(balanceAdjustModalUser, adjustAmount, 'Bônus Administrativo');
                  setBalanceAdjustModalUser(null);
                }}
                className="flex-1 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                + Adicionar R$ {adjustAmount}
              </button>
              <button
                onClick={() => {
                  adminAdjustUserBalance(balanceAdjustModalUser, -adjustAmount, 'Débito Administrativo');
                  setBalanceAdjustModalUser(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl text-xs"
              >
                - Remover R$ {adjustAmount}
              </button>
            </div>
            <button
              onClick={() => setBalanceAdjustModalUser(null)}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
