import { MapPin, Layers, Banknote, Tag, ShoppingBag, Wrench, TrendingUp, ShieldCheck } from 'lucide-react';
import { StatCard } from './StatCard';
import { PriceChart } from './PriceChart';
import { useInView } from '../hooks/useInView';
import { formatPriceShort } from '../lib/utils';
import type { StatsSummary, CityStat, CategoryStat, PriceBucket } from '../types';

export function StatsSection({
  stats,
  cityStats,
  categoryStats,
  priceBuckets,
}: {
  stats: StatsSummary | null;
  cityStats: CityStat[];
  categoryStats: CategoryStat[];
  priceBuckets: PriceBucket[];
}) {
  const [ref, visible] = useInView<HTMLDivElement>();

  const topCategories = categoryStats.slice(0, 8);
  const topCities = cityStats.slice(0, 8);

  return (
    <section id="stats" ref={ref} className={`section space-y-10 ${visible ? '' : 'reveal'} ${visible ? 'visible' : ''}`}>
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)]">
          Bozor <span className="text-gradient">statistikasi</span>
        </h2>
        <p className="text-[var(--foreground)]/70 text-lg">
          Haqiqiy e'lonlar asosida tuzilgan narxlar, kategoriyalar va shaharlar bo'yicha tahlil.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Jami zapchastlar" value={stats?.total ?? 0} icon={Layers} accent="primary" />
        <StatCard
          label="O'rtacha narx"
          value={Math.round(stats?.avg_price_uzs ?? 0)}
          suffix=""
          icon={Banknote}
          suffixLabel={formatPriceShort(stats?.avg_price_uzs)}
          accent="accent"
        />
        <StatCard label="Kategoriyalar" value={stats?.categories ?? 0} icon={Tag} accent="warning" />
        <StatCard label="Brendlar" value={stats?.brands ?? 0} icon={ShoppingBag} accent="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart buckets={priceBuckets} />
        </div>
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4 text-[var(--foreground)]">
              <Wrench size={20} className="text-[var(--primary)]" />
              <h3 className="font-bold text-lg">Kategoriyalar bo'yicha</h3>
            </div>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
              {topCategories.map((c) => (
                <div key={c.category} className="flex items-center justify-between p-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] transition-colors">
                  <div className="font-bold text-[var(--foreground)] text-sm">{c.category}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-black text-[var(--foreground)]/60">{c.count}</div>
                    <div className="text-xs font-extrabold text-[var(--accent)]">{formatPriceShort(c.avg_price_uzs)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4 text-[var(--foreground)]">
              <MapPin size={20} className="text-[var(--accent)]" />
              <h3 className="font-bold text-lg">Shaharlar bo'yicha</h3>
            </div>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
              {topCities.map((c) => (
                <div key={c.city} className="flex items-center justify-between p-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] transition-colors">
                  <div className="font-bold text-[var(--foreground)] text-sm">{c.city}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-black text-[var(--foreground)]/60">{c.count}</div>
                    <div className="text-xs font-extrabold text-[var(--primary)]">{formatPriceShort(c.avg_price_uzs)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="font-black text-[var(--foreground)]">Tekshirilgan e'lonlar</div>
            <div className="text-sm font-bold text-[var(--foreground)]/60">Har bir sotuvchi tekshiriladi</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="font-black text-[var(--foreground)]">Real vaqt narxlar</div>
            <div className="text-sm font-bold text-[var(--foreground)]/60">Doimiy yangilanib turadi</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--warning)]/10 flex items-center justify-center text-[var(--warning)]">
            <MapPin size={24} />
          </div>
          <div>
            <div className="font-black text-[var(--foreground)]">Butun O'zbekiston</div>
            <div className="text-sm font-bold text-[var(--foreground)]/60">Barcha viloyat va shaharlardan</div>
          </div>
        </div>
      </div>
    </section>
  );
}
