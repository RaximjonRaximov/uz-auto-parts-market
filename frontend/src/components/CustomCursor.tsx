import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [click, setClick] = useState(false);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, input, select, textarea, [role="button"], .magnetic, .cursor-hover')) {
        setHover(true);
      }
    };

    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, input, select, textarea, [role="button"], .magnetic, .cursor-hover')) {
        setHover(false);
      }
    };

    const onDown = () => setClick(true);
    const onUp = () => setClick(false);

    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%) scale(${click ? 0.8 : hover ? 1.5 : 1})`;
      }
      raf.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout', onOut, { passive: true });
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    raf.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [hover, click]);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none hidden lg:flex items-center justify-center w-5 h-5 rounded-full border border-[var(--primary)] bg-[var(--primary)]/20 mix-blend-difference transition-[width,height] duration-150 will-change-transform"
      style={{ transform: 'translate(-50%, -50%)', width: hover ? 48 : 20, height: hover ? 48 : 20 }}
    />
  );
}
