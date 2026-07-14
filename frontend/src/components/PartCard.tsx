import { Wrench, MapPin, Phone, Calendar, ArrowUpRight } from 'lucide-react';
import { formatPriceUZS, conditionLabel } from '../lib/utils';
import type { Part } from '../types';

export function PartCard({ item }: { item: Part }) {
  const conditionClass =
    item.condition === 'new'
      ? 'pill-new'
      : item.condition === 'remanufactured'
      ? 'pill-remanufactured'
      : 'pill-used';

  return (
    <article className="card overflow-hidden flex flex-col group cursor-pointer">
      <div className="h-48 bg-[var(--muted)] relative overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--foreground)]/20">
            <Wrench size={48} />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`pill ${conditionClass}`}>{conditionLabel(item.condition)}</span>
        </div>
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight size={18} />
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h4 className="font-bold text-[var(--foreground)] line-clamp-2 leading-snug group-hover:text-[var(--primary)] transition-colors">
          {item.title}
        </h4>
        <div className="text-2xl font-black text-[var(--accent)]">{formatPriceUZS(item.price_uzs)}</div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)]/60">
          <MapPin size={15} />
          <span className="truncate">{[item.region, item.city].filter(Boolean).join(', ') || "Aniqlanmagan"}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-extrabold">{item.brand}</span>
          <span className="px-2.5 py-1 rounded-lg bg-[var(--muted)] text-[var(--foreground)]/80 text-xs font-extrabold">{item.model}</span>
          {item.year && (
            <span className="px-2.5 py-1 rounded-lg bg-[var(--muted)] text-[var(--foreground)]/80 text-xs font-extrabold flex items-center gap-1">
              <Calendar size={12} /> {item.year}
            </span>
          )}
        </div>
        {item.seller_phone ? (
          <a
            href={`tel:${item.seller_phone.replace(/\s/g, '')}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-auto pt-3 flex items-center gap-2 text-sm font-extrabold text-[var(--primary)] hover:text-[var(--primary-600)] transition-colors"
          >
            <Phone size={15} /> {item.seller_phone}
          </a>
        ) : (
          <div className="mt-auto pt-3 text-sm font-bold text-[var(--foreground)]/40">Telefon ko'rsatilmagan</div>
        )}
      </div>
    </article>
  );
}
