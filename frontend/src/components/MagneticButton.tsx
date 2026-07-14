import { useRef, type ReactNode } from 'react';

export function MagneticButton({
  children,
  className = '',
  as = 'button',
  ...props
}: {
  children: ReactNode;
  className?: string;
  as?: 'button' | 'a';
  [key: string]: any;
}) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate(0, 0)';
  };

  const Comp = as;

  return (
    <Comp
      ref={ref as any}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`magnetic transition-transform duration-200 ease-out ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}
