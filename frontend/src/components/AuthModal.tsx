import { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: Props) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    city: '',
  });

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          phone: form.phone,
          city: form.city,
        });
      }
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Xatolik yuz berdi';
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

        <h3 className="text-2xl font-black text-[var(--foreground)] mb-2">
          {mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
        </h3>
        <p className="text-sm text-[var(--foreground)]/60 mb-6">
          {mode === 'login'
            ? 'E-bozorga kirish uchun maʼlumotlaringizni kiriting'
            : "Yangi akkaunt yaratib, e'lonlar va buyurtmalardan foydalaning"}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
                <input
                  type="text"
                  required
                  placeholder="To'liq ism"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="input-base pl-10"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
                <input
                  type="tel"
                  placeholder="Telefon raqam"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-base pl-10"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
                <input
                  type="text"
                  placeholder="Shahar"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="input-base pl-10"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
            <input
              type="email"
              required
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-base pl-10"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Parol"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-base pl-10"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full shine">
            {loading ? 'Kutilmoqda...' : mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--foreground)]/70">
          {mode === 'login' ? "Akkauntingiz yo'qmi?" : 'Akkauntingiz bormi?'}{' '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="font-extrabold text-[var(--primary)] hover:underline"
          >
            {mode === 'login' ? "Ro'yxatdan o'tish" : 'Kirish'}
          </button>
        </div>
      </div>
    </div>
  );
}
