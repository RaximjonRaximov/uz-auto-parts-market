import { useRef } from 'react';
import { useTilt } from '../hooks/useTilt';
import { useSpotlight } from '../hooks/useSpotlight';
import { formatPriceShort } from '../lib/utils';
import type { CityStat } from '../types';

export function RegionCards({ cities }: { cities: CityStat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cities.map((c) => {
        const cardRef = useRef<HTMLDivElement>(null);
        const tilt = useTilt(cardRef);
        const spot = useSpotlight(cardRef);
        return (
          <div
            key={c.city}
            ref={cardRef}
            className="glass tilt-card spotlight rounded-2xl p-4 flex flex-col gap-2"
            {...tilt}
            {...spot}
          >
            <div className="flex justify-between items-start">
              <div className="font-bold text-slate-800 truncate">{c.city}</div>
              <div className="pill pill-sale">{c.count}</div>
            </div>
            <div className="text-sm text-slate-500">O'rtacha narx</div>
            <div className="text-lg font-bold text-gradient-2">{formatPriceShort(c.avg_price_uzs)}</div>
          </div>
        );
      })}
    </div>
  );
}
