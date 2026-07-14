import { useEffect, useState } from 'react';
import { MapPin, Phone, Star, Store, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import type { Seller } from '../types';

export function SellersSection() {
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    api.get('/sellers?limit=12').then((r) => setSellers(r.data));
  }, []);

  if (sellers.length === 0) return null;

  return (
    <section className="section">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-50)] border border-[var(--primary)]/10 px-4 py-1.5 text-sm font-extrabold text-[var(--primary)]">
          <Store size={16} /> Sotuvchilar
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)]">
          <span className="text-gradient">Tekshirilgan</span> sotuvchilar
        </h2>
        <p className="text-lg text-[var(--foreground)]/70 font-medium">
          O'zbekiston bo'ylab avto zapchast sotuvchilari va do'konlari.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sellers.map((s) => (
          <div
            key={s.id}
            className="card p-5 flex flex-col gap-3 group spotlight"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-[var(--foreground)] leading-tight group-hover:text-[var(--primary)] transition-colors">
                  {s.name}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-sm text-[var(--muted-foreground)]">
                  <MapPin size={14} className="text-[var(--accent)]" />
                  <span className="truncate">{[s.city, s.region].filter(Boolean).join(', ')}</span>
                </div>
              </div>
              {s.verified ? (
                <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
              ) : null}
            </div>

            {s.brands ? (
              <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">Brendlar: {s.brands}</p>
            ) : null}

            <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                <Star size={14} fill="currentColor" />
                {s.rating.toFixed(1)}
              </div>
              {s.phone ? (
                <a
                  href={`tel:${s.phone}`}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-600)]"
                >
                  <Phone size={14} />
                  {s.phone}
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
