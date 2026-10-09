import type { WarmupItem } from "@/lib/types";

export function WarmupList({ items }: { items: WarmupItem[] }) {
  return (
    <ul className="warm">
      {items.map((r, i) => (
        <li key={i}>
          <b>{r[0]} ({r[1]})</b>
          <span>{r[2] || ""}</span>
        </li>
      ))}
    </ul>
  );
}
