"use client";
import { useToast } from "@/components/Toast";
import { isBackup, toBackup } from "@/lib/db";
import { useStore } from "@/lib/store";

export function BackupTools() {
  const { data, importBackup, restorePlan } = useStore();
  const toast = useToast();

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(toBackup(data), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "home-gym-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const onFile = async (input: HTMLInputElement) => {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    let backup: unknown;
    try { backup = JSON.parse(await file.text()); } catch { backup = null; }
    if (!isBackup(backup)) { toast("That file isn't a home gym log backup."); return; }
    if (!confirm("Replace everything on this device with the backup?")) return;
    try {
      await importBackup(backup);
      toast("Backup imported");
    } catch {
      toast("Couldn't import the backup. Check there's free space on this device and try again.");
    }
  };

  return (
    <>
      <p className="empty">
        Your data lives in this browser only. Export a backup now and then, and import it on another phone or computer.
      </p>
      <div className="actions">
        <button className="btn" onClick={exportBackup}>Export backup</button>
        <label className="btn">
          Import backup
          <input type="file" accept="application/json" hidden onChange={(e) => onFile(e.currentTarget)} />
        </label>
        <button
          className="btn danger"
          onClick={() => {
            if (confirm("Restore the original weekly plan? Your history is kept; your edits to the plan are lost.")) restorePlan();
          }}
        >
          Restore original plan
        </button>
      </div>
    </>
  );
}
