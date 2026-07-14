import { Suspense, lazy, useMemo } from 'react';
import { GlobeIcon } from 'lucide-react';
import { useSize } from '../hooks/useSize';
import { resolveCityCoords } from '../lib/utils';
import type { CityStat } from '../types';

const Globe = lazy(() => import('react-globe.gl'));

export function GlobeSection({ locations }: { locations: CityStat[] }) {
  const [containerRef, size] = useSize<HTMLDivElement>();

  const points = useMemo(
    () =>
      locations
        .filter((l) => l.city && l.count > 0)
        .map((l) => {
          const [lat, lon] = resolveCityCoords(l.region, l.city);
          return { lat, lon, name: l.city, count: l.count };
        }),
    [locations]
  );

  return (
    <div ref={containerRef} className="relative w-full h-[420px] lg:h-[520px] rounded-2xl overflow-hidden">
      <div className="absolute top-4 left-4 z-10 glass px-4 py-2 rounded-full text-sm font-bold text-slate-700 flex items-center gap-2">
        <GlobeIcon size={16} className="text-cyan-500" />
        O'zbekiston 3D xaritasi
      </div>
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-slate-500">Globus yuklanmoqda...</div>}>
        <Globe
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-day.jpg"
          pointsData={points}
          pointLat="lat"
          pointLng="lon"
          pointLabel={(d: any) => `${d.name}: ${d.count} ta`}
          pointColor={() => '#22d3ee'}
          pointRadius={(d: any) => Math.max(0.4, Math.min(1.5, d.count / 8))}
          pointAltitude={0.08}
          atmosphereColor="#22d3ee"
          atmosphereAltitude={0.15}
        />
      </Suspense>
    </div>
  );
}
