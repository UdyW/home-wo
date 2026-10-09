"use client";
import { useEffect, type ReactNode } from "react";
import { registerServiceWorker } from "@/lib/alerts";
import { StoreProvider } from "@/lib/store";
import { RestTimerProvider } from "./RestTimer";
import { ToastProvider } from "./Toast";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(registerServiceWorker, []);
  return (
    <ToastProvider>
      <StoreProvider>
        <RestTimerProvider>{children}</RestTimerProvider>
      </StoreProvider>
    </ToastProvider>
  );
}
