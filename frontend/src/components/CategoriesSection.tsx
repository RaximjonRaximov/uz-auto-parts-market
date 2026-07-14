import { useEffect, useState } from 'react';
import {
  Cog, CircleDot, Battery, Disc, Zap, Droplets, Car, Wrench, Circle, Move,
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
    <section id="categories" ref={ref} className={`section space-y-8 ${visible ? '' : 'reveal'} ${visible ? 'visible' : ''}`}>
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)]">
          Kategoriyalar <span className="text-gradient">bo'yicha</span>
        </h2>
        <p className="text-[var(--foreground)]/70 text-lg">
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
              className="card p-5 flex flex-col items-center gap-3 text-center hover:border-[var(--primary)] transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                <Icon size={28} />
              </div>
              <div>
                <div className="font-bold text-[var(--foreground)] leading-tight">{c.name}</div>
                <div className="text-xs font-extrabold text-[var(--foreground)]/50 mt-1">{c.count} e'lon</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
