import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Transaction, LiveBet, AdminSettings, CrashHistoryItem, RouletteHistoryItem, GameType, CurrencyType, PaymentMethod, CountryConfig, COUNTRIES } from '../types';
import { soundFx } from '../utils/audio';

const STORAGE_KEY_USER = 'betmaster_user';
const STORAGE_KEY_USERS = 'betmaster_users';
const STORAGE_KEY_SETTINGS = 'betmaster_settings';
const STORAGE_KEY_TRANSACTIONS = 'betmaster_transactions';
const STORAGE_KEY_CRASH_HIST = 'betmaster_crash_hist';
const STORAGE_KEY_ROULETTE_HIST = 'betmaster_roulette_hist';

const DEFAULT_ADMIN: User = {
  id: 'admin-master',
  name: 'Diretoria Executiva (Anon Master)',
  email: 'security.vault@vortex-holding.int',
  avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  balance: 50000.00,
  bonusBalance: 0,
  role: 'admin',
  status: 'active',
  isVip: true,
  totalDeposited: 100000,
  totalWithdrawn: 15000,
  totalWagered: 120000,
  totalWon: 110000,
  createdAt: '2025-01-01',
};

const DEFAULT_PLAYERS: User[] = [
  {
    id: 'player-1',
    name: 'Carlos Silva',
    email: 'carlos.silva@gmail.com',
    phone: '+244 923 111 222',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    balance: 8500.50,
    bonusBalance: 500.00,
    role: 'player',
    status: 'active',
    isVip: true,
    totalDeposited: 24000.00,
    totalWithdrawn: 12000.00,
    totalWagered: 185000.00,
    totalWon: 173000.00,
    createdAt: '2025-02-10',
  },
  {
    id: 'player-2',
    name: 'Lucas Souza',
    email: 'lucas.souza@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    balance: 1400.00,
    bonusBalance: 100.00,
    role: 'player',
    status: 'active',
    isVip: false,
    totalDeposited: 5000.00,
    totalWithdrawn: 3000.00,
    totalWagered: 42000.00,
    totalWon: 39400.00,
    createdAt: '2025-02-15',
  },
  {
    id: 'player-3',
    name: 'Mariana Costa',
    email: 'mariana.costa@hotmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    balance: 3200.75,
    bonusBalance: 250.00,
    role: 'player',
    status: 'active',
    isVip: false,
    totalDeposited: 12000.00,
    totalWithdrawn: 8000.00,
    totalWagered: 89000.00,
    totalWon: 80200.00,
    createdAt: '2025-02-20',
  },
  {
    id: 'player-4',
    name: 'Felipe Rocha',
    email: 'felipe.r@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    balance: 150.00,
    bonusBalance: 0,
    role: 'player',
    status: 'banned',
    isVip: false,
    totalDeposited: 1500.00,
    totalWithdrawn: 0,
    totalWagered: 9500.00,
    totalWon: 8150.00,
    createdAt: '2025-02-22',
  }
];

