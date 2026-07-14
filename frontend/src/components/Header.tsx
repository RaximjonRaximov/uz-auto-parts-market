import { Wrench, Plus, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Bosh sahifa", href: "#top" },
    { label: "Kategoriyalar", href: "#categories" },
    { label: "E'lonlar", href: "#listings" },
    { label: "Xarita", href: "#map" },
    { label: "Statistika", href: "#stats" },
  ];

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-[var(--border)] rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Wrench size={20} />
          </div>
          <div>
            <div className="text-lg font-extrabold text-[var(--foreground)] leading-none tracking-tight">UZ Auto Parts</div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--primary)]">Marketplace</div>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-[var(--foreground)]/80">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-[var(--primary)] transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://github.com/RaximjonRaximov/uz-auto-parts-market"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm py-2.5 px-5"
          >
            GitHub
          </a>
          <button className="btn-accent text-sm py-2.5 px-5">
            <Plus size={18} /> E'lon qo'shish
          </button>
        </div>

        <button
          className="lg:hidden p-2 rounded-xl border border-[var(--border)] bg-white/60"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Yopish" : "Menyu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[var(--border)] px-4 py-4 space-y-3 bg-white/80 backdrop-blur-xl">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block font-bold text-[var(--foreground)] hover:text-[var(--primary)]"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <button className="btn-accent w-full justify-center text-sm mt-2">
            <Plus size={18} /> E'lon qo'shish
          </button>
        </div>
      )}
    </header>
  );
}
