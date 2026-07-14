import { useRef } from 'react';
import { Cog, ShieldCheck, MapPin, Banknote, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useTilt } from '../hooks/useTilt';

export function HeroVisual() {
  const cardRef = useRef<HTMLDivElement>(null);
  const tilt = useTilt(cardRef);

  const stats = [
    { icon: ShieldCheck, label: 'Tekshirilgan', value: '200+' },
    { icon: MapPin, label: 'Shaharlar', value: '58' },
    { icon: Banknote, label: 'Valyuta', value: 'So\'m' },
    { icon: TrendingUp, label: 'Kategoriyalar', value: '12' },
  ];

  return (
    <div className="relative h-full min-h-[460px] flex items-center justify-center" style={{ perspective: '1200px' }}>
      <div
        ref={cardRef}
        {...tilt}
        className="relative w-full max-w-md rounded-[2rem] card-gradient p-7 shadow-2xl flex flex-col gap-6"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-[spin_12s_linear_infinite]">
              <Cog size={28} />
            </div>
            <div>
              <div className="text-xl font-black">UZ Auto Parts</div>
              <div className="text-xs font-bold opacity-80">Bozor statistikasi</div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors group">
              <div className="flex items-center gap-2 mb-2 opacity-80 text-sm font-bold">
                <s.icon size={16} /> {s.label}
              </div>
              <div className="text-2xl font-black group-hover:scale-105 transition-transform origin-left">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-auto p-5 rounded-2xl bg-white/95 text-[var(--foreground)] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase text-[var(--foreground)]/50">O'rtacha narx</span>
            <span className="pill pill-primary text-[10px]">+2.4%</span>
          </div>
          <div className="text-4xl font-black text-gradient-subtle">4.1 mln <span className="text-lg text-[var(--foreground)]/50 font-bold">so'm</span></div>
        </div>
      </div>

      <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[var(--accent)]/25 blur-3xl" />
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[var(--secondary)]/20 blur-3xl" />
    </div>
  );
}
