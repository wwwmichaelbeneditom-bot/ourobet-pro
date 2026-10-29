import React, { useState } from 'react';
import { X, ArrowUpRight, ShieldCheck, AlertCircle, Clock, CheckCircle2, XCircle, Landmark, Globe, Smartphone, QrCode } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { PaymentMethod } from '../types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, requestWithdrawal, adminSettings, transactions, formatMoney, currencySymbol, activeCountry, countries, switchCountry } = useGame();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(activeCountry?.defaultMethod || 'mpesa');
  const [amount, setAmount] = useState<number>(Math.min(5000, Math.max(adminSettings.minWithdraw, Math.floor(currentUser.balance))));
  const [destination, setDestination] = useState<string>('');
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'email' | 'phone' | 'random' | 'iban'>('phone');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync selected method when country changes
  React.useEffect(() => {
    if (activeCountry?.defaultMethod) {
      setSelectedMethod(activeCountry.defaultMethod);
    }
  }, [activeCountry?.code, activeCountry?.defaultMethod]);

  if (!isOpen) return null;

  const userWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!destination.trim()) {
      setErrorMsg('Informe os dados de destino (IBAN, Telefone, Chave ou Carteira).');
      return;
    }

    if (amount < adminSettings.minWithdraw) {
      setErrorMsg(`O valor mínimo para saque é de ${formatMoney(adminSettings.minWithdraw)}`);
      return;
    }

    if (amount > currentUser.balance) {
      setErrorMsg('Você não possui saldo suficiente para este valor de saque.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = requestWithdrawal(amount, destination, selectedMethod, pixKeyType);
      setIsSubmitting(false);

      if (res.success) {
        setSuccessMsg(`Solicitação de saque de ${formatMoney(amount)} enviada com sucesso! O Administrador irá liberar os fundos.`);
        setDestination('');
      } else {
        setErrorMsg(res.error || 'Erro ao processar saque.');
      }
    }, 600);
  };

  const handleSetPercent = (pct: number) => {
    const val = Math.floor((currentUser.balance * pct) * 100) / 100;
    setAmount(Math.max(adminSettings.minWithdraw, val));
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
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">Solicitar Saque</h3>
              <p className="text-xs text-slate-400">Transferência rápida & internacional</p>
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
          {/* User balance summary */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Saldo Disponível para Saque</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {formatMoney(currentUser.balance)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Saque Mínimo</span>
              <span className="text-xs font-semibold text-slate-300">
                {formatMoney(adminSettings.minWithdraw)}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Country & Currency Selector Bar */}
            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  País & Moeda de Recebimento
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
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
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

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Método de Recebimento:</label>
                <span className="text-[10px] text-amber-400 font-bold">🇲🇿 Moçambique: M-Pesa, E-Mola, M-Kesh</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* M-Pesa Moçambique (Principal) */}
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('mpesa'); setPixKeyType('phone'); }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedMethod === 'mpesa'
                      ? 'bg-rose-600 text-white border-rose-400 font-bold shadow ring-2 ring-rose-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs">🇲🇿</span>
                    <span className="text-xs font-bold text-rose-300">M-Pesa</span>
                  </div>
                  <span className="text-[10px] opacity-80 block truncate">Vodacom (84/85)</span>
                </button>

                {/* E-Mola Moçambique (Principal) */}
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('emola'); setPixKeyType('phone'); }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedMethod === 'emola'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow ring-2 ring-amber-400/40'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs">🇲🇿</span>
                    <span className="text-xs font-bold text-amber-300">E-Mola</span>
                  </div>
                  <span className="text-[10px] opacity-80 block truncate">Movitel (86/87)</span>
                </button>

                {/* M-Kesh Moçambique (Principal) */}
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('mkesh'); setPixKeyType('phone'); }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedMethod === 'mkesh'
                      ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow ring-2 ring-emerald-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs">🇲🇿</span>
                    <span className="text-xs font-bold text-emerald-300">M-Kesh</span>
                  </div>
                  <span className="text-[10px] opacity-80 block truncate">Tmcel (82/83)</span>
                </button>

                {/* Multicaixa Angola */}
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('multicaixa'); setPixKeyType('iban'); }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedMethod === 'multicaixa'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs">🇦🇴</span>
                    <span className="text-xs font-bold">IBAN Bancário</span>
                  </div>
                  <span className="text-[10px] opacity-80 block">Angola / MCX</span>
                </button>

                {/* PIX Brasil */}
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('pix'); setPixKeyType('cpf'); }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedMethod === 'pix'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs">🇧🇷</span>
                    <span className="text-xs font-bold">PIX Direto</span>
                  </div>
                  <span className="text-[10px] opacity-80 block">Brasil</span>
                </button>

                {/* Cripto USDT Global */}
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('crypto'); setPixKeyType('random'); }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedMethod === 'crypto'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Globe className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs font-bold">USDT Cripto</span>
                  </div>
                  <span className="text-[10px] opacity-80 block truncate">TRC-20 Global</span>
                </button>
              </div>
            </div>

            {/* Destination Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {selectedMethod === 'multicaixa'
                  ? 'IBAN da sua conta bancária (ex: AO06...):'
                  : selectedMethod === 'pix'
                  ? 'Chave PIX (CPF, Celular, E-mail ou Aleatória):'
                  : selectedMethod === 'mpesa'
                  ? 'Número de Telemóvel M-Pesa Vodacom (+258 84/85):'
                  : selectedMethod === 'emola'
                  ? 'Número de Telemóvel E-Mola Movitel (+258 86/87):'
                  : selectedMethod === 'mkesh'
                  ? 'Número de Telemóvel M-Kesh Tmcel (+258 82/83):'
                  : 'Endereço da Carteira USDT (Rede TRC-20):'}
              </label>
              <input
                type="text"
                required
                placeholder={
                  selectedMethod === 'multicaixa'
                    ? 'AO06 0040 0000 1234 5678 9012 3'
                    : selectedMethod === 'pix'
                    ? '000.000.000-00 ou seu.email@exemplo.com'
                    : selectedMethod === 'mpesa'
                    ? '+258 84 123 4567'
                    : selectedMethod === 'emola'
                    ? '+258 86 123 4567'
                    : selectedMethod === 'mkesh'
                    ? '+258 82 123 4567'
                    : 'TX8q9A2K9Z3LpM5wE1sR7tY4uI0oP3vN6'
                }
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Amount input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Valor a Sacar:</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min={adminSettings.minWithdraw}
                  max={currentUser.balance}
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-base font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Percent buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { label: '25%', val: 0.25 },
                  { label: '50%', val: 0.5 },
                  { label: '75%', val: 0.75 },
                  { label: 'Tudo', val: 1 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSetPercent(p.val)}
                    className="py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notice */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Os saques são verificados e autorizados no <strong>Painel Master da OUROBET PRO</strong> com liquidação direta para o seu método de escolha.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || currentUser.balance < adminSettings.minWithdraw}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.99] text-slate-950 font-black rounded-xl shadow-lg shadow-cyan-500/20 text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Processando Solicitação...</span>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Confirmar Saque de {formatMoney(amount)}</span>
                </>
              )}
            </button>
          </form>

          {/* Recent user withdrawals list */}
          {userWithdrawals.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400">Histórico de Saques</h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {userWithdrawals.slice(0, 5).map((w) => (
                  <div key={w.id} className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-bold text-white">{w.currency || currencySymbol} {w.amount.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">{w.date} • {w.payoutDestination || w.pixKey}</div>
                    </div>
                    <div>
                      {w.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Aguardando Admin
                        </span>
                      )}
                      {w.status === 'completed' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Pago
                        </span>
                      )}
                      {w.status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-semibold flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Recusado
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
