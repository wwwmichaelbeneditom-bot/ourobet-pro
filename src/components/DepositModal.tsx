import React, { useState } from 'react';
import { X, QrCode, Copy, Check, ShieldCheck, Zap, CreditCard, Sparkles, Smartphone, Landmark, Globe, Coins } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { PaymentMethod } from '../types';
import confetti from 'canvas-confetti';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { requestDeposit, currentUser, adminSettings, formatMoney, currencySymbol, activeCountry, countries, switchCountry } = useGame();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(activeCountry?.defaultMethod || 'mpesa');
  const [amount, setAmount] = useState<number>(currencySymbol === 'MT' ? 85 : currencySymbol === 'Kz' ? 2000 : 50);
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Sync selected payment method when country changes
  React.useEffect(() => {
    if (activeCountry?.defaultMethod) {
      setSelectedMethod(activeCountry.defaultMethod);
    }
    if (currencySymbol === 'MT') {
      setAmount(85);
    } else if (currencySymbol === 'Kz') {
      setAmount(2000);
    } else {
      setAmount(50);
    }
  }, [activeCountry?.code, activeCountry?.defaultMethod, currencySymbol]);

  if (!isOpen) return null;

  const quickAmounts = currencySymbol === 'Kz'
    ? [500, 1000, 2500, 5000, 10000]
    : currencySymbol === 'MT'
    ? [20, 50, 85, 100, 250]
    : [20, 50, 100, 200, 500];

  const gateways = adminSettings.paymentGateways || {
    multicaixa: { entidade: '10928', referenciaPadrao: '984 210 405', telefoneExpress: '+244 923 000 000' },
    pix: { chave: 'financeiro@ourobet.pro', tipo: 'email' },
    mpesa: { numero: '+258 84 920 1020', titular: 'OUROBET MOZAMBIQUE (M-Pesa)' },
    emola: { numero: '+258 86 540 3020', titular: 'OUROBET MOZAMBIQUE (E-Mola)' },
    mkesh: { numero: '+258 82 810 4030', titular: 'OUROBET MOZAMBIQUE (M-Kesh)' },
    crypto: { walletUsdt: 'TX8q9A2K9Z3LpM5wE1sR7tY4uI0oP3vN6', rede: 'TRC-20' },
  };

  const pixKeyString = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 14)}520400005303986540${amount}.005802BR5925OUROBET GLOBAL HOLDINGS NV6009SAO PAULO62070503***6304${Math.random().toString(16).substring(2, 6).toUpperCase()}`;

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDeposit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      let methodName = 'Multicaixa Express';
      if (selectedMethod === 'pix') methodName = 'PIX Instantâneo';
      if (selectedMethod === 'mpesa') methodName = 'M-Pesa (Vodacom 🇲🇿)';
      if (selectedMethod === 'emola') methodName = 'E-Mola (Movitel 🇲🇿)';
      if (selectedMethod === 'mkesh') methodName = 'M-Kesh (Tmcel 🇲🇿)';
      if (selectedMethod === 'crypto') methodName = 'USDT Cripto (TRC-20)';
      if (selectedMethod === 'card') methodName = 'Cartão Visa/Mastercard';

      requestDeposit(amount, selectedMethod, methodName);
      setIsProcessing(false);
      setSuccess(true);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">Depositar na {adminSettings.brandName || 'OUROBET PRO'}</h3>
              <p className="text-xs text-slate-400">Pagamento Internacional & Local Instantâneo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white">Depósito Confirmado!</h4>
              <p className="text-sm text-slate-300">
                {formatMoney(amount)} foram adicionados com sucesso à sua carteira.
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                🎁 +15% de Bônus ({formatMoney(amount * 0.15)}) creditados na conta!
              </div>
            </div>
          ) : (
            <>
              {/* Country & Currency Switcher Bar */}
              <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    País & Moeda Local
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    Ativo: {activeCountry.name} ({activeCountry.symbol})
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
                  {countries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        switchCountry(c.code);
                        setSelectedMethod(c.defaultMethod);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                        activeCountry.code === c.code
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <span className="text-sm">{c.flag}</span>
                      <span>{c.name}</span>
                      <span className="font-mono text-[10px] opacity-80 font-black">({c.symbol})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Gateways Selector Tabs */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Selecione o Meio de Pagamento:</label>
                  <span className="text-[10px] text-amber-400 font-bold">🇲🇿 Moçambique: M-Pesa, E-Mola, M-Kesh</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* M-Pesa Moçambique (Principal) */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('mpesa')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedMethod === 'mpesa'
                        ? 'bg-rose-600 text-white border-rose-400 font-bold shadow-md ring-2 ring-rose-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">🇲🇿</span>
                      <span className="text-xs font-black uppercase text-rose-300">M-Pesa</span>
                    </div>
                    <span className="text-[10px] opacity-80 block truncate">Vodacom (84/85)</span>
                  </button>

                  {/* E-Mola Moçambique (Principal) */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('emola')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedMethod === 'emola'
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-md ring-2 ring-amber-400/40'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">🇲🇿</span>
                      <span className="text-xs font-black uppercase text-amber-300">E-Mola</span>
                    </div>
                    <span className="text-[10px] opacity-80 block truncate">Movitel (86/87)</span>
                  </button>

                  {/* M-Kesh Moçambique (Principal) */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('mkesh')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedMethod === 'mkesh'
                        ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-md ring-2 ring-emerald-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">🇲🇿</span>
                      <span className="text-xs font-black uppercase text-emerald-300">M-Kesh</span>
                    </div>
                    <span className="text-[10px] opacity-80 block truncate">Tmcel (82/83)</span>
                  </button>

                  {/* Multicaixa Angola */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('multicaixa')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedMethod === 'multicaixa'
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">🇦🇴</span>
                      <span className="text-xs font-black uppercase">Multicaixa</span>
                    </div>
                    <span className="text-[10px] opacity-80 block truncate">Angola (Express)</span>
                  </button>

                  {/* PIX Brasil */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('pix')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedMethod === 'pix'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">🇧🇷</span>
                      <span className="text-xs font-black uppercase">PIX</span>
                    </div>
                    <span className="text-[10px] opacity-80 block truncate">Brasil (Instantâneo)</span>
                  </button>

                  {/* Cripto USDT Global */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('crypto')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedMethod === 'crypto'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs font-black uppercase">Cripto / Global</span>
                    </div>
                    <span className="text-[10px] opacity-80 block truncate">USDT TRC-20</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Valor do Depósito:</label>
                  <span className="text-xs text-amber-400 font-bold">Moeda: {currencySymbol}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="1000000"
                    step="5"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono text-lg font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Quick amount chips */}
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(q)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition ${
                        amount === q
                          ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      +{q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gateway-specific details box */}
              {selectedMethod === 'multicaixa' && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-amber-400" />
                      Multicaixa Express / Referência Bancária
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Automático</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Entidade:</span>
                      <strong className="text-amber-300 font-mono text-sm">{gateways.multicaixa?.entidade || '10928'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Referência:</span>
                      <strong className="text-white font-mono text-sm">{gateways.multicaixa?.referenciaPadrao || '984 210 405'}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Express por Telefone:</span>
                      <strong className="text-slate-200 font-mono">{gateways.multicaixa?.telefoneExpress || '+244 923 000 000'}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(gateways.multicaixa?.telefoneExpress || '+244 923 000 000')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              {selectedMethod === 'pix' && (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-center py-1">
                    <div className="bg-white p-2.5 rounded-xl shadow-lg border border-slate-300 flex flex-col items-center">
                      <QrCode className="w-24 h-24 text-slate-900" />
                      <span className="text-[9px] text-slate-700 font-bold mt-1 uppercase tracking-wider">{adminSettings.brandName || 'OUROBET PRO'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Código PIX Copia e Cola:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={pixKeyString}
                        className="flex-1 bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-400 rounded-lg truncate font-mono select-all"
                      />
                      <button
                        onClick={() => handleCopyText(pixKeyString)}
                        type="button"
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shrink-0"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* M-PESA VODACOM MOÇAMBIQUE */}
              {selectedMethod === 'mpesa' && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-rose-500" />
                      M-Pesa Moçambique (Vodacom)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                      USSD: *150#
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Número do Agente / Carteira M-Pesa:</span>
                      <strong className="text-rose-400 font-mono text-base font-bold">{gateways.mpesa?.numero || '+258 84 920 1020'}</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Titular: <strong className="text-slate-200">{gateways.mpesa?.titular || 'OUROBET MOZAMBIQUE'}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(gateways.mpesa?.numero || '+258 84 920 1020')}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-xl font-bold flex items-center gap-1 shadow-md transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    💡 <strong>Como pagar:</strong> Disque <strong>*150#</strong> no seu telemóvel Vodacom ou abra a app M-Pesa, escolha <em>"Transferir Dinheiro"</em> para o número acima e confirme o PIN.
                  </p>
                </div>
              )}

              {/* E-MOLA MOVITEL MOÇAMBIQUE */}
              {selectedMethod === 'emola' && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      E-Mola Moçambique (Movitel)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      USSD: *898#
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Número da Carteira E-Mola:</span>
                      <strong className="text-amber-400 font-mono text-base font-bold">{gateways.emola?.numero || '+258 86 540 3020'}</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Titular: <strong className="text-slate-200">{gateways.emola?.titular || 'OUROBET MOZAMBIQUE'}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(gateways.emola?.numero || '+258 86 540 3020')}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs rounded-xl font-bold flex items-center gap-1 shadow-md transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    💡 <strong>Como pagar:</strong> Disque <strong>*898#</strong> no seu telemóvel Movitel ou use a app e-Mola, selecione <em>"Transferir Dinheiro"</em> para o número acima e insira seu PIN.
                  </p>
                </div>
              )}

              {/* M-KESH TMCEL MOÇAMBIQUE */}
              {selectedMethod === 'mkesh' && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      M-Kesh Moçambique (Tmcel)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      USSD: *500#
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Número da Conta M-Kesh:</span>
                      <strong className="text-emerald-400 font-mono text-base font-bold">{gateways.mkesh?.numero || '+258 82 810 4030'}</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Titular: <strong className="text-slate-200">{gateways.mkesh?.titular || 'OUROBET MOZAMBIQUE'}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(gateways.mkesh?.numero || '+258 82 810 4030')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl font-bold flex items-center gap-1 shadow-md transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    💡 <strong>Como pagar:</strong> Disque <strong>*500#</strong> no seu telemóvel Tmcel ou utilize o menu mKesh, selecione <em>"Transferência"</em> para o número acima.
                  </p>
                </div>
              )}

              {selectedMethod === 'crypto' && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-cyan-400" />
                      USDT Cripto Internacional
                    </span>
                    <span className="text-[10px] text-cyan-300 font-semibold">Rede TRC-20 (Tron)</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">Endereço da Carteira USDT (TRC20):</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={gateways.crypto?.walletUsdt || 'TX8q9A2K9Z3LpM5wE1sR7tY4uI0oP3vN6'}
                        className="flex-1 bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-cyan-300 rounded-lg truncate font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyText(gateways.crypto?.walletUsdt || 'TX8q9A2K9Z3LpM5wE1sR7tY4uI0oP3vN6')}
                        className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Promo Banner: 15% New Member First Deposit Bonus */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-emerald-500/15 border border-amber-500/30 text-amber-300 text-xs shadow-md">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-black text-amber-400 block uppercase tracking-wider text-[11px]">
                    🎁 Bônus de Novo Membro: +15% no 1º Depósito
                  </span>
                  <span className="text-slate-300 text-[11px] leading-tight block">
                    Ao realizar seu primeiro depósito de <strong>{formatMoney(amount)}</strong>, você recebe <strong>+{formatMoney(amount * 0.15)}</strong> creditados na hora em saldo bônus!
                  </span>
                </div>
              </div>

              {/* Confirm / Simulate Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmDeposit}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-[0.99] text-slate-950 font-black rounded-xl shadow-lg shadow-amber-400/25 text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processando Pagamento Internacional...</span>
                  </div>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Confirmar Depósito de {formatMoney(amount)}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
