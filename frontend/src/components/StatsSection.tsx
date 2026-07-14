import { MapPin, Layers, Banknote, Tag, ShoppingBag, Wrench } from 'lucide-react';
import { StatCard } from './StatCard';
import { PriceChart } from './PriceChart';
import { RegionCards } from './RegionCards';
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

  return (
    <section id="stats" ref={ref} className={`reveal ${visible ? 'visible' : ''} space-y-8`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Jami zapchastlar" value={stats?.total ?? 0} icon={Layers} />
        <StatCard label="O'rtacha narx" value={Math.round(stats?.avg_price_uzs ?? 0)} suffix="" icon={Banknote} suffixLabel={formatPriceShort(stats?.avg_price_uzs)} />
        <StatCard label="Kategoriyalar" value={stats?.categories ?? 0} icon={Tag} />
        <StatCard label="Brendlar" value={stats?.brands ?? 0} icon={ShoppingBag} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart buckets={priceBuckets} />
        </div>
        <div className="space-y-6">
          <div className="glass rounded-2xl p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-slate-700">
              <Wrench size={20} className="text-fuchsia-500" />
              <h3 className="font-bold text-slate-800">Kategoriyalar bo'yicha</h3>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[200px] space-y-2 pr-2">
              {categoryStats.slice(0, 10).map((c) => (
                <div key={c.category} className="flex items-center justify-between p-3 rounded-xl bg-white/40 hover:bg-white/70 transition-colors">
                  <div className="font-semibold text-slate-700 text-sm">{c.category}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-slate-500">{c.count}</div>
                    <div className="text-xs font-extrabold text-gradient-2">{formatPriceShort(c.avg_price_uzs)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-slate-700">
              <MapPin size={20} className="text-cyan-500" />
              <h3 className="font-bold text-slate-800">Shaharlar bo'yicha</h3>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[200px] space-y-2 pr-2">
              {cityStats.slice(0, 10).map((c) => (
                <div key={c.city} className="flex items-center justify-between p-3 rounded-xl bg-white/40 hover:bg-white/70 transition-colors">
                  <div className="font-semibold text-slate-700 text-sm">{c.city}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-slate-500">{c.count}</div>
                    <div className="text-xs font-extrabold text-gradient-2">{formatPriceShort(c.avg_price_uzs)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RegionCards cities={cityStats.slice(0, 8)} />
    </section>
  );
}
