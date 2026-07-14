import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { formatPriceUZS, resolveCityCoords } from '../lib/utils';
import type { CityStat } from '../types';

export function MapSection({ cities }: { cities: CityStat[] }) {
  const center: LatLngExpression = [41.2995, 69.2401];

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4 text-slate-700">
        <MapPin size={20} className="text-cyan-500" />
        <h3 className="font-bold text-slate-800 text-xl">Interaktiv xarita</h3>
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
                  fillColor="#06b6d4"
                  color="#fff"
                  weight={2}
                  fillOpacity={0.85}
                >
                  <Popup>
                    <div className="font-bold text-slate-800 text-sm max-w-[200px]">{c.city}</div>
                    <div className="text-violet-600 font-bold">{c.count} ta e'lon</div>
                    <div className="text-xs text-slate-500">O'rtacha: {formatPriceUZS(c.avg_price_uzs)}</div>
                  </Popup>
                </CircleMarker>
              );
            })}
        </MapContainer>
      </div>
    </div>
  );
}
