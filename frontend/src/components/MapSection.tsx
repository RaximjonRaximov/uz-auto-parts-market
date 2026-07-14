import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { formatPriceUZS, resolveCityCoords } from '../lib/utils';
import type { CityStat } from '../types';

export function MapSection({ cities }: { cities: CityStat[] }) {
  const center: LatLngExpression = [41.2995, 69.2401];
  const [ref, visible] = useInView<HTMLDivElement>();

  return (
    <section id="map" ref={ref} className={`section space-y-6 ${visible ? '' : 'reveal'} ${visible ? 'visible' : ''}`}>
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)]">
          <span className="text-gradient">Xaritada</span> ko'ring
        </h2>
        <p className="text-[var(--foreground)]/70 text-lg">
          Shaharlar bo'yicha e'lonlar soni va o'rtacha narxlar.
        </p>
      </div>

      <div className="card p-5 overflow-hidden">
        <div className="flex items-center gap-2 mb-4 text-[var(--foreground)]">
          <MapPin size={22} className="text-[var(--accent)]" />
          <h3 className="font-bold text-lg">Interaktiv xarita</h3>
        </div>
        <div className="rounded-2xl overflow-hidden h-[420px] lg:h-[520px]">
          <MapContainer center={center} zoom={6} scrollWheelZoom className="w-full h-full">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {cities
              .filter((c) => c.city)
              .map((c) => {
                const [lat, lon] = resolveCityCoords(c.region, c.city);
                return (
                  <CircleMarker
                    key={c.city}
                    center={[lat, lon] as LatLngExpression}
                    radius={Math.max(6, Math.min(18, c.count / 3))}
                    fillColor="#7C3AED"
                    color="#fff"
                    weight={2}
                    fillOpacity={0.85}
                  >
                    <Popup>
                      <div className="font-bold text-[var(--foreground)] text-sm max-w-[200px]">{c.city}</div>
                      <div className="text-[var(--accent)] font-bold">{c.count} ta e'lon</div>
                      <div className="text-xs text-[var(--foreground)]/60">O'rtacha: {formatPriceUZS(c.avg_price_uzs)}</div>
                    </Popup>
                  </CircleMarker>
                );
              })}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}
