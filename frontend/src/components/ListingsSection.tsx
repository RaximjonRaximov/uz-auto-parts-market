import { useEffect, useState, useCallback } from 'react';
import { ChevronDown, RefreshCw, Wrench } from 'lucide-react';
import { FilterPanel } from './FilterPanel';
import { PartCard } from './PartCard';
import { api } from '../lib/api';
import { useInView } from '../hooks/useInView';
import type { Part, Filters } from '../types';

const initialFilters: Filters = {
  q: '',
  brand: '',
  model: '',
  category: '',
  condition: '',
  min_year: '',
  max_year: '',
  min_price: '',
  max_price: '',
  region: '',
  city: '',
};

export function ListingsSection({ heroQuery }: { heroQuery?: string }) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [ref, visible] = useInView<HTMLDivElement>();

  useEffect(() => {
    api.get('/brands').then((r) => setBrands(r.data.map((b: any) => b.name)));
    api.get('/categories').then((r) => setCategories(r.data.map((c: any) => c.name)));
    api.get('/regions').then((r) => setRegions(r.data.map((x: any) => x.name)));
  }, []);

  useEffect(() => {
    if (heroQuery !== undefined) {
      setFilters((prev) => ({ ...prev, q: heroQuery }));
    }
  }, [heroQuery]);

  const fetchParts = useCallback(async (p = 0, append = false) => {
    setLoading(true);
    const params: any = { skip: p * 24, limit: 24 };
    if (filters.q) params.q = filters.q;
    if (filters.brand) params.brand = filters.brand;
    if (filters.model) params.model = filters.model;
    if (filters.category) params.category = filters.category;
    if (filters.condition) params.condition = filters.condition;
    if (filters.min_year) params.min_year = filters.min_year;
    if (filters.max_year) params.max_year = filters.max_year;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    if (filters.region) params.region = filters.region;
    if (filters.city) params.city = filters.city;

    try {
      const { data } = await api.get('/parts', { params });
      setParts((prev) => (append ? [...prev, ...data] : data));
      setHasMore(data.length === 24);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setPage(0);
    fetchParts(0, false);
  }, [fetchParts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchParts(next, true);
  };

  return (
    <section id="listings" ref={ref} className={`section space-y-8 ${visible ? '' : 'reveal'} ${visible ? 'visible' : ''}`}>
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)]">
          <span className="text-gradient">Top</span> e'lonlar
        </h2>
        <p className="text-[var(--foreground)]/70 text-lg">
          Sizga mos zapchastlarni filtrlardan foydalanib toping.
        </p>
      </div>

      <FilterPanel
        filters={filters}
        onChange={setFilters}
        brands={brands}
        categories={categories}
        regions={regions}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-[var(--foreground)]">
          Natijalar <span className="text-[var(--primary)]">({parts.length})</span>
        </h3>
        {loading && <RefreshCw size={22} className="text-[var(--primary)] animate-spin" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger">
        {parts.map((item) => (
          <PartCard key={item.id} item={item} />
        ))}
      </div>

      {!loading && parts.length === 0 && (
        <div className="text-center py-20 text-[var(--foreground)]/60">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--muted)] flex items-center justify-center">
            <Wrench size={40} className="text-[var(--foreground)]/30" />
          </div>
          <p className="text-xl font-black text-[var(--foreground)]">Hech narsa topilmadi</p>
          <p className="font-semibold">Filtrlarni o'zgartirib qayta urinib ko'ring.</p>
        </div>
      )}

      {hasMore && parts.length > 0 && (
        <div className="flex justify-center pt-8">
          <button onClick={loadMore} disabled={loading} className="btn-primary">
            {loading ? 'Yuklanmoqda...' : "Yana ko'rsatish"} <ChevronDown size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
