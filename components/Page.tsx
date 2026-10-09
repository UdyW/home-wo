"use client";
import type { ReactNode } from "react";
import { WhenLoaded } from "@/lib/store";
import { DayBar } from "./DayBar";

/** Page frame: optional day bar, then the page content once data has loaded. */
export function Page({ dayBar = false, children }: { dayBar?: boolean; children: ReactNode }) {
  return (
    <WhenLoaded>
      {dayBar && <DayBar />}
      <main>{children}</main>
    </WhenLoaded>
  );
}
