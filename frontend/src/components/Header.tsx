import { useState, useEffect } from 'react';
import { Wrench, Plus, Menu, X, Github, User, LogOut } from 'lucide-react';
import { MagneticButton } from './MagneticButton';
import { AuthModal } from './AuthModal';
import { useAuth } from '../context/AuthContext';

export function Header({
  onAddListing,
  authOpen,
  setAuthOpen,
}: {
  onAddListing?: () => void;
  authOpen?: boolean;
  setAuthOpen?: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [localAuthOpen, setLocalAuthOpen] = useState(false);
  const { user, logout } = useAuth();
  const isAuthOpen = authOpen ?? localAuthOpen;
  const setIsAuthOpen = setAuthOpen ?? setLocalAuthOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nav = [
    { label: "Bosh sahifa", href: "#top" },
    { label: "Kategoriyalar", href: "#categories" },
    { label: "E'lonlar", href: "#listings" },
    { label: "Statistika", href: "#stats" },
    { label: "Xarita", href: "#map" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-lg border-b border-[var(--border)]' : 'bg-transparent'
        }`}
      >
        <div className="container-main">
          <div className="flex h-18 items-center justify-between py-4">
            <a href="#top" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Wrench size={20} />
              </div>
              <div>
                <div className="text-lg font-black leading-none text-[var(--foreground)] tracking-tight">UZ Auto Parts</div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--primary)]">Marketplace</div>
              </div>
            </a>

            <nav className="hidden md:flex items-center gap-8">
              {nav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-bold text-[var(--foreground)]/70 hover:text-[var(--primary)] link-underline transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://github.com/RaximjonRaximov/uz-auto-parts-market"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-2.5 px-4 cursor-hover"
              >
                <Github size={18} />
              </a>

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--muted)] text-sm font-bold text-[var(--foreground)]">
                    <User size={16} className="text-[var(--primary)]" />
                    <span className="max-w-[120px] truncate">{user.full_name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="btn-secondary py-2.5 px-3"
                    aria-label="Chiqish"
                  >
                    <LogOut size={18} />
                  </button>
                  <MagneticButton className="btn-primary py-2.5 px-5 shine cursor-hover" onClick={onAddListing}>
                    <Plus size={18} /> E'lon qo'shish
                  </MagneticButton>
                </div>
              ) : (
                <>
                  <button onClick={() => setIsAuthOpen(true)} className="btn-secondary py-2.5 px-4">
                    Kirish
                  </button>
                  <MagneticButton className="btn-primary py-2.5 px-5 shine cursor-hover" onClick={() => setIsAuthOpen(true)}>
                    <Plus size={18} /> E'lon qo'shish
                  </MagneticButton>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-xl bg-[var(--muted)] text-[var(--foreground)]"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Yopish" : "Menyu"}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden glass border-t border-[var(--border)] absolute inset-x-0 top-full">
            <div className="container-main py-4 space-y-3">
              {nav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-base font-bold text-[var(--foreground)]/80 hover:text-[var(--primary)] py-2"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3 flex flex-col gap-3">
                <a
                  href="https://github.com/RaximjonRaximov/uz-auto-parts-market"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 py-2.5"
                >
                  <Github size={18} /> GitHub
                </a>
                {!user ? (
                  <button className="btn-primary flex-1 py-2.5" onClick={() => { setOpen(false); setIsAuthOpen(true); }}>
                    Kirish / Ro'yxatdan o'tish
                  </button>
                ) : (
                  <div className="flex items-center justify-between text-sm font-bold text-[var(--foreground)]">
                    <span>{user.full_name}</span>
                    <button onClick={logout} className="text-[var(--primary)]">Chiqish</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
