import { Plus, ArrowRight } from 'lucide-react';
import { useInView } from '../hooks/useInView';

export function CTASection() {
  const [ref, visible] = useInView<HTMLDivElement>();

  return (
    <section ref={ref} className={`section ${visible ? '' : 'reveal'} ${visible ? 'visible' : ''}`}>
      <div className="card relative overflow-hidden p-8 md:p-14 text-center">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--primary)]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)]">
            Siz ham <span className="text-gradient">sotuvchi</span> bo'ling
          </h2>
          <p className="text-lg text-[var(--foreground)]/70 font-semibold">
            Ehtiyot qismlaringizni tez va bepul joylang. Mijozlar butun O'zbekiston bo'ylab sizni topadi.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="btn-accent">
              <Plus size={20} /> Bepul e'lon qo'shish
            </button>
            <a
              href="https://github.com/RaximjonRaximov/uz-auto-parts-market"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              GitHub'da ko'rish <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
