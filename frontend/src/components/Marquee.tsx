import { useEffect, useState } from 'react';

export function Marquee({ items }: { items: string[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const doubled = [...items, ...items];

  return (
    <div className="marquee py-6 bg-white/50 border-y border-[var(--border)] backdrop-blur-sm">
      <div className="marquee-content">
        {doubled.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="shrink-0 px-6 py-2 rounded-full bg-[var(--muted)] text-[var(--foreground)]/80 text-sm font-extrabold whitespace-nowrap hover:bg-[var(--primary-50)] hover:text-[var(--primary)] transition-colors cursor-pointer"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
