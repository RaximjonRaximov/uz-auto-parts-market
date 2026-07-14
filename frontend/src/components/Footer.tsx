import { Wrench, Github, Shield, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white/60 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white">
                <Wrench size={20} />
              </div>
              <div>
                <div className="text-lg font-extrabold text-[var(--foreground)] leading-none">UZ Auto Parts</div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--primary)]">Marketplace</div>
              </div>
            </div>
            <p className="text-[var(--foreground)]/70 font-semibold max-w-sm">
              O'zbekistonda avto ehtiyot qismlarini qidirish, solishtirish va sotish uchun eng zamonaviy platforma.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-[var(--foreground)]">Platforma</h4>
            <ul className="space-y-2 text-sm font-semibold text-[var(--foreground)]/70">
              <li><a href="#top" className="hover:text-[var(--primary)]">Bosh sahifa</a></li>
              <li><a href="#categories" className="hover:text-[var(--primary)]">Kategoriyalar</a></li>
              <li><a href="#listings" className="hover:text-[var(--primary)]">E'lonlar</a></li>
              <li><a href="#stats" className="hover:text-[var(--primary)]">Statistika</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-[var(--foreground)]">Xavfsizlik</h4>
            <ul className="space-y-2 text-sm font-semibold text-[var(--foreground)]/70">
              <li className="flex items-center gap-2"><Lock size={14} /> Xavfsiy ma'lumotlar</li>
              <li className="flex items-center gap-2"><Shield size={14} /> Tekshirilgan sotuvchilar</li>
              <li className="flex items-center gap-2"><Github size={14} /> Ochiq kod</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-[var(--foreground)]/60">
          <div>© {new Date().getFullYear()} UZ Auto Parts — O'zbekiston avto zapchastlari bozori</div>
          <div className="flex items-center gap-6">
            <span>Demo ma'lumotlar bilan</span>
            <span>AI ishlatilmagan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
