"use client";
import { lastEntry, unitWord } from "@/lib/plan";
import type { Exercise, Session, SetEntry } from "@/lib/types";
import { MovePhotos } from "./MovePhotos";

interface Props {
  ex: Exercise;
  num: number;
  sets: SetEntry[];
  sessions: Session[]; // newest first
  onSetChange(i: number, patch: Partial<SetEntry>): void;
  /** Called when a kg box is left with a value: fills the same weight into later empty sets. */
  onKgDone(i: number): void;
  onToggle(i: number): void;
}

function LastTime({ ex, sessions }: { ex: Exercise; sessions: Session[] }) {
  const last = lastEntry(ex.id, sessions);
  if (!last) return null;
  const done = last.sets.filter((s) => s.done);
  const kgs = done.map((s) => s.kg).filter((k) => k !== "");
  const hitAll = last.sets.length >= ex.sets && last.sets.every((s) => s.done && Number(s.reps) >= Number(ex.target));
  return (
    <>
      <p className="last">
        Last time: {kgs.length ? kgs[0] + " kg, " : ""}{done.map((s) => s.reps).join(", ")} {unitWord(ex)}
      </p>
      {hitAll && ex.unit !== "min" && (
        <p className="hint">Every set hit target last time. Try 1–2 more {unitWord(ex)} or the next weight.</p>
      )}
    </>
  );
}

export function ExerciseCard({ ex, num, sets, sessions, onSetChange, onKgDone, onToggle }: Props) {
  const weighted = ex.weighted !== false;
  const unit = unitWord(ex);
  return (
    <article className="ex">
      <header>
        <span className="num">{num}</span>
        <div>
          <h3>{ex.name}</h3>
          <p className="meta">
            {ex.sets > 1 ? ex.sets + " × " : ""}{ex.label || ex.target}
            {Number(ex.rest) ? ", " + ex.rest + " s rest" : ""}. {ex.equipment || ""}
          </p>
        </div>
      </header>
      <LastTime ex={ex} sessions={sessions} />
      <div className="sets">
        {sets.map((s, j) => (
          <div key={j} className={"set" + (weighted ? "" : " noweight")}>
            <span className="n">{ex.sets > 1 ? "Set " + (j + 1) : ex.unit === "min" ? "Done" : "Set 1"}</span>
            {weighted && (
              <label>
                <input
                  inputMode="decimal"
                  value={s.kg}
                  placeholder="–"
                  aria-label={"Set " + (j + 1) + " weight in kg"}
                  onChange={(e) => onSetChange(j, { kg: e.target.value.trim() })}
                  onBlur={() => onKgDone(j)}
                />
                <span>kg</span>
              </label>
            )}
            <label>
              <input
                inputMode="numeric"
                value={s.reps}
                aria-label={"Set " + (j + 1) + " " + unit}
                onChange={(e) => onSetChange(j, { reps: e.target.value.trim() })}
              />
              <span>{unit}</span>
            </label>
            <button
              className={"plate" + (s.done ? " on" : "")}
              aria-pressed={s.done}
              aria-label={"Mark set " + (j + 1) + " done"}
              onClick={() => onToggle(j)}
            />
          </div>
        ))}
      </div>
      <details className="cue">
        <summary>How to do it</summary>
        <MovePhotos ex={ex} />
        {ex.cue && <p>{ex.cue}</p>}
        {ex.start && <p><b>Suggested start:</b> {ex.start}</p>}
      </details>
    </article>
  );
}
