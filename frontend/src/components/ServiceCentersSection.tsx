import { useEffect, useState } from 'react';
import { MapPin, Phone, Star, Wrench, Clock } from 'lucide-react';
import { api } from '../lib/api';
import type { ServiceCenter } from '../types';

export function ServiceCentersSection() {
  const [centers, setCenters] = useState<ServiceCenter[]>([]);

  useEffect(() => {
    api.get('/service-centers?limit=12').then((r) => setCenters(r.data));
  }, []);

  if (centers.length === 0) return null;

  return (
    <section className="section">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-50)] border border-[var(--primary)]/10 px-4 py-1.5 text-sm font-extrabold text-[var(--primary)]">
          <Wrench size={16} /> Avto xizmatlar
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)]">
          <span className="text-gradient">Avtoservis</span> va ustaxonalar
        </h2>
        <p className="text-lg text-[var(--foreground)]/70 font-medium">
          O'zbekiston bo'ylab diagnostika, ta'mir, kuzov, elektr va boshqa avto xizmatlari.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {centers.map((c) => (
          <div
            key={c.id}
            className="card p-5 flex flex-col gap-3 group spotlight"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-[var(--foreground)] leading-tight group-hover:text-[var(--primary)] transition-colors">
                  {c.name}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-sm text-[var(--muted-foreground)]">
                  <MapPin size={14} className="text-[var(--accent)]" />
                  <span className="truncate">{[c.city, c.region].filter(Boolean).join(', ')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                <Star size={12} fill="currentColor" />
                {c.rating.toFixed(1)}
              </div>
            </div>

            {c.services ? (
              <div className="flex flex-wrap gap-1.5">
                {c.services.split(',').slice(0, 4).map((svc, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-full bg-[var(--primary-50)] text-[var(--primary)] text-[10px] font-extrabold"
                  >
                    {svc.trim()}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between text-sm">
              {c.work_hours ? (
                <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                  <Clock size={14} />
                  <span className="truncate">{c.work_hours}</span>
                </div>
              ) : (
                <span />
              )}
              {c.phone ? (
                <a
                  href={`tel:${c.phone}`}
                  className="inline-flex items-center gap-1.5 font-bold text-[var(--primary)] hover:text-[var(--primary-600)]"
                >
                  <Phone size={14} />
                  {c.phone}
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
