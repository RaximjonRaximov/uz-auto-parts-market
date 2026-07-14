import { Cog, ShieldCheck, MapPin, Banknote, TrendingUp } from 'lucide-react';

export function HeroVisual() {
  return (
    <div className="relative h-full min-h-[420px] flex items-center justify-center" style={{ perspective: '1000px' }}>
      <div className="absolute inset-0 spark-grid opacity-40" />

      <div
        className="relative w-full max-w-md rounded-[2rem] bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] p-6 shadow-2xl flex flex-col gap-5 text-white"
        style={{ transform: 'rotateY(-8deg) rotateX(6deg)', transformStyle: 'preserve-3d' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Cog size={24} />
          </div>
          <div>
            <div className="text-lg font-black">200+ zapchast</div>
            <div className="text-xs font-bold opacity-80">Barcha brendlar</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm flex items-center gap-3">
            <ShieldCheck size={20} className="text-green-200 shrink-0" />
            <span className="text-xs font-bold">Tekshirilgan sotuvchilar</span>
          </div>
          <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm flex items-center gap-3">
            <MapPin size={20} className="text-purple-200 shrink-0" />
            <span className="text-xs font-bold">58 ta shahar</span>
          </div>
          <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm flex items-center gap-3">
            <Banknote size={20} className="text-yellow-200 shrink-0" />
            <span className="text-xs font-bold">So'm va USD</span>
          </div>
          <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm flex items-center gap-3">
            <TrendingUp size={20} className="text-cyan-200 shrink-0" />
            <span className="text-xs font-bold">Real narxlar</span>
          </div>
        </div>

        <div className="mt-auto p-4 rounded-2xl bg-white/90 text-[var(--foreground)]">
          <div className="text-xs font-bold text-[var(--foreground)]/60 uppercase">O'rtacha narx</div>
          <div className="text-3xl font-black text-[var(--accent)]">4.1 mln so'm</div>
          <div className="text-sm font-bold text-[var(--foreground)]/70 mt-1">12 ta kategoriya</div>
        </div>
      </div>

      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-[var(--accent)]/20 blur-3xl" />
      <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-[var(--primary)]/20 blur-3xl" />
    </div>
  );
}
