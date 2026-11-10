import { SHOW_DURATION_MS } from '../lib/fireworkShow.mjs';

export default function FireworkProgress({ remaining, elapsed }: { remaining: number; elapsed?: number }) {
  const fraction = elapsed === undefined ? remaining*1000/SHOW_DURATION_MS : 1-elapsed/SHOW_DURATION_MS;
  const offset = 100-Math.max(0,Math.min(1,fraction))*100;
  return <svg className="firework-dock__progress" aria-hidden="true" focusable="false">
    <rect className="firework-dock__progress-line" x="2" y="2" pathLength="100" strokeDasharray="100" strokeDashoffset={offset} opacity={offset === 100 ? 0 : 1} />
  </svg>;
}
