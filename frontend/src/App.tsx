import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StatsSection } from './components/StatsSection';
import { ListingsSection } from './components/ListingsSection';
import { MapSection } from './components/MapSection';
import { Footer } from './components/Footer';
import { api } from './lib/api';
import type { StatsSummary, CityStat, CategoryStat, PriceBucket } from './types';

export default function App() {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [cityStats, setCityStats] = useState<CityStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [priceBuckets, setPriceBuckets] = useState<PriceBucket[]>([]);

  useEffect(() => {
    api.get('/stats/summary').then((r) => setStats(r.data));
    api.get('/stats/by-city').then((r) => setCityStats(r.data));
    api.get('/stats/by-category').then((r) => setCategoryStats(r.data));
    api.get('/stats/price-distribution').then((r) => setPriceBuckets(r.data));
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="mesh-grid" />

      <Header />

      <main id="top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
        <Hero cities={cityStats} />

        <StatsSection
          stats={stats}
          cityStats={cityStats}
          categoryStats={categoryStats}
          priceBuckets={priceBuckets}
        />

        <ListingsSection />

        <section id="map" className="space-y-6">
          <MapSection cities={cityStats} />
        </section>

        <section className="glass rounded-3xl p-8 md:p-12 text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow">O'zingizning e'loningizni joylang</h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Loyiha ochiq kodda. Yangi brendlar, zapchast turlari va sotuvchilarni oson qo'shish mumkin.
            </p>
            <a
              href="https://github.com/RaximjonRaximov/uz-auto-parts-market"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-white text-violet-700 font-bold shadow-lg hover:scale-105 transition-transform"
            >
              GitHub'da ko'rish →
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
