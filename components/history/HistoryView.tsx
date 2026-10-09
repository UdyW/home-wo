"use client";
import { fmtDate, topWeights } from "@/lib/plan";
import { useStore } from "@/lib/store";
import type { Session } from "@/lib/types";
import { Sparkline } from "./Sparkline";

function Progress({ oldestFirst }: { oldestFirst: Session[] }) {
  const { data } = useStore();
  return (
    <>
      <h2 className="section">Progress</h2>
      {data.workouts.flatMap((w) =>
        w.exercises.map((ex) => {
          const vals = topWeights(ex.id, oldestFirst);
          if (!vals.length) return null;
          const vs = vals.slice(-12);
          const diff = vs[vs.length - 1] - vs[0];
          return (
            <div className="trend" key={ex.id}>
              <div>
                {ex.name}
                <small>{w.dayLabel}, {vals.length} session{vals.length > 1 ? "s" : ""}</small>
              </div>
              <Sparkline values={vs} />
              <div className="val">
                {vs[vs.length - 1]} kg
                <small>{diff > 0 ? "+" + diff : diff === 0 ? "same" : diff}</small>
              </div>
            </div>
          );
        }),
      )}
    </>
  );
}

function SessionItem({ s, onDelete }: { s: Session; onDelete(): void }) {
  const count = Object.values(s.entries).reduce((n, sets) => n + sets.filter((x) => x.done).length, 0);
  return (
    <details className="session">
      <summary>
        <b>{fmtDate(s.date)}</b> {s.title} <span>({count} sets)</span>
      </summary>
      <ul>
        {Object.entries(s.entries).map(([exId, sets]) => {
          const done = sets.filter((x) => x.done);
          if (!done.length) return null;
          return (
            <li key={exId}>
              {s.names?.[exId] || exId}: {done.map((x) => (x.kg !== "" ? x.kg + " kg × " : "") + x.reps).join(", ")}
            </li>
          );
        })}
      </ul>
      {s.notes && <p>{s.notes}</p>}
      <button className="btn small danger" onClick={onDelete}>Delete this session</button>
    </details>
  );
}

export function HistoryView() {
  const { sessions, deleteSession } = useStore();
  if (!sessions.length) {
    return (
      <>
        <h2 className="section">History</h2>
        <p className="empty">No sessions yet. Finish a workout and it will show up here, with your weights over time.</p>
      </>
    );
  }
  return (
    <>
      <Progress oldestFirst={sessions.slice().reverse()} />
      <h2 className="section">Sessions</h2>
      {sessions.map((s) => (
        <SessionItem
          key={s.id}
          s={s}
          onDelete={() => { if (confirm("Delete this session from your history?")) deleteSession(s.id); }}
        />
      ))}
    </>
  );
}
