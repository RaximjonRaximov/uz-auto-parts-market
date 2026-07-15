import { useState } from 'react';
import { X, ShoppingCart, MapPin, MessageSquare, Check } from 'lucide-react';
import { api } from '../lib/api';
import { formatPriceUZS } from '../lib/utils';
import type { Part, Order } from '../types';

interface Props {
  part: Part;
  open: boolean;
  onClose: () => void;
  onCreated?: (order: Order) => void;
}

export function OrderModal({ part, open, onClose, onCreated }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!open) return null;

  const total = part.price_uzs * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: [{ part_id: part.id, quantity }],
        delivery_address: address,
        notes,
      });
      setDone(true);
      onCreated?.(data);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Buyurtma yaratishda xatolik';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--foreground)]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--muted)] transition-colors"
          aria-label="Yopish"
        >
          <X size={20} />
        </button>

        <h3 className="text-2xl font-black text-[var(--foreground)] mb-1 flex items-center gap-2">
          <ShoppingCart size={24} className="text-[var(--accent)]" /> Buyurtma berish
        </h3>
        <p className="text-sm text-[var(--foreground)]/60 mb-6 line-clamp-2">{part.title}</p>

        {done ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--secondary)]/10 text-[var(--secondary)] flex items-center justify-center">
              <Check size={32} />
            </div>
            <h4 className="text-xl font-black text-[var(--foreground)]">Buyurtma qabul qilindi!</h4>
            <p className="text-sm text-[var(--foreground)]/60 mt-2">Sotuvchi tez orada siz bilan bog'lanadi.</p>
            <button onClick={onClose} className="btn-primary mt-6">Yopish</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[var(--foreground)]/70 mb-1">Miqdor</label>
              <input
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1)))}
                className="input-base"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--muted)]">
              <span className="text-sm font-bold text-[var(--foreground)]/70">Umumiy narx</span>
              <span className="text-xl font-black text-[var(--accent)]">{formatPriceUZS(total)}</span>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
              <input
                type="text"
                placeholder="Yetkazib berish manzili"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-base pl-10"
              />
            </div>

            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-[var(--foreground)]/40" size={18} />
              <textarea
                placeholder="Qo'shimcha izoh (ixtiyoriy)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-base pl-10 min-h-[100px] resize-none"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full shine">
              {loading ? 'Yuborilmoqda...' : 'Buyurtma berish'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
