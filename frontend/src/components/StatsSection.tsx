import { Package, Tag, Car, MapPin, Banknote } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { useCountUp } from '../hooks/useCountUp';
import { PriceChart } from './PriceChart';
import { StatCard } from './StatCard';
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
  const totalCount = useCountUp(stats?.total ?? 0, 1500);
  const avgPrice = useCountUp(Math.round(stats?.avg_price_uzs ?? 0), 1500);

  const topCategories = categoryStats.slice(0, 6);
  const topCities = cityStats.slice(0, 6);

  return (
    <section id="stats" ref={ref} className={`section space-y-12 ${visible ? '' : 'reveal'} ${visible ? 'visible' : ''}`}>
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)]">
          Bozor <span className="text-gradient">statistikasi</span>
        </h2>
        <p className="text-lg text-[var(--foreground)]/70 font-medium">
          Haqiqiy e'lonlar asosida tuzilgan narxlar, kategoriyalar va shaharlar bo'yicha tahlil.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
        <StatCard icon={<Package size={24} />} value={String(totalCount)} label="Jami zapchastlar" />
        <StatCard icon={<Banknote size={24} />} value={`${formatPriceShort(avgPrice)}`} label="O'rtacha narx" />
        <StatCard icon={<Tag size={24} />} value={String(stats?.categories ?? 0)} label="Kategoriyalar" />
        <StatCard icon={<Car size={24} />} value={String(stats?.brands ?? 0)} label="Brendlar" accent />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart buckets={priceBuckets} />
        </div>

        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2 text-[var(--foreground)]">
            <MapPin size={22} className="text-[var(--accent)]" />
            <h3 className="font-bold text-lg">Top shahlar</h3>
          </div>
          <div className="space-y-4">
            {topCities.map((c) => (
              <div key={c.city} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-[var(--foreground)]">{c.city}</span>
                  <span className="text-[var(--primary)]">{c.count} ta</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-700"
                    style={{ width: visible ? `${Math.min(100, (c.count / 12) * 100)}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-lg text-[var(--foreground)] mb-6 flex items-center gap-2">
          <Tag size={22} className="text-[var(--primary)]" /> Kategoriyalar bo'yicha
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {topCategories.map((c) => (
            <div
              key={c.category}
              className="p-4 rounded-2xl bg-[var(--muted)] hover:bg-[var(--primary-50)] transition-colors text-center group cursor-pointer"
            >
              <div className="text-2xl font-black text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{c.count}</div>
              <div className="text-xs font-bold text-[var(--foreground)]/60 mt-1">{c.category}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
