import { useScrollProgress } from '../hooks/useScrollProgress';

export function ScrollProgress() {
  const progress = useScrollProgress();

  return (
    <div
      className="scroll-progress"
      style={{ transform: `scaleX(${progress})` }}
      aria-hidden="true"
    />
  );
}
