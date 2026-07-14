import { useRef } from 'react';
import { Wrench, MapPin, Phone, Calendar } from 'lucide-react';
import { useTilt } from '../hooks/useTilt';
import { useSpotlight } from '../hooks/useSpotlight';
import { formatPriceUZS, conditionLabel } from '../lib/utils';
import type { Part } from '../types';

export function PartCard({ item }: { item: Part }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tilt = useTilt(cardRef);
  const spot = useSpotlight(cardRef);

  const conditionColor =
    item.condition === 'new' ? 'pill-sale' : item.condition === 'remanufactured' ? 'pill-rent' : 'pill-used';

  return (
    <div
      ref={cardRef}
      className="glass tilt-card spotlight rounded-2xl overflow-hidden flex flex-col group relative"
      {...tilt}
      {...spot}
    >
      <div className="h-44 bg-slate-200 relative overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Wrench size={40} />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`pill ${conditionColor}`}>{conditionLabel(item.condition)}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h4 className="font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-violet-600 transition-colors">
          {item.title}
        </h4>
        <div className="text-xl font-extrabold text-gradient">{formatPriceUZS(item.price_uzs)}</div>
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <MapPin size={14} />
          <span className="truncate">{[item.region, item.city].filter(Boolean).join(', ') || "Aniqlanmagan"}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
          <span className="px-2 py-1 rounded-md bg-slate-100">{item.brand}</span>
          <span className="px-2 py-1 rounded-md bg-slate-100">{item.model}</span>
          {item.year && (
            <span className="px-2 py-1 rounded-md bg-slate-100 flex items-center gap-1">
              <Calendar size={12} /> {item.year}
            </span>
          )}
        </div>
        {item.seller_phone && (
          <a href={`tel:${item.seller_phone.replace(/\s/g, '')}`} className="mt-auto pt-2 flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700">
            <Phone size={14} /> {item.seller_phone}
          </a>
        )}
      </div>
    </div>
  );
}
