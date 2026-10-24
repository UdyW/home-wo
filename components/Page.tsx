"use client";
import type { ReactNode } from "react";
import { useStore, WhenLoaded } from "@/lib/store";
import { DayBar } from "./DayBar";
import { LegacyPrompt } from "./LegacyPrompt";

function Content({ dayBar, children }: { dayBar: boolean; children: ReactNode }) {
  const { legacy } = useStore();
  // Ask once about data from before accounts, before anything else.
  if (legacy && !legacy.choice) return <main><LegacyPrompt /></main>;
  return (
    <>
      {dayBar && <DayBar />}
      <main>{children}</main>
    </>
  );
}

/** Page frame: optional day bar, then the page content once data has loaded. */
export function Page({ dayBar = false, children }: { dayBar?: boolean; children: ReactNode }) {
  return (
    <WhenLoaded>
      <Content dayBar={dayBar}>{children}</Content>
    </WhenLoaded>
  );
}
