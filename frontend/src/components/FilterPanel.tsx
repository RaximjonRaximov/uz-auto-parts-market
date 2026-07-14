import { Search, Filter, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { Filters } from '../types';

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

export function FilterPanel({
  filters,
  onChange,
  brands,
  categories,
  regions,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  brands: string[];
  categories: string[];
  regions: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const update = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="card p-5 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-2 text-[var(--foreground)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
            <Filter size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Filtrlash</h3>
            <p className="text-xs font-bold text-[var(--foreground)]/50">Brend, model, narx va hudud bo'yicha</p>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]" size={18} />
            <input
              className="form-input pl-10"
              placeholder="Qidiruv..."
              value={filters.q}
              onChange={(e) => update('q', e.target.value)}
              aria-label="Qidiruv"
            />
          </div>
          <button
            type="button"
            className="btn-secondary py-2.5 px-4 lg:hidden"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${expanded ? '' : 'hidden lg:grid'} grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5`}>
        <select className="form-input form-select" value={filters.brand} onChange={(e) => update('brand', e.target.value)}>
          <option value="">Barcha brendlar</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <input
          className="form-input"
          placeholder="Model"
          value={filters.model}
          onChange={(e) => update('model', e.target.value)}
        />
        <select className="form-input form-select" value={filters.category} onChange={(e) => update('category', e.target.value)}>
          <option value="">Barcha kategoriyalar</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="form-input form-select" value={filters.condition} onChange={(e) => update('condition', e.target.value)}>
          <option value="">Barcha holatlar</option>
          <option value="new">Yangi</option>
          <option value="used">Ishlatilgan</option>
          <option value="remanufactured">Tiklangan</option>
        </select>
        <select className="form-input form-select" value={filters.region} onChange={(e) => update('region', e.target.value)}>
          <option value="">Barcha hududlar</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <input
          className="form-input"
          placeholder="Shahar"
          value={filters.city}
          onChange={(e) => update('city', e.target.value)}
        />
        <input
          className="form-input"
          placeholder="Min yil"
          type="number"
          value={filters.min_year}
          onChange={(e) => update('min_year', e.target.value)}
        />
        <input
          className="form-input"
          placeholder="Max yil"
          type="number"
          value={filters.max_year}
          onChange={(e) => update('max_year', e.target.value)}
        />
        <input
          className="form-input"
          placeholder="Min narx (so'm)"
          type="number"
          value={filters.min_price}
          onChange={(e) => update('min_price', e.target.value)}
        />
        <input
          className="form-input"
          placeholder="Max narx (so'm)"
          type="number"
          value={filters.max_price}
          onChange={(e) => update('max_price', e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button className="btn-primary" onClick={() => onChange({ ...filters })}>
          <Search size={18} /> Qidirish
        </button>
        <button className="btn-secondary" onClick={() => onChange(initialFilters)}>
          <RefreshCw size={16} /> Tozalash
        </button>
      </div>
    </div>
  );
}
