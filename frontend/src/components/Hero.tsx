import { Search, ArrowRight, ShieldCheck, Truck, BadgeCheck, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { HeroVisual } from './HeroVisual';

export function Hero({ onSearch }: { onSearch?: (q: string) => void }) {
  const [ref, visible] = useInView<HTMLDivElement>();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
    const el = document.getElementById('listings');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const chips = ["Tormoz diski", "Akumulyator", "Mator moy", "Gofra", "Svecha"];

  return (
    <section ref={ref} className="relative min-h-[540px] grid lg:grid-cols-2 gap-12 items-center py-12 lg:py-16">
      <div className={`space-y-8 ${visible ? '' : 'reveal'} ${visible ? 'visible' : ''}`}>
        <div className="inline-flex items-center gap-2 pill pill-category">
          <BadgeCheck size={14} />
          O'zbekiston bo'ylab tekshirilgan sotuvchilar
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-balance leading-[1.05]">
          Avto <span className="text-gradient">ehtiyot qismlarini</span> toping va soting
        </h1>

        <p className="text-lg text-[var(--foreground)]/70 max-w-xl leading-relaxed">
          Brend, model, yil va hudud bo'yicha qidiring. Narxlar, top shahlar va kategoriyalar statistikasi — barchasi tez, zamonaviy va AI-siz.
        </p>

        <form onSubmit={handleSubmit} className="relative max-w-xl">
          <div className="glass-card p-2 flex items-center gap-2 shadow-lg">
            <div className="pl-3 text-[var(--primary)]">
              <Search size={22} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Masalan: tormoz diski Chevrolet Nexia"
              className="flex-1 bg-transparent outline-none text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 py-3 px-2"
              aria-label="Zapchast qidiruv"
            />
            <button type="submit" className="btn-primary py-3 px-6 whitespace-nowrap">
              Qidirish <ArrowRight size={18} />
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[var(--foreground)]/60 font-semibold">Mashhur:</span>
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => {
                setQuery(c);
                if (onSearch) onSearch(c);
                const el = document.getElementById('listings');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] font-bold hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]/70">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <ShieldCheck size={16} />
            </div>
            Xavfsiy aloqa
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]/70">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <Truck size={16} />
            </div>
            Butun O'zbekiston
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]/70">
            <div className="w-8 h-8 rounded-full bg-[var(--warning)]/10 flex items-center justify-center text-[var(--warning)]">
              <TrendingUp size={16} />
            </div>
            Real narxlar
          </div>
        </div>
      </div>

      <div className={`hidden lg:block ${visible ? '' : 'reveal'} ${visible ? 'visible' : ''}`}>
        <HeroVisual />
      </div>
    </section>
  );
}
