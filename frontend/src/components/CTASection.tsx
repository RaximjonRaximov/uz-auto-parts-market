import { Plus, ArrowRight, Sparkles } from 'lucide-react';
import { useInView } from '../hooks/useInView';

export function CTASection() {
  const [ref, visible] = useInView<HTMLDivElement>();

  return (
    <section ref={ref} className={`section ${visible ? '' : 'reveal'} ${visible ? 'visible' : ''}`}>
      <div className="card card-gradient relative overflow-hidden p-10 md:p-16 text-center">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-sm font-extrabold text-white">
            <Sparkles size={16} /> Bepul va tez
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            Siz ham <span className="text-yellow-300">sotuvchi</span> bo'ling
          </h2>
          <p className="text-lg text-white/85 font-medium max-w-xl mx-auto">
            Ehtiyot qismlaringizni tez va bepul joylang. Mijozlar butun O'zbekiston bo'ylab sizni topadi.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button className="btn bg-white text-[var(--primary)] shine hover:bg-white/95">
              <Plus size={20} /> Bepul e'lon qo'shish
            </button>
            <a
              href="https://github.com/RaximjonRaximov/uz-auto-parts-market"
              target="_blank"
              rel="noopener noreferrer"
              className="btn border border-white/30 text-white hover:bg-white/10"
            >
              GitHub'da ko'rish <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
