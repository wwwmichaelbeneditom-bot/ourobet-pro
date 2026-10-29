export type GameType = 'crash' | 'mines' | 'roulette' | 'coinflip';

export type CurrencyType = 'KZ' | 'BRL' | 'MT' | 'USD' | 'EUR';

export type PaymentMethod = 'multicaixa' | 'pix' | 'mpesa' | 'emola' | 'mkesh' | 'card' | 'crypto';

export interface CountryConfig {
  code: string;
  name: string;
  currency: CurrencyType;
  currencyName: string;
  symbol: string;
  flag: string;
  defaultMethod: PaymentMethod;
  availableMethods: PaymentMethod[];
  rateToUSD: number; // 1 USD = X in this currency
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'MZ',
    name: 'Moçambique',
    currency: 'MT',
    currencyName: 'Metical (MZN)',
    symbol: 'MT',
    flag: '🇲🇿',
    defaultMethod: 'mpesa',
    availableMethods: ['mpesa', 'emola', 'mkesh'],
    rateToUSD: 64.0,
  },
  {
    code: 'AO',
    name: 'Angola',
    currency: 'KZ',
    currencyName: 'Kwanza (AOA)',
    symbol: 'Kz',
    flag: '🇦🇴',
    defaultMethod: 'multicaixa',
    availableMethods: ['multicaixa'],
    rateToUSD: 920.0,
  },
  {
    code: 'BR',
    name: 'Brasil',
    currency: 'BRL',
    currencyName: 'Real Brasileiro (BRL)',
    symbol: 'R$',
    flag: '🇧🇷',
    defaultMethod: 'pix',
    availableMethods: ['pix'],
    rateToUSD: 5.50,
  },
  {
    code: 'EU',
    name: 'Portugal / Europa',
    currency: 'EUR',
    currencyName: 'Euro (EUR)',
    symbol: '€',
    flag: '🇵🇹',
    defaultMethod: 'card',
    availableMethods: ['card', 'crypto'],
    rateToUSD: 0.92,
  },
  {
    code: 'GLOBAL',
    name: 'Internacional / Global',
    currency: 'USD',
    currencyName: 'Dólar Americano (USD)',
    symbol: '$',
    flag: '🌐',
    defaultMethod: 'crypto',
    availableMethods: ['crypto', 'card'],
    rateToUSD: 1.0,
  },
];

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  balance: number;
  bonusBalance: number;
  role: 'admin' | 'player';
  status: 'active' | 'banned' | 'suspended';
  isVip: boolean;
  totalDeposited: number;
  totalWithdrawn: number;
  totalWagered: number;
  totalWon: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdraw' | 'bet_win' | 'bet_loss' | 'admin_adjustment';
  amount: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
  payoutDestination?: string;
  status: 'pending' | 'completed' | 'rejected';
  pixKey?: string;
  pixKeyType?: 'cpf' | 'email' | 'phone' | 'random' | 'iban';
  description: string;
  date: string;
}

export interface LiveBet {
  id: string;
  userName: string;
  avatar: string;
  game: GameType;
  amount: number;
  multiplier?: number;
  payout?: number;
  status: 'playing' | 'cashed_out' | 'crashed' | 'pending';
  time: string;
}

export interface PaymentGatewaysConfig {
  multicaixa: {
    enabled: boolean;
    entidade: string;
    referenciaPadrao: string;
    telefoneExpress: string;
    titular: string;
  };
  pix: {
    enabled: boolean;
    chave: string;
    tipo: 'aleatoria' | 'cnpj' | 'email' | 'telefone';
    beneficiario: string;
  };
  mpesa: {
    enabled: boolean;
    numero: string;
    titular: string;
  };
  emola: {
    enabled: boolean;
    numero: string;
    titular: string;
  };
  mkesh: {
    enabled: boolean;
    numero: string;
    titular: string;
  };
  crypto: {
    enabled: boolean;
    walletUsdt: string;
    rede: string;
  };
}

export interface AdminSettings {
  maintenanceMode: boolean;
  houseEdgePercent: number; // e.g. 5%
  globalRtpPercent: number; // e.g. 88%
  minBet: number;
  maxBet: number;
  minWithdraw: number;
  minDeposit: number;
  autoApproveWithdrawals: boolean;
  firstDepositBonusPercent: number; // 15% bonus on first deposit
  activeGameHouses: GameType[]; // Mínimo 2, Máximo 4 casas de apostas ativas
  
  // Currency & Payment Gateway Config
  currency: CurrencyType;
  currencySymbol: string; // e.g. 'Kz', 'R$', 'MT', '$'
  paymentGateways: PaymentGatewaysConfig;

  // Game-specific rigging & controls
  crash: {
    nextCrashMultiplier: number | null; // null = use RTP algorithm, number = forced crash
    forceCrashNow: boolean;
    rigMode: 'fair' | 'house_favored' | 'forced_loss' | 'forced_win';
  };
  roulette: {
    nextResult: 'red' | 'black' | 'white' | null; // null = fair RNG
    rigMode: 'fair' | 'house_favored';
  };
  mines: {
    forceNextBomb: boolean;
    showXRayInAdmin: boolean;
    rigMode: 'fair' | 'house_favored' | 'forced_loss';
  };
  
  simulateOnlinePlayers: boolean;
  brandName: string; // e.g. 'OUROBET PRO'
  adminPin: string; // e.g. '7777'
  corporateEntityName: string; // e.g. 'OUROBET GLOBAL HOLDINGS N.V.'
  broadcastMessage: string;
  broadcastActive: boolean;
  broadcastType: 'info' | 'warning' | 'promo';

  // Super Blindado Firewall & Master Security
  firewall: {
    active: boolean;
    tamperProtection: boolean;
    speedHackDetection: boolean;
    ddosMitigation: boolean;
    adminSecurityLevel: 'standard' | 'maximum_shield'; // 'maximum_shield' enforces PIN + 2FA Token + Anti-Brute-Force
    masterRecoveryKey: string;
    lastSecurityScan: string;
    blockedThreatsCount: number;
  };
}

export interface CrashHistoryItem {
  id: string;
  multiplier: number;
  time: string;
}

export interface RouletteHistoryItem {
  id: string;
  color: 'red' | 'black' | 'white';
  number: number;
  time: string;
}
