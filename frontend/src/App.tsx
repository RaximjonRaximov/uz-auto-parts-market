import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { CategoriesSection } from './components/CategoriesSection';
import { StatsSection } from './components/StatsSection';
import { ListingsSection } from './components/ListingsSection';
import { GlobeSection } from './components/GlobeSection';
import { MapSection } from './components/MapSection';
import { SellersSection } from './components/SellersSection';
import { ServiceCentersSection } from './components/ServiceCentersSection';
import { TrustSection } from './components/TrustSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { ScrollProgress } from './components/ScrollProgress';
import { api } from './lib/api';
import type { StatsSummary, CityStat, CategoryStat, PriceBucket } from './types';

const BRANDS = [
  'Chevrolet', 'Kia', 'Hyundai', 'Toyota', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volkswagen', 'Haval', 'BYD', 'Lada', 'Daewoo',
];

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
      <CustomCursor />
      <ScrollProgress />

      <div className="aurora-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>
      <div className="noise" />

      <Header />

      <main id="top" className="container-main relative z-10">
        <Hero onSearch={setHeroQuery} />
        <Marquee items={BRANDS} />
        <CategoriesSection onSelect={(cat) => { setHeroQuery(cat); }} />
        <StatsSection
          stats={stats}
          cityStats={cityStats}
          categoryStats={categoryStats}
          priceBuckets={priceBuckets}
        />
        <ListingsSection heroQuery={heroQuery} />
        <GlobeSection cities={cityStats} />
        <MapSection cities={cityStats} />
        <SellersSection />
        <ServiceCentersSection />
        <TrustSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
