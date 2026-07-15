import { useState } from 'react';
import { Search, ShieldCheck, MapPin, TrendingUp, Sparkles } from 'lucide-react';
import { HeroVisual } from './HeroVisual';
import { MagneticButton } from './MagneticButton';
import { useParallax } from '../hooks/useParallax';

const POPULAR = ['Tormoz diski', 'Akumulyator', 'Mator moyi', 'Gofra', 'Svecha', 'Amortizator'];

export function Hero({ onSearch }: { onSearch?: (q: string) => void }) {
  const [q, setQ] = useState('');
  const parallaxY = useParallax(0.15);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && q.trim()) {
      onSearch(q.trim());
      document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="top" className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{ transform: `translateY(${parallaxY}px)` }}
      >
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--primary)]/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[var(--accent)]/10 blur-[100px]" />
      </div>

      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 max-w-2xl" style={{ transform: `translateY(${-parallaxY * 0.3}px)` }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-50)] border border-[var(--primary)]/10 px-4 py-1.5 text-sm font-extrabold text-[var(--primary)] animate-[pulse-glow_3s_infinite]">
              <Sparkles size={16} /> O'zbekiston bo'ylab tekshirilgan sotuvchilar
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-balance leading-[1.1]">
              Avto ehtiyot qismlarini{' '}
              <span className="text-gradient">toping va soting</span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--foreground)]/70 font-medium leading-relaxed max-w-xl">
              Brend, model, yil va hudud bo'yicha qidiring. Narxlar, top shahlar va kategoriyalar statistikasi — barchasi tez, zamonaviy va AI-siz.
            </p>

            <form onSubmit={submit} className="relative max-w-xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]">
                <Search size={22} />
              </div>
              <input
                type="text"
                className="form-input pl-12 pr-32 py-4 text-base shadow-xl"
                placeholder="Masalan: tormoz diski Chevrolet Nexia"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Zapchast qidiruv"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 btn-primary px-6 rounded-xl cursor-hover"
              >
                Qidirish
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-[var(--foreground)]/50">Mashhur:</span>
              {POPULAR.map((term) => (
                <MagneticButton
                  key={term}
                  as="button"
                  type="button"
                  onClick={() => {
                    if (onSearch) onSearch(term);
                    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="pill bg-[var(--muted)] text-[var(--foreground)]/80 hover:bg-[var(--primary-50)] hover:text-[var(--primary)] transition-colors cursor-hover"
                >
                  {term}
                </MagneticButton>
              ))}
            </div>

            <div className="flex flex-wrap gap-5 pt-2">
              {[
                { icon: ShieldCheck, text: 'Xavfsiy aloqa' },
                { icon: MapPin, text: 'Butun O\'zbekiston' },
                { icon: TrendingUp, text: 'Real narxlar' },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]/70">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-50)] text-[var(--primary)] flex items-center justify-center">
                    <b.icon size={16} />
                  </div>
                  {b.text}
                </div>
              ))}
            </div>
          </div>

          <HeroVisual offset={parallaxY * 0.4} />
        </div>
      </div>
    </section>
  );
}
