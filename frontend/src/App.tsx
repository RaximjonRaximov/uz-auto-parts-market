import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoriesSection } from './components/CategoriesSection';
import { StatsSection } from './components/StatsSection';
import { ListingsSection } from './components/ListingsSection';
import { MapSection } from './components/MapSection';
import { TrustSection } from './components/TrustSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { api } from './lib/api';
import type { StatsSummary, CityStat, CategoryStat, PriceBucket } from './types';

export default function App() {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [cityStats, setCityStats] = useState<CityStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [priceBuckets, setPriceBuckets] = useState<PriceBucket[]>([]);
  const [heroQuery, setHeroQuery] = useState('');

  useEffect(() => {
    api.get('/stats/summary').then((r) => setStats(r.data));
    api.get('/stats/by-city').then((r) => setCityStats(r.data));
    api.get('/stats/by-category').then((r) => setCategoryStats(r.data));
    api.get('/stats/price-distribution').then((r) => setPriceBuckets(r.data));
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="geo-bg" />
      <div className="grid-pattern" />

      <Header />

      <main id="top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Hero onSearch={setHeroQuery} />
        <CategoriesSection onSelect={(cat) => { setHeroQuery(cat); }} />
        <StatsSection
          stats={stats}
          cityStats={cityStats}
          categoryStats={categoryStats}
          priceBuckets={priceBuckets}
        />
        <ListingsSection heroQuery={heroQuery} />
        <MapSection cities={cityStats} />
        <TrustSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
