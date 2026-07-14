import { useEffect, useState, useCallback } from 'react';
import { ChevronDown, RefreshCw, Wrench } from 'lucide-react';
import { FilterPanel } from './FilterPanel';
import { PartCard } from './PartCard';
import { api } from '../lib/api';
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

export function ListingsSection() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  useEffect(() => {
    api.get('/brands').then((r) => setBrands(r.data.map((b: any) => b.name)));
    api.get('/categories').then((r) => setCategories(r.data.map((c: any) => c.name)));
    api.get('/regions').then((r) => setRegions(r.data.map((x: any) => x.name)));
  }, []);

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
    <section id="listings" className="space-y-6">
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        brands={brands}
        categories={categories}
        regions={regions}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800">
          E'lonlar <span className="text-gradient">({parts.length})</span>
        </h2>
        {loading && <RefreshCw size={20} className="text-violet-500 animate-spin" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {parts.map((item) => (
          <PartCard key={item.id} item={item} />
        ))}
      </div>

      {!loading && parts.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Wrench size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold">Hech narsa topilmadi</p>
          <p>Filtrlarni o'zgartirib qayta urinib ko'ring.</p>
        </div>
      )}

      {hasMore && parts.length > 0 && (
        <div className="flex justify-center pt-6">
          <button onClick={loadMore} disabled={loading} className="neo-btn">
            {loading ? 'Yuklanmoqda...' : "Yana ko'rsatish"} <ChevronDown size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
