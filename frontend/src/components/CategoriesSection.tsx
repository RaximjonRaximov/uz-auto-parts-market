import { useEffect, useState } from 'react';
import {
  Cog, CircleDot, Battery, Disc, Zap, Droplets, Car, Wrench, Circle, Move, ArrowRight,
} from 'lucide-react';
import { api } from '../lib/api';
import { useInView } from '../hooks/useInView';

const iconMap: Record<string, React.ElementType> = {
  "Dvigatel": Cog,
  "Detali dvigatelya": CircleDot,
  "Transmissiya": Move,
  "Tormoz tizimi": Disc,
  "Xodovoy": Car,
  "Elektrika": Zap,
  "Akumulyator": Battery,
  "Radiator va salnik": Droplets,
  "Kuzov": Car,
  "Salon": Circle,
  "Shinalar va disklar": Disc,
  "Zapchasti": Wrench,
};

const fallback = Wrench;

export function CategoriesSection({ onSelect }: { onSelect?: (category: string) => void }) {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [ref, visible] = useInView<HTMLDivElement>();

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data));
  }, []);

  return (
    <section id="categories" ref={ref} className={`section space-y-10 ${visible ? '' : 'reveal'} ${visible ? 'visible' : ''}`}>
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)]">
          Kategoriyalar <span className="text-gradient">bo'yicha</span>
        </h2>
        <p className="text-lg text-[var(--foreground)]/70 font-medium">
          Kerakli zapchast kategoriyasini tanlang va e'lonlarni filtrlashni boshlang.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 stagger">
        {categories.map((c) => {
          const Icon = iconMap[c.name] || fallback;
          return (
            <button
              key={c.name}
              onClick={() => onSelect && onSelect(c.name)}
              className="group relative p-5 rounded-3xl bg-[var(--card)] border border-[var(--border)] text-center hover:border-[var(--primary)]/40 transition-all hover:-translate-y-2 hover:shadow-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[var(--primary-50)] text-[var(--primary)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-colors shadow-sm group-hover:shadow-lg group-hover:scale-110">
                  <Icon size={28} />
                </div>
                <div>
                  <div className="font-bold text-[var(--foreground)] leading-tight text-sm">{c.name}</div>
                  <div className="text-xs font-extrabold text-[var(--foreground)]/50 mt-1">{c.count} e'lon</div>
                </div>
              </div>
              <div className="absolute top-3 right-3 text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1 group-hover:translate-x-0">
                <ArrowRight size={16} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
