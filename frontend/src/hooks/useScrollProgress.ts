import { useEffect, useState } from 'react';

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      const value = height > 0 ? scrollTop / height : 0;
      setProgress(Math.min(1, Math.max(0, value)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return progress;
}
