import { useEffect, useState } from 'react';

export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setOffset(window.scrollY * speed);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);

  return offset;
}
