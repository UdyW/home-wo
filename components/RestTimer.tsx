"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { prepareAlerts, releaseWakeLock, restDone } from "@/lib/alerts";

const TimerContext = createContext<(sec: number) => void>(() => {});

/** Starts the rest timer for the given number of seconds. */
export function useRestTimer() {
  return useContext(TimerContext);
}

export function RestTimerProvider({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(false);
  const end = useRef(0);
  const total = useRef(0);
  const interval = useRef<ReturnType<typeof setInterval>>(undefined);
  const hide = useRef<ReturnType<typeof setTimeout>>(undefined);

  const tick = useCallback(() => {
    const l = Math.max(0, Math.ceil((end.current - Date.now()) / 1000));
    setLeft(l);
    if (l <= 0 && interval.current) {
      clearInterval(interval.current);
      interval.current = undefined;
      setDone(true);
      restDone();
      hide.current = setTimeout(() => setShown(false), 5000);
    }
  }, []);

  const run = useCallback(() => {
    clearInterval(interval.current);
    clearTimeout(hide.current);
    interval.current = setInterval(tick, 250);
    setDone(false);
    setShown(true);
    tick();
  }, [tick]);

  const start = useCallback((sec: number) => {
    sec = Number(sec);
    if (!sec) return;
    prepareAlerts();
    total.current = sec;
    end.current = Date.now() + sec * 1000;
    run();
  }, [run]);

  const addTime = () => { end.current += 15000; total.current += 15; run(); };
  const skip = () => {
    clearInterval(interval.current);
    interval.current = undefined;
    releaseWakeLock();
    setShown(false);
  };

  // Phones pause the page in the background; finish the timer as soon as it's back.
  useEffect(() => {
    const onVisible = () => {
      if (document.hidden || !interval.current) return;
      tick();
      if (interval.current) prepareAlerts(); // the phone drops the screen wake lock when you leave
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [tick]);

  const fill = total.current ? 100 - (left / total.current) * 100 : 0;

  return (
    <TimerContext.Provider value={start}>
      {children}
      <div className="timer" hidden={!shown}>
        <div className="timer-bar"><span style={{ width: fill + "%" }} /></div>
        <div className="timer-row">
          <p>
            <span>{done ? "Rest done. Next set" : "Rest"}</span>{" "}
            <strong>{Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0")}</strong>
          </p>
          <button onClick={addTime}>+15 s</button>
          <button onClick={skip}>Skip</button>
        </div>
      </div>
    </TimerContext.Provider>
  );
}
