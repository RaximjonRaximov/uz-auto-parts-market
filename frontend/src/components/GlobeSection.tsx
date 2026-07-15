import { useEffect, useRef, useMemo } from 'react';
import { GlobeIcon, TrendingUp } from 'lucide-react';
import { useSize } from '../hooks/useSize';
import { resolveCityCoords } from '../lib/utils';
import type { CityStat } from '../types';

const TASHKENT = { lat: 41.2995, lng: 69.2401 };

export function GlobeSection({ cities }: { cities: CityStat[] }) {
  const [containerRef, size] = useSize<HTMLDivElement>();
  const globeRef = useRef<any>(null);

  const points = useMemo(
    () =>
      cities
        .filter((l) => l.city && l.count > 0)
        .map((l) => {
          const [lat, lon] = resolveCityCoords(l.region, l.city);
          return { lat, lng: lon, name: l.city, count: l.count };
        }),
    [cities]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;

    const init = async () => {
      try {
        const mod: any = await import('globe.gl');
        if (!mounted || !containerRef.current) return;

        const GlobeClass = mod.default as { new (el: HTMLElement): any };
        const g = new GlobeClass(containerRef.current)
          .width(size.width || 600)
          .height(size.height || 400)
          .backgroundColor('rgba(0,0,0,0)')
          .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-day.jpg')
          .showAtmosphere(true)
          .atmosphereColor('#4f46e5')
          .atmosphereAltitude(0.15)
          .pointLat('lat')
          .pointLng('lng')
          .pointLabel((d: any) => `${d.name}: ${d.count} ta e'lon`)
          .pointColor(() => '#f97316')
          .pointRadius((d: any) => Math.max(0.4, Math.min(1.4, d.count / 10)))
          .pointAltitude(0.04)
          .labelLat('lat')
          .labelLng('lng')
          .labelText('name')
          .labelColor(() => '#0f172a')
          .labelSize(0.6)
          .labelDotRadius(0.25)
          .labelAltitude(0.06);

        globeRef.current = g;
        g.pointsData(points);
        g.labelsData(points);

        if (points.length > 0) {
          const arcs = points.slice(0, 20).map((p) => ({
            startLat: TASHKENT.lat,
            startLng: TASHKENT.lng,
            endLat: p.lat,
            endLng: p.lng,
            color: ['#4f46e5', '#f97316'],
          }));
          g.arcsData(arcs)
            .arcStartLat('startLat')
            .arcStartLng('startLng')
            .arcEndLat('endLat')
            .arcEndLng('endLng')
            .arcColor('color')
            .arcAltitude(0.2)
            .arcStroke(0.5)
            .arcDashLength(0.4)
            .arcDashGap(0.2)
            .arcDashInitialGap(0.1)
            .arcDashAnimateTime(2000);
        }
      } catch (err) {
        console.error('Globe init failed', err);
      }
    };

    init();

    return () => {
      mounted = false;
      if (globeRef.current?._destructor) {
        globeRef.current._destructor();
      }
    };
  }, [containerRef, size.width, size.height, points]);

  return (
    <section className="section">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-50)] border border-[var(--primary)]/10 px-4 py-1.5 text-sm font-extrabold text-[var(--primary)]">
          <GlobeIcon size={16} /> 3D ko'rinish
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)]">
          <span className="text-gradient">3D globus</span> bo'ylab qidiring
        </h2>
        <p className="text-lg text-[var(--foreground)]/70 font-medium">
          Toshkentdan boshqa shaharlar bo'yicha zapchast oqimini interaktiv ravishda kuzating.
        </p>
      </div>

      <div className="card p-2 relative w-full h-[520px] lg:h-[640px] overflow-hidden bg-gradient-to-br from-[var(--background)] to-[var(--muted)]">
        <div className="absolute top-5 left-5 z-10 glass px-4 py-2 rounded-full text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
          <TrendingUp size={16} className="text-[var(--accent)]" />
          {cities.length} ta shahar
        </div>
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </section>
  );
}
