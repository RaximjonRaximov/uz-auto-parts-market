import { useState } from 'react';
import { CreditCard, Truck, Check, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import { formatPriceUZS } from '../lib/utils';
import type { Order, Payment } from '../types';

interface Props {
  order: Order;
  onPaid?: (payment: Payment) => void;
}

const PROVIDERS = [
  { id: 'payme' as const, label: 'Payme', icon: CreditCard },
  { id: 'click' as const, label: 'Click', icon: CreditCard },
  { id: 'uzum' as const, label: 'Uzum Bank', icon: CreditCard },
  { id: 'cash_on_delivery' as const, label: 'Etkazib berilganda naqd', icon: Truck },
];

export function PaymentButton({ order, onPaid }: Props) {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<Payment['provider']>('payme');
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments', { order_id: order.id, provider });
      setPayment(data);
      if (provider === 'cash_on_delivery') {
        onPaid?.(data);
      } else if (data.payment_url) {
        window.open(data.payment_url, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!payment) return;
    try {
      const { data } = await api.post(`/payments/${payment.id}/confirm`);
      setPayment(data);
      onPaid?.(data);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary shine flex items-center gap-2">
        <CreditCard size={18} /> To'lov
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[var(--foreground)]/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md glass rounded-3xl p-6 shadow-2xl border border-[var(--border)]">
            <h3 className="text-xl font-black text-[var(--foreground)] mb-1">To'lov usulini tanlang</h3>
            <p className="text-sm text-[var(--foreground)]/60 mb-4">
              Buyurtma narxi: <span className="text-[var(--accent)] font-black">{formatPriceUZS(order.total_uzs)}</span>
            </p>

            <div className="space-y-2 mb-6">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                    provider === p.id
                      ? 'border-[var(--primary)] bg-[var(--primary-50)]'
                      : 'border-[var(--border)] hover:bg-[var(--muted)]'
                  }`}
                >
                  <p.icon size={20} className={provider === p.id ? 'text-[var(--primary)]' : 'text-[var(--foreground)]/50'} />
                  <span className="font-bold text-[var(--foreground)]">{p.label}</span>
                </button>
              ))}
            </div>

            {payment ? (
              <div className="space-y-3">
                {payment.status === 'paid' || provider === 'cash_on_delivery' ? (
                  <div className="p-4 rounded-2xl bg-[var(--secondary)]/10 text-[var(--secondary)] text-sm font-bold flex items-center gap-2">
                    <Check size={18} /> To'lov muvaffaqiyatli!
                  </div>
                ) : (
                  <>
                    <a
                      href={payment.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full flex justify-center items-center gap-2"
                    >
                      <ExternalLink size={18} /> To'lov sahifasiga o'tish
                    </a>
                    <button onClick={handleConfirm} className="btn-secondary w-full">
                      To'lov qilganimni tasdiqlash
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button onClick={handlePay} disabled={loading} className="btn-primary w-full shine">
                {loading ? 'Yuklanmoqda...' : 'Toʻlovga oʻtish'}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