const DEFAULT_SETTINGS: AdminSettings = {
  maintenanceMode: false,
  houseEdgePercent: 60,
  globalRtpPercent: 40,
  minBet: 2,
  maxBet: 85,
  minWithdraw: 20,
  minDeposit: 10,
  autoApproveWithdrawals: false,
  firstDepositBonusPercent: 15,
  activeGameHouses: ['crash', 'mines', 'roulette', 'coinflip'],

  currency: 'MT',
  currencySymbol: 'MT',
  paymentGateways: {
    mpesa: {
      enabled: true,
      numero: '+258 84 920 1020',
      titular: 'OUROBET MOZAMBIQUE (M-Pesa Vodacom)',
    },
    emola: {
      enabled: true,
      numero: '+258 86 540 3020',
      titular: 'OUROBET MOZAMBIQUE (E-Mola Movitel)',
    },
    mkesh: {
      enabled: true,
      numero: '+258 82 810 4030',
      titular: 'OUROBET MOZAMBIQUE (M-Kesh Tmcel)',
    },
    multicaixa: {
      enabled: true,
      entidade: '10928',
      referenciaPadrao: '984 210 405',
      telefoneExpress: '+244 923 000 000',
      titular: 'OUROBET PAY SERVICES',
    },
    pix: {
      enabled: true,
      chave: 'financeiro@ourobet.pro',
      tipo: 'email',
      beneficiario: 'OUROBET GLOBAL HOLDINGS NV',
    },
    crypto: {
      enabled: true,
      walletUsdt: 'TX8q9A2K9Z3LpM5wE1sR7tY4uI0oP3vN6',
      rede: 'TRC-20 (Tron)',
    },
  },

  crash: {
    nextCrashMultiplier: null,
    forceCrashNow: false,
    rigMode: 'fair',
  },
  roulette: {
    nextResult: null,
    rigMode: 'fair',
  },
  mines: {
    forceNextBomb: false,
    showXRayInAdmin: true,
    rigMode: 'fair',
  },
  simulateOnlinePlayers: true,
  brandName: 'OUROBET PRO',
  adminPin: '7777',
  corporateEntityName: 'OUROBET GLOBAL HOLDINGS N.V.',
  broadcastMessage: '🔥 Bônus de 15% no 1º Depósito via M-Pesa, E-Mola e M-Kesh! Apostas de 2 a 85 MT (+18).',
  broadcastActive: true,
  broadcastType: 'promo',
  firewall: {
    active: true,
    tamperProtection: true,
    speedHackDetection: true,
    ddosMitigation: true,
    adminSecurityLevel: 'maximum_shield',
    masterRecoveryKey: 'OURO-MASTER-SHIELD-2026',
    lastSecurityScan: 'Agora (Protegido)',
    blockedThreatsCount: 0,
  },
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    userId: 'player-1',
    userName: 'Carlos Silva',
    type: 'withdraw',
    amount: 350.00,
    status: 'pending',
    pixKey: 'carlos.silva@pix.com.br',
    pixKeyType: 'email',
    description: 'Solicitação de Saque PIX',
    date: 'Hoje, 19:40',
  },
  {
    id: 'tx-102',
    userId: 'player-3',
    userName: 'Mariana Costa',
    type: 'deposit',
    amount: 150.00,
    status: 'completed',
    pixKey: 'PIX-QR-89102488',
    description: 'Depósito PIX Instantâneo',
    date: 'Hoje, 19:25',
  },
  {
    id: 'tx-103',
    userId: 'player-2',
    userName: 'Lucas Souza',
    type: 'withdraw',
    amount: 100.00,
    status: 'completed',
    pixKey: '11987654321',
    pixKeyType: 'phone',
    description: 'Saque PIX Aprovado pelo Admin',
    date: 'Hoje, 18:15',
  }
];

const INITIAL_CRASH_HISTORY: CrashHistoryItem[] = [
  { id: 'c-1', multiplier: 2.14, time: '19:44' },
  { id: 'c-2', multiplier: 1.25, time: '19:43' },
  { id: 'c-3', multiplier: 7.82, time: '19:42' },
  { id: 'c-4', multiplier: 1.05, time: '19:41' },
  { id: 'c-5', multiplier: 3.40, time: '19:40' },
  { id: 'c-6', multiplier: 14.20, time: '19:39' },
  { id: 'c-7', multiplier: 1.11, time: '19:38' },
];

const INITIAL_ROULETTE_HISTORY: RouletteHistoryItem[] = [
  { id: 'r-1', color: 'red', number: 3, time: '19:44' },
  { id: 'r-2', color: 'black', number: 8, time: '19:43' },
  { id: 'r-3', color: 'red', number: 1, time: '19:42' },
  { id: 'r-4', color: 'white', number: 0, time: '19:40' },
  { id: 'r-5', color: 'black', number: 11, time: '19:39' },
  { id: 'r-6', color: 'red', number: 7, time: '19:38' },
];

interface GameContextType {
  currentUser: User;
  users: User[];
  adminSettings: AdminSettings;
  transactions: Transaction[];
  crashHistory: CrashHistoryItem[];
  rouletteHistory: RouletteHistoryItem[];
  liveBets: LiveBet[];
  isAdminView: boolean;
  isMobileDeviceFrame: boolean;
  soundMuted: boolean;
  musicPlaying: boolean;
  
  // Actions
  setIsAdminView: (val: boolean) => void;
  toggleAdminMode: () => void; // 1-click secret admin/player switcher
  toggleMusic: () => void; // Soft ambient casino melody
  setIsMobileDeviceFrame: (val: boolean) => void;
  setSoundMuted: (val: boolean) => void;
  switchUser: (userId: string) => void;
  loginAsAdmin: () => void;
  placeBet: (game: GameType, amount: number) => { success: boolean; error?: string };
  winBet: (game: GameType, betAmount: number, multiplier: number, payout: number) => void;
  loseBet: (game: GameType, betAmount: number) => void;
  currency: CurrencyType;
  currencySymbol: string;
  formatMoney: (amount: number) => string;
  setPlatformCurrency: (curr: CurrencyType, convertBalances?: boolean) => void;
  activeCountry: CountryConfig;
  countries: CountryConfig[];
  switchCountry: (code: string) => void;
  requestDeposit: (amount: number, method: PaymentMethod | string, details?: string) => void;
  requestWithdrawal: (amount: number, destination: string, method?: PaymentMethod | string, keyType?: string) => { success: boolean; error?: string };
  
