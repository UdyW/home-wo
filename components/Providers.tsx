"use client";
import { useEffect, type ReactNode } from "react";
import { registerServiceWorker } from "@/lib/alerts";
import { AuthGate } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";
import { RestTimerProvider } from "./RestTimer";
import { ToastProvider } from "./Toast";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(registerServiceWorker, []);
  return (
    <ToastProvider>
      <AuthGate>
        <StoreProvider>
          <RestTimerProvider>{children}</RestTimerProvider>
        </StoreProvider>
      </AuthGate>
    </ToastProvider>
  );
}
