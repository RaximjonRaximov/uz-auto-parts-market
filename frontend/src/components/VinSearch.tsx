import { useState } from 'react';
import { Search, Car, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export function VinSearch({ onFound }: { onFound: (brand: string, model: string, year: string) => void }) {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ brand?: string; model?: string; year?: number } | null>(null);

  const decode = async () => {
    setError('');
    setResult(null);
    if (!vin.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/vin/${vin.trim().toUpperCase()}`);
      setResult(data);
      if (data.brand) {
        onFound(data.brand, data.model || '', data.year ? String(data.year) : '');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'VIN dekod qilishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3 text-[var(--foreground)]">
        <div className="w-12 h-12 rounded-2xl bg-[var(--primary-50)] flex items-center justify-center text-[var(--primary)]">
          <Car size={22} />
        </div>
        <div>
          <h3 className="font-bold text-lg">VIN orqali toping</h3>
          <p className="text-xs font-bold text-[var(--foreground)]/50">17 belgili VIN raqamini kiriting</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="form-input uppercase tracking-widest flex-1"
          placeholder="MASBU17JH3F..."
          maxLength={17}
          value={vin}
          onChange={(e) => setVin(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && decode()}
        />
        <button
          className="btn-primary whitespace-nowrap"
          onClick={decode}
          disabled={loading || vin.length !== 17}
        >
          {loading ? 'Dekod...' : <><Search size={18} /> Dekod</>}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 p-3 rounded-xl">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {result && result.brand && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold">
          <Car size={16} />
          <span>{result.brand}</span>
          {result.model && <span>— {result.model}</span>}
          {result.year && <span>({result.year})</span>}
          <span className="ml-auto text-emerald-600">Filtrlarga qo'llandi</span>
        </div>
      )}
    </div>
  );
}
