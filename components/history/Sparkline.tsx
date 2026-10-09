/** Small trend line of the last values, with a dot on the latest one. */
export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <svg aria-hidden="true" />;
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * 114 + 3, 29 - ((v - min) / range) * 26]);
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 120 32" aria-hidden="true">
      <polyline points={pts.map((p) => p.join(",")).join(" ")} />
      <circle cx={lx} cy={ly} r="3" />
    </svg>
  );
}
