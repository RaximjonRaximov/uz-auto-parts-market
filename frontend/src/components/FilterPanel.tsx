import { Search, Filter, RefreshCw } from 'lucide-react';
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
  const update = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 text-slate-600 mb-1">
        <Filter size={18} />
        <h3 className="font-bold text-slate-800">Filtrlash</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <input
          className="neo-input"
          placeholder="Qidiruv..."
          value={filters.q}
          onChange={(e) => update('q', e.target.value)}
        />
        <select className="neo-input" value={filters.brand} onChange={(e) => update('brand', e.target.value)}>
          <option value="">Barcha brendlar</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <input
          className="neo-input"
          placeholder="Model"
          value={filters.model}
          onChange={(e) => update('model', e.target.value)}
        />
        <select className="neo-input" value={filters.category} onChange={(e) => update('category', e.target.value)}>
          <option value="">Barcha kategoriyalar</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="neo-input" value={filters.condition} onChange={(e) => update('condition', e.target.value)}>
          <option value="">Barcha holatlar</option>
          <option value="new">Yangi</option>
          <option value="used">Ishlatilgan</option>
          <option value="remanufactured">Tiklangan</option>
        </select>
        <select className="neo-input" value={filters.region} onChange={(e) => update('region', e.target.value)}>
          <option value="">Barcha hududlar</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <input
          className="neo-input"
          placeholder="Shahar"
          value={filters.city}
          onChange={(e) => update('city', e.target.value)}
        />
        <input
          className="neo-input"
          placeholder="Min yil"
          type="number"
          value={filters.min_year}
          onChange={(e) => update('min_year', e.target.value)}
        />
        <input
          className="neo-input"
          placeholder="Max yil"
          type="number"
          value={filters.max_year}
          onChange={(e) => update('max_year', e.target.value)}
        />
        <input
          className="neo-input"
          placeholder="Min narx (so'm)"
          type="number"
          value={filters.min_price}
          onChange={(e) => update('min_price', e.target.value)}
        />
        <input
          className="neo-input"
          placeholder="Max narx (so'm)"
          type="number"
          value={filters.max_price}
          onChange={(e) => update('max_price', e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <button className="neo-btn" onClick={() => onChange({ ...filters })}>
          <Search size={18} /> Qidirish
        </button>
        <button className="neo-btn-secondary" onClick={() => onChange(initialFilters)}>
          <RefreshCw size={16} /> Tozalash
        </button>
      </div>
    </div>
  );
}
