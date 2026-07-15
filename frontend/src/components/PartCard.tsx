import { useRef, useState } from 'react';
import { Wrench, MapPin, Phone, Calendar, ArrowUpRight, ShoppingCart, MessageCircle } from 'lucide-react';
import { useSpotlight } from '../hooks/useSpotlight';
import { formatPriceUZS, conditionLabel } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { OrderModal } from './OrderModal';
import { ChatModal } from './ChatModal';
import { PaymentButton } from './PaymentButton';
import type { Part, Order } from '../types';

interface Props {
  item: Part;
  onAuthRequired?: () => void;
}

export function PartCard({ item, onAuthRequired }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const spot = useSpotlight(cardRef);
  const { user } = useAuth();
  const [orderOpen, setOrderOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const conditionClass =
    item.condition === 'new'
      ? 'pill-new'
      : item.condition === 'remanufactured'
      ? 'pill-remanufactured'
      : 'pill-used';

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onAuthRequired?.();
      return;
    }
    setOrderOpen(true);
  };

  return (
    <>
      <article ref={cardRef} {...spot} className="spotlight card overflow-hidden flex flex-col group cursor-pointer">
        <div className="h-48 bg-[var(--muted)] relative overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--foreground)]/20">
              <Wrench size={48} />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={`pill ${conditionClass}`}>{conditionLabel(item.condition)}</span>
          </div>
          <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110">
            <ArrowUpRight size={18} />
          </div>
        </div>
        <div className="p-5 flex flex-col gap-3 flex-1 relative z-10">
          <h4 className="font-bold text-[var(--foreground)] line-clamp-2 leading-snug group-hover:text-[var(--primary)] transition-colors">
            {item.title}
          </h4>
          <div className="text-2xl font-black text-[var(--accent)]">{formatPriceUZS(item.price_uzs)}</div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)]/60">
            <MapPin size={15} />
            <span className="truncate">{[item.region, item.city].filter(Boolean).join(', ') || "Aniqlanmagan"}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[var(--primary-50)] text-[var(--primary)] text-xs font-extrabold">{item.brand}</span>
            <span className="px-2.5 py-1 rounded-lg bg-[var(--muted)] text-[var(--foreground)]/80 text-xs font-extrabold">{item.model}</span>
            {item.year && (
              <span className="px-2.5 py-1 rounded-lg bg-[var(--muted)] text-[var(--foreground)]/80 text-xs font-extrabold flex items-center gap-1">
                <Calendar size={12} /> {item.year}
              </span>
            )}
          </div>

          <div className="mt-auto pt-3 flex flex-col gap-2">
            {item.seller_phone ? (
              <a
                href={`tel:${item.seller_phone.replace(/\s/g, '')}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-sm font-extrabold text-[var(--primary)] hover:text-[var(--primary-600)] transition-colors"
              >
                <Phone size={15} /> {item.seller_phone}
              </a>
            ) : (
              <div className="text-sm font-bold text-[var(--foreground)]/40">Telefon ko'rsatilmagan</div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleOrderClick}
                className="btn-primary flex-1 py-2 text-sm shine flex items-center justify-center gap-1.5"
              >
                <ShoppingCart size={16} /> Buyurtma
              </button>
              {order && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setChatOpen(true); }}
                    className="btn-secondary py-2 px-3"
                    aria-label="Xabarlar"
                  >
                    <MessageCircle size={16} />
                  </button>
                  <div onClick={(e) => e.stopPropagation()}>
                    <PaymentButton order={order} onPaid={(p) => setOrder({ ...order, status: p.status === 'paid' ? 'confirmed' : order.status })} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </article>

      {orderOpen && (
        <OrderModal
          part={item}
          open={orderOpen}
          onClose={() => setOrderOpen(false)}
          onCreated={(o) => { setOrder(o); setOrderOpen(false); }}
        />
      )}
      {order && chatOpen && (
        <ChatModal order={order} open={chatOpen} onClose={() => setChatOpen(false)} />
      )}
    </>
  );
}
