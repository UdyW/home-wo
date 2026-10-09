"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Add a page here to give it a tab.
const PAGES = [
  { href: "/", label: "Workout" },
  { href: "/history", label: "History" },
  { href: "/plan", label: "Edit plan" },
];

export function Header() {
  const path = usePathname();
  return (
    <header className="top">
      <h1>Pram's home gym log</h1>
      <nav className="views" aria-label="Sections">
        {PAGES.map((p) => (
          <Link key={p.href} href={p.href} aria-current={path === p.href ? "page" : undefined}>
            {p.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
