// Sound, vibration, notification and screen wake lock for the rest timer. Browser only.

let alarm: HTMLAudioElement | null = null;
let alarmReady = false;
let wakeLock: WakeLockSentinel | null = null;
let swReg: ServiceWorkerRegistration | null = null;

export function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("/sw.js").then((r) => { swReg = r; }).catch(() => {});
  }
}

// Three short beeps as a WAV file made in the browser (no download).
// An <audio> element still plays when an iPhone's silent switch is on; Web Audio doesn't.
function makeBeepUrl(): string {
  const rate = 22050, n = Math.round(rate * 0.8), buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const str = (o: number, t: string) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); str(8, "WAVEfmt "); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const t = i / rate, p = t % 0.3, on = p < 0.18;
    const env = on ? Math.min(1, p / 0.01, (0.18 - p) / 0.01) : 0;
    v.setInt16(44 + i * 2, (Math.sin(2 * Math.PI * 880 * t) > 0 ? 1 : -1) * env * 9000, true);
  }
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}

/** Call from a tap: phones only allow sound, wake lock and permission prompts after one. */
export function prepareAlerts() {
  if (!alarm) { alarm = new Audio(makeBeepUrl()); alarm.preload = "auto"; }
  if (!alarmReady) {
    // A silent play inside the tap unlocks the element so it can beep later on its own.
    const a = alarm;
    a.muted = true;
    a.play()
      .then(() => { a.pause(); a.currentTime = 0; a.muted = false; alarmReady = true; })
      .catch(() => { a.muted = false; });
  }
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
  // Keep the screen on during the rest, so the phone doesn't pause the page.
  if (navigator.wakeLock && !wakeLock) {
    navigator.wakeLock.request("screen").then((l) => {
      wakeLock = l;
      l.addEventListener("release", () => { wakeLock = null; });
    }).catch(() => {});
  }
}

export function releaseWakeLock() {
  if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
}

export function restDone() {
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  if (alarm) {
    alarm.muted = false;
    alarm.currentTime = 0;
    alarm.play().catch(() => {});
  }
  if (document.hidden && "Notification" in window && Notification.permission === "granted") {
    const opts = { body: "Rest done. Time for your next set.", tag: "rest-timer", renotify: true } as NotificationOptions;
    if (swReg) swReg.showNotification("Pram's home gym log", opts);
    else { try { new Notification("Pram's home gym log", opts); } catch { /* not supported here */ } }
  }
  releaseWakeLock();
}