  // Admin actions
  adminApproveWithdrawal: (txId: string) => void;
  adminRejectWithdrawal: (txId: string, reason?: string) => void;
  adminApproveDeposit: (txId: string) => void;
  adminAdjustUserBalance: (userId: string, amount: number, note?: string) => void;
  adminToggleBanUser: (userId: string) => void;
  adminToggleVipUser: (userId: string) => void;
  adminUpdateSettings: (newSettings: Partial<AdminSettings>) => void;
  adminSetNextCrash: (multiplier: number | null) => void;
  adminSetNextRoulette: (color: 'red' | 'black' | 'white' | null) => void;
  adminTriggerCrashNow: () => void;
  addCrashHistory: (multiplier: number) => void;
  addRouletteHistory: (color: 'red' | 'black' | 'white', number: number) => void;
  addLiveBet: (bet: Omit<LiveBet, 'id' | 'time'>) => void;
  updateLiveBetStatus: (id: string, status: LiveBet['status'], payout?: number, multiplier?: number) => void;
  clearLiveBets: () => void;
  adminResetToCleanProduction: (initialBankBalance?: number) => void;
  adminCreatePlayer: (name: string, email: string, initialBalance?: number) => void;
  adminToggleGameHouse: (house: GameType) => { success: boolean; error?: string };
  
  // Firewall & High-Security MFA
  adminMfaModalOpen: boolean;
  setAdminMfaModalOpen: (open: boolean) => void;
  firewallModalOpen: boolean;
  setFirewallModalOpen: (open: boolean) => void;
  toggleAdminSecurityLevel: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial states from localStorage with fallbacks & identity sanitizer
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      if (stored) {
        const parsed: User[] = JSON.parse(stored);
        return parsed.map((u) => {
          if (
            u.role === 'admin' ||
            u.name.toLowerCase().includes('michael') ||
            (u.email && u.email.toLowerCase().includes('michaelbenedito'))
          ) {
            return {
              ...u,
              name: 'Diretoria Executiva (Anon Master)',
              email: 'security.vault@vortex-holding.int',
              avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
            };
          }
          return u;
        });
      }
      return [DEFAULT_ADMIN, ...DEFAULT_PLAYERS];
    } catch {
      return [DEFAULT_ADMIN, ...DEFAULT_PLAYERS];
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored || 'player-1';
    } catch {
      return 'player-1';
    }
  });

  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          minBet: parsed.minBet !== undefined && parsed.minBet <= 10 ? parsed.minBet : 2,
          maxBet: parsed.maxBet !== undefined && parsed.maxBet <= 100 ? parsed.maxBet : 85,
          houseEdgePercent: parsed.houseEdgePercent !== undefined ? parsed.houseEdgePercent : 60,
          globalRtpPercent: parsed.globalRtpPercent !== undefined ? parsed.globalRtpPercent : 40,
          firstDepositBonusPercent: parsed.firstDepositBonusPercent ?? 15,
          activeGameHouses: parsed.activeGameHouses && parsed.activeGameHouses.length >= 2 && parsed.activeGameHouses.length <= 4 ? parsed.activeGameHouses : ['crash', 'mines', 'roulette', 'coinflip'],
          currency: parsed.currency || 'MT',
          currencySymbol: parsed.currencySymbol || 'MT',
          brandName: parsed.brandName && parsed.brandName !== 'VORTEX VIP CASINO' && parsed.brandName !== 'BETMASTER PRO' ? parsed.brandName : 'OUROBET PRO',
          corporateEntityName: parsed.corporateEntityName && !parsed.corporateEntityName.includes('VORTEX') && !parsed.corporateEntityName.includes('BETMASTER') ? parsed.corporateEntityName : 'OUROBET GLOBAL HOLDINGS N.V.',
          paymentGateways: {
            ...DEFAULT_SETTINGS.paymentGateways,
            ...(parsed.paymentGateways || {}),
            multicaixa: {
              ...DEFAULT_SETTINGS.paymentGateways.multicaixa,
              ...(parsed.paymentGateways?.multicaixa || {}),
            },
            pix: {
              ...DEFAULT_SETTINGS.paymentGateways.pix,
              ...(parsed.paymentGateways?.pix || {}),
            },
            mpesa: {
              ...DEFAULT_SETTINGS.paymentGateways.mpesa,
              ...(parsed.paymentGateways?.mpesa || {}),
            },
            emola: {
              ...DEFAULT_SETTINGS.paymentGateways.emola,
              ...(parsed.paymentGateways?.emola || {}),
            },
            mkesh: {
              ...DEFAULT_SETTINGS.paymentGateways.mkesh,
              ...(parsed.paymentGateways?.mkesh || {}),
            },
            crypto: {
              ...DEFAULT_SETTINGS.paymentGateways.crypto,
              ...(parsed.paymentGateways?.crypto || {}),
            },
          },
          firewall: {
            ...DEFAULT_SETTINGS.firewall,
            ...(parsed.firewall || {}),
          },
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      return stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [crashHistory, setCrashHistory] = useState<CrashHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CRASH_HIST);
      return stored ? JSON.parse(stored) : INITIAL_CRASH_HISTORY;
    } catch {
      return INITIAL_CRASH_HISTORY;
    }
  });

  const [rouletteHistory, setRouletteHistory] = useState<RouletteHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ROULETTE_HIST);
      return stored ? JSON.parse(stored) : INITIAL_ROULETTE_HISTORY;
    } catch {
      return INITIAL_ROULETTE_HISTORY;
    }
  });

  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState<boolean>(false);
  const [soundMuted, setSoundMutedState] = useState<boolean>(false);
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);

  // Persistent storage synchronizer
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(adminSettings));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [adminSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CRASH_HIST, JSON.stringify(crashHistory));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [crashHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROULETTE_HIST, JSON.stringify(rouletteHistory));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [rouletteHistory]);

  const [musicPlaying, setMusicPlaying] = useState<boolean>(true);
  const [adminMfaModalOpen, setAdminMfaModalOpen] = useState<boolean>(false);
  const [firewallModalOpen, setFirewallModalOpen] = useState<boolean>(false);

  const toggleAdminSecurityLevel = useCallback(() => {
    setAdminSettings((prev) => ({
      ...prev,
      firewall: {
        ...prev.firewall,
        adminSecurityLevel:
          prev.firewall?.adminSecurityLevel === 'maximum_shield' ? 'standard' : 'maximum_shield',
      },
    }));
  }, []);

  const toggleMusic = useCallback(() => {
    const isNowPlaying = soundFx.toggleAmbientMusic();
    setMusicPlaying(isNowPlaying);
  }, []);

  const setSoundMuted = useCallback((muted: boolean) => {
    setSoundMutedState(muted);
    soundFx.setEnabled(!muted);
  }, []);

  const currentUser = users.find(u => u.id === currentUserId) || users[0] || DEFAULT_ADMIN;

  const switchUser = useCallback((userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem(STORAGE_KEY_USER, userId);
    const target = users.find(u => u.id === userId);
    if (target?.role === 'admin') {
      setIsAdminView(true);
    }
  }, [users]);

  const loginAsAdmin = useCallback(() => {
    let admin = users.find(u => u.role === 'admin');
    if (!admin) {
      admin = DEFAULT_ADMIN;
      setUsers(prev => [DEFAULT_ADMIN, ...prev]);
    }
    setCurrentUserId(admin.id);
    localStorage.setItem(STORAGE_KEY_USER, admin.id);
    setIsAdminView(true);
    soundFx.playWin();
  }, [users]);

  // High-Security / 1-Click Switcher between Admin Mode and Player Mode
  const toggleAdminMode = useCallback(() => {
    soundFx.playClick();
    if (isAdminView) {
      // Instantly switch back to player mode
      setIsAdminView(false);
      const player = users.find(u => u.role !== 'admin') || users[1] || users[0];
      if (player) {
        setCurrentUserId(player.id);
        localStorage.setItem(STORAGE_KEY_USER, player.id);
      }
    } else {
      // If maximum_shield is enforced, open the Bank-Grade MFA Portal
      if (adminSettings.firewall?.adminSecurityLevel === 'maximum_shield') {
        setAdminMfaModalOpen(true);
      } else {
        loginAsAdmin();
      }
    }
  }, [isAdminView, users, adminSettings.firewall?.adminSecurityLevel, loginAsAdmin]);

  const setPlatformCurrency = useCallback((curr: CurrencyType, convertBalances: boolean = true) => {
    const targetCountry = COUNTRIES.find(c => c.currency === curr) || COUNTRIES[0];
    const prevCurr = adminSettings.currency || 'KZ';
    const prevCountry = COUNTRIES.find(c => c.currency === prevCurr) || COUNTRIES[1];

    let sym = targetCountry.symbol;
    const minB = adminSettings.minBet || 2;
    const maxB = adminSettings.maxBet || 85;
    let minW = 50;
    let minD = 10;

    if (curr === 'BRL') {
      minW = 20;
      minD = 10;
    } else if (curr === 'MT') {
      minW = 100;
      minD = 50;
    } else if (curr === 'USD' || curr === 'EUR') {
      minW = 10;
      minD = 5;
    } else if (curr === 'KZ') {
      minW = 500;
      minD = 100;
    }

    if (convertBalances && prevCurr !== curr) {
      // Calculate conversion multiplier through USD reference base
      const ratio = targetCountry.rateToUSD / prevCountry.rateToUSD;
      setUsers(prev => prev.map(u => ({
        ...u,
        balance: Number((u.balance * ratio).toFixed(2)),
        bonusBalance: Number((u.bonusBalance * ratio).toFixed(2)),
        totalDeposited: Number((u.totalDeposited * ratio).toFixed(2)),
        totalWithdrawn: Number((u.totalWithdrawn * ratio).toFixed(2)),
        totalWagered: Number((u.totalWagered * ratio).toFixed(2)),
        totalWon: Number((u.totalWon * ratio).toFixed(2)),
      })));
    }

    setAdminSettings(prev => ({
      ...prev,
      currency: curr,
      currencySymbol: sym,
      minBet: minB,
      maxBet: maxB,
      minWithdraw: minW,
      minDeposit: minD,
    }));
    soundFx.playClick();
  }, [adminSettings.currency]);

  const switchCountry = useCallback((code: string) => {
    const found = COUNTRIES.find(c => c.code.toLowerCase() === code.toLowerCase() || c.currency.toLowerCase() === code.toLowerCase());
    if (found) {
      setPlatformCurrency(found.currency, true);
    }
  }, [setPlatformCurrency]);

  const activeCountry = COUNTRIES.find(c => c.currency === (adminSettings.currency || 'MT')) || COUNTRIES[0];

  const formatMoney = useCallback((amount: number): string => {
    const sym = adminSettings.currencySymbol || 'MT';
    return `${sym} ${amount.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [adminSettings.currencySymbol]);

  // Player Place Bet
  const placeBet = useCallback((game: GameType, amount: number): { success: boolean; error?: string } => {
    if (adminSettings.maintenanceMode) {
      return { success: false, error: 'A plataforma está em manutenção pelo Administrador. Tente novamente em breve.' };
    }
    if (currentUser.status === 'banned') {
      return { success: false, error: 'Sua conta foi suspensa ou banida pelo Administrador.' };
    }
    const sym = adminSettings.currencySymbol || 'MT';
    if (amount < adminSettings.minBet) {
      return { success: false, error: `Aposta mínima é de ${sym} ${adminSettings.minBet.toFixed(2)}` };
    }
    if (amount > adminSettings.maxBet) {
      return { success: false, error: `Aposta máxima permitida é de ${sym} ${adminSettings.maxBet.toFixed(2)}` };
    }
    if (currentUser.balance < amount) {
      return { success: false, error: `Saldo insuficiente! Faça um depósito para continuar jogando.` };
    }

    // Deduct balance
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: Number((u.balance - amount).toFixed(2)),
          totalWagered: Number((u.totalWagered + amount).toFixed(2)),
        };
      }
      return u;
    }));

    soundFx.playClick();
    return { success: true };
  }, [adminSettings, currentUser]);

  // Player Win Bet
  const winBet = useCallback((game: GameType, betAmount: number, multiplier: number, payout: number) => {
    const netProfit = payout - betAmount;
    const sym = adminSettings.currencySymbol || 'MT';
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: Number((u.balance + payout).toFixed(2)),
          totalWon: Number((u.totalWon + payout).toFixed(2)),
        };
      }
      return u;
    }));

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'bet_win',
      amount: payout,
      currency: sym,
      status: 'completed',
      description: `Ganho no ${game.toUpperCase()} (${multiplier.toFixed(2)}x) Lucro: +${sym} ${netProfit.toFixed(2)}`,
      date: 'Agora mesmo',
    };

    setTransactions(prev => [tx, ...prev]);
    soundFx.playWin();
  }, [adminSettings.currencySymbol, currentUser]);

  // Player Lose Bet
  const loseBet = useCallback((game: GameType, betAmount: number) => {
    const sym = adminSettings.currencySymbol || 'MT';
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'bet_loss',
      amount: betAmount,
      currency: sym,
      status: 'completed',
      description: `Aposta perdida no ${game.toUpperCase()}`,
      date: 'Agora mesmo',
    };

    setTransactions(prev => [tx, ...prev]);
  }, [adminSettings.currencySymbol, currentUser]);

  // Request Deposit (M-Pesa, E-Mola, M-Kesh, Multicaixa, PIX, Cripto, Cartão)
  const requestDeposit = useCallback((amount: number, method: PaymentMethod | string = 'mpesa', details?: string) => {
    const isAuto = true; // Auto deposit simulation
    const sym = adminSettings.currencySymbol || 'MT';
    
    // Check if new member first deposit
    const isFirstDeposit = currentUser.totalDeposited === 0;
    const bonusPct = (adminSettings.firstDepositBonusPercent ?? 15) / 100;
    const bonusAmount = isFirstDeposit ? Number((amount * bonusPct).toFixed(2)) : 0;

    const tx: Transaction = {
      id: `dep-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'deposit',
      amount,
      currency: sym,
      paymentMethod: (method as PaymentMethod) || 'mpesa',
      status: isAuto ? 'completed' : 'pending',
      description: `Depósito via ${typeof method === 'string' ? method.toUpperCase() : 'M-PESA'}${details ? ` (${details})` : ''}`,
      date: 'Agora mesmo',
    };

    const newTransactions: Transaction[] = [tx];

    if (isFirstDeposit && bonusAmount > 0) {
      const bonusTx: Transaction = {
        id: `bonus-${Date.now() + 1}`,
        userId: currentUser.id,
        userName: currentUser.name,
        type: 'admin_adjustment',
        amount: bonusAmount,
        currency: sym,
        status: 'completed',
        description: `🎁 Bônus de Novo Membro (15% do 1º Depósito)`,
        date: 'Agora mesmo',
      };
      newTransactions.unshift(bonusTx);
    }

    setTransactions(prev => [...newTransactions, ...prev]);

    if (isAuto) {
      setUsers(prev => prev.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            balance: Number((u.balance + amount + bonusAmount).toFixed(2)),
            bonusBalance: Number((u.bonusBalance + bonusAmount).toFixed(2)),
            totalDeposited: Number((u.totalDeposited + amount).toFixed(2)),
          };
        }
        return u;
      }));
      soundFx.playWin();
    }
  }, [adminSettings.currencySymbol, adminSettings.firstDepositBonusPercent, currentUser]);

  // Request Withdrawal (M-Pesa, E-Mola, M-Kesh, Multicaixa, PIX, USDT)
  const requestWithdrawal = useCallback((
    amount: number,
    destination: string,
    method: PaymentMethod | string = 'mpesa',
    pixKeyType: string = 'phone'
  ): { success: boolean; error?: string } => {
    const sym = adminSettings.currencySymbol || 'MT';
    if (currentUser.status === 'banned') {
      return { success: false, error: 'Sua conta está bloqueada pelo administrador.' };
    }
    if (amount < adminSettings.minWithdraw) {
      return { success: false, error: `Saque mínimo permitido é ${sym} ${adminSettings.minWithdraw.toFixed(2)}` };
    }
    if (amount > currentUser.balance) {
      return { success: false, error: 'Saldo insuficiente para realizar este saque.' };
    }

    // Deduct immediately from balance to lock funds
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: Number((u.balance - amount).toFixed(2)),
        };
      }
      return u;
    }));

    const isAuto = adminSettings.autoApproveWithdrawals;
    const tx: Transaction = {
      id: `saque-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'withdraw',
      amount,
      currency: sym,
      paymentMethod: (method as PaymentMethod) || 'mpesa',
      payoutDestination: destination,
      status: isAuto ? 'completed' : 'pending',
      pixKey: destination,
      pixKeyType: pixKeyType as Transaction['pixKeyType'],
      description: `Saque ${String(method).toUpperCase()} para ${destination}`,
      date: 'Agora mesmo',
    };

    setTransactions(prev => [tx, ...prev]);
    soundFx.playClick();
    return { success: true };
  }, [adminSettings, currentUser]);

  // ADMIN ACTIONS
  const adminApproveWithdrawal = useCallback((txId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txId) {
        // Also update totalWithdrawn on user
        setUsers(uList => uList.map(u => {
          if (u.id === t.userId) {
            return {
              ...u,
              totalWithdrawn: Number((u.totalWithdrawn + t.amount).toFixed(2)),
            };
          }
          return u;
        }));
        return { ...t, status: 'completed' };
      }
      return t;
    }));
    soundFx.playWin();
  }, []);

  const adminRejectWithdrawal = useCallback((txId: string, reason?: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txId && t.status === 'pending') {
        // Refund user balance
        setUsers(uList => uList.map(u => {
          if (u.id === t.userId) {
            return {
              ...u,
              balance: Number((u.balance + t.amount).toFixed(2)),
            };
          }
          return u;
        }));
        return {
          ...t,
          status: 'rejected',
          description: `${t.description} (Recusado pelo Admin: ${reason || 'Inconsistência cadastral'})`,
        };
      }
      return t;
    }));
    soundFx.playCrash();
  }, []);

  const adminApproveDeposit = useCallback((txId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txId && t.status === 'pending') {
        setUsers(uList => uList.map(u => {
          if (u.id === t.userId) {
            return {
              ...u,
              balance: Number((u.balance + t.amount).toFixed(2)),
              totalDeposited: Number((u.totalDeposited + t.amount).toFixed(2)),
            };
          }
          return u;
        }));
        return { ...t, status: 'completed' };
      }
      return t;
    }));
    soundFx.playWin();
  }, []);

  const adminAdjustUserBalance = useCallback((userId: string, amount: number, note?: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newBalance = Math.max(0, Number((u.balance + amount).toFixed(2)));
        return { ...u, balance: newBalance };
      }
      return u;
    }));

    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      const tx: Transaction = {
        id: `adj-${Date.now()}`,
        userId,
        userName: targetUser.name,
        type: 'admin_adjustment',
        amount: Math.abs(amount),
        status: 'completed',
        description: `Ajuste Administrativo ${amount >= 0 ? '+' : '-'}: ${note || 'Crédito Manual'}`,
        date: 'Agora mesmo',
      };
      setTransactions(prev => [tx, ...prev]);
    }
    soundFx.playClick();
  }, [users]);

  const adminToggleBanUser = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'banned' ? 'active' : 'banned';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    soundFx.playClick();
  }, []);

  const adminToggleVipUser = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, isVip: !u.isVip };
      }
      return u;
    }));
    soundFx.playClick();
  }, []);

  const adminUpdateSettings = useCallback((newSettings: Partial<AdminSettings>) => {
    setAdminSettings(prev => ({
      ...prev,
      ...newSettings,
      crash: newSettings.crash ? { ...prev.crash, ...newSettings.crash } : prev.crash,
      roulette: newSettings.roulette ? { ...prev.roulette, ...newSettings.roulette } : prev.roulette,
      mines: newSettings.mines ? { ...prev.mines, ...newSettings.mines } : prev.mines,
    }));
    soundFx.playClick();
  }, []);

  const adminToggleGameHouse = useCallback((house: GameType): { success: boolean; error?: string } => {
    const current = adminSettings.activeGameHouses || ['crash', 'mines', 'roulette', 'coinflip'];
    const exists = current.includes(house);

    if (exists) {
      if (current.length <= 2) {
        return { success: false, error: 'A plataforma exige manter no mínimo duas (2) casas de apostas ativas.' };
      }
      const updated = current.filter(h => h !== house);
      setAdminSettings(prev => ({ ...prev, activeGameHouses: updated }));
      soundFx.playClick();
      return { success: true };
    } else {
      if (current.length >= 4) {
        return { success: false, error: 'A plataforma permite no máximo quatro (4) casas de apostas ativas simultaneamente.' };
      }
      const updated = [...current, house];
      setAdminSettings(prev => ({ ...prev, activeGameHouses: updated }));
      soundFx.playWin();
      return { success: true };
    }
  }, [adminSettings.activeGameHouses]);

  const adminSetNextCrash = useCallback((multiplier: number | null) => {
    setAdminSettings(prev => ({
      ...prev,
      crash: {
        ...prev.crash,
        nextCrashMultiplier: multiplier,
      }
    }));
  }, []);

  const adminSetNextRoulette = useCallback((color: 'red' | 'black' | 'white' | null) => {
    setAdminSettings(prev => ({
      ...prev,
      roulette: {
        ...prev.roulette,
        nextResult: color,
      }
    }));
  }, []);

  const adminTriggerCrashNow = useCallback(() => {
    setAdminSettings(prev => ({
      ...prev,
      crash: {
        ...prev.crash,
        forceCrashNow: true,
      }
    }));
  }, []);

  const addCrashHistory = useCallback((multiplier: number) => {
    const item: CrashHistoryItem = {
      id: `c-${Date.now()}`,
      multiplier: Number(multiplier.toFixed(2)),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setCrashHistory(prev => [item, ...prev.slice(0, 24)]);
  }, []);

  const addRouletteHistory = useCallback((color: 'red' | 'black' | 'white', number: number) => {
    const item: RouletteHistoryItem = {
      id: `r-${Date.now()}`,
      color,
      number,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setRouletteHistory(prev => [item, ...prev.slice(0, 24)]);
  }, []);

  const addLiveBet = useCallback((bet: Omit<LiveBet, 'id' | 'time'>) => {
    const newBet: LiveBet = {
      ...bet,
      id: `lb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: 'Agora',
    };
    setLiveBets(prev => [newBet, ...prev.slice(0, 20)]);
  }, []);

  const updateLiveBetStatus = useCallback((id: string, status: LiveBet['status'], payout?: number, multiplier?: number) => {
    setLiveBets(prev => prev.map(b => {
      if (b.id === id) {
        return {
          ...b,
          status,
          payout: payout !== undefined ? payout : b.payout,
          multiplier: multiplier !== undefined ? multiplier : b.multiplier,
        };
      }
      return b;
    }));
  }, []);

  const clearLiveBets = useCallback(() => {
    setLiveBets([]);
  }, []);

  // Reset platform to clean production state (removes all mock test players and mock transactions)
  const adminResetToCleanProduction = useCallback((initialBankBalance: number = 0) => {
    const cleanAdmin: User = {
      ...DEFAULT_ADMIN,
      balance: initialBankBalance,
      totalDeposited: initialBankBalance,
      totalWithdrawn: 0,
      totalWagered: 0,
      totalWon: 0,
    };

    setUsers([cleanAdmin]);
    setCurrentUserId(cleanAdmin.id);
    setTransactions([]);
    setLiveBets([]);
    setCrashHistory([]);
    setRouletteHistory([]);

    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([cleanAdmin]));
      localStorage.setItem(STORAGE_KEY_USER, cleanAdmin.id);
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_CRASH_HIST, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_ROULETTE_HIST, JSON.stringify([]));
    } catch {
      // Storage fallback
    }

    setIsAdminView(true);
    soundFx.playWin();
  }, []);

  // Admin manually create a player account
  const adminCreatePlayer = useCallback((name: string, email: string, initialBalance: number = 0) => {
    const newPlayer: User = {
      id: `player-${Date.now()}`,
      name,
      email,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 1000)}?w=120&auto=format&fit=crop&q=80`,
      balance: initialBalance,
      bonusBalance: 0,
      role: 'player',
      status: 'active',
      isVip: false,
      totalDeposited: initialBalance,
      totalWithdrawn: 0,
      totalWagered: 0,
      totalWon: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers(prev => [newPlayer, ...prev]);

    if (initialBalance > 0) {
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        userId: newPlayer.id,
        userName: newPlayer.name,
        type: 'deposit',
        amount: initialBalance,
        status: 'completed',
        description: 'Saldo inicial creditado pelo Administrador',
        date: 'Agora mesmo',
      };
      setTransactions(prev => [tx, ...prev]);
    }

    soundFx.playWin();
  }, []);

  // Background simulation of other online players wagering for real-time multiplayer feel
  useEffect(() => {
    if (!adminSettings.simulateOnlinePlayers) return;

    const botNames = ['Matheus B.', 'Bruna Lima', 'Rodrigo M.', 'Gabriel F.', 'Camila S.', 'Thiago P.', 'Renato G.', 'Vinicius R.'];
    const botAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&auto=format&fit=crop&q=80',
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.45) {
        const randomName = botNames[Math.floor(Math.random() * botNames.length)];
        const randomAvatar = botAvatars[Math.floor(Math.random() * botAvatars.length)];
        const betAmount = [5, 10, 20, 50, 100, 250][Math.floor(Math.random() * 6)];
        const games: GameType[] = ['crash', 'mines', 'roulette', 'coinflip'];
        const game = games[Math.floor(Math.random() * games.length)];

        addLiveBet({
          userName: randomName,
          avatar: randomAvatar,
          game,
          amount: betAmount,
          status: 'playing',
        });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [addLiveBet, adminSettings.simulateOnlinePlayers]);

  return (
    <GameContext.Provider
      value={{
        currentUser,
        users,
        adminSettings,
        transactions,
        crashHistory,
        rouletteHistory,
        liveBets,
        isAdminView,
        isMobileDeviceFrame,
        soundMuted,
        musicPlaying,
        setIsAdminView,
        toggleAdminMode,
        toggleMusic,
        setIsMobileDeviceFrame,
        setSoundMuted,
        switchUser,
        loginAsAdmin,
        placeBet,
        winBet,
        loseBet,
        requestDeposit,
        requestWithdrawal,
        adminApproveWithdrawal,
        adminRejectWithdrawal,
        adminApproveDeposit,
        adminAdjustUserBalance,
        adminToggleBanUser,
        adminToggleVipUser,
        adminUpdateSettings,
        adminSetNextCrash,
        adminSetNextRoulette,
        adminTriggerCrashNow,
        addCrashHistory,
        addRouletteHistory,
        addLiveBet,
        updateLiveBetStatus,
        clearLiveBets,
        adminResetToCleanProduction,
        adminCreatePlayer,
        adminToggleGameHouse,
        currency: adminSettings.currency || 'MT',
        currencySymbol: adminSettings.currencySymbol || 'MT',
        formatMoney,
        setPlatformCurrency,
        activeCountry,
        countries: COUNTRIES,
        switchCountry,
        adminMfaModalOpen,
        setAdminMfaModalOpen,
        firewallModalOpen,
        setFirewallModalOpen,
        toggleAdminSecurityLevel,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
