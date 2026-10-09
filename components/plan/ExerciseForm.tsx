"use client";
import type { Exercise, Unit } from "@/lib/types";
import { CommitField, SelectField, TextField } from "./Fields";

interface Props {
  ex: Exercise;
  num: number;
  onChange(patch: Partial<Exercise>): void;
  onMove(by: -1 | 1): void;
  onRemove(): void;
}

const whole = (v: string, min: number) => Math.max(min, parseInt(v, 10) || 0);

export function ExerciseForm({ ex, num, onChange, onMove, onRemove }: Props) {
  return (
    <div className="edit-ex" id={"edit-" + ex.id}>
      <div className="row">
        <strong>{num}. {ex.name}</strong>
        <button className="btn small" onClick={() => onMove(-1)} aria-label="Move up">↑</button>
        <button className="btn small" onClick={() => onMove(1)} aria-label="Move down">↓</button>
        <button className="btn small danger" onClick={onRemove}>Remove</button>
      </div>
      <TextField label="Name" value={ex.name} onChange={(name) => onChange({ name })} />
      <div className="grid">
        <CommitField label="Sets" type="number" value={String(ex.sets)} onCommit={(v) => onChange({ sets: whole(v, 1) })} />
        <CommitField label="Target reps or seconds" type="number" value={String(ex.target)} onCommit={(v) => onChange({ target: whole(v, 0) })} />
        <SelectField
          label="Counted in"
          value={ex.unit}
          options={[["reps", "Reps"], ["sec", "Seconds"], ["min", "Minutes"]]}
          onChange={(v) => onChange({ unit: v as Unit })}
        />
        <SelectField
          label="Weight box"
          value={ex.weighted === false ? "no" : "yes"}
          options={[["yes", "Show kg"], ["no", "No weight"]]}
          onChange={(v) => onChange({ weighted: v !== "no" })}
        />
        <CommitField label="Rest (seconds)" type="number" value={String(ex.rest)} onCommit={(v) => onChange({ rest: whole(v, 0) })} />
      </div>
      <div className="grid">
        <TextField label="Shown as" value={ex.label} onChange={(label) => onChange({ label })} />
        <TextField label="Equipment" value={ex.equipment} onChange={(equipment) => onChange({ equipment })} />
      </div>
      <TextField label="Suggested start" value={ex.start} onChange={(start) => onChange({ start })} />
      <TextField label="How to do it" value={ex.cue} onChange={(cue) => onChange({ cue })} multiline />
    </div>
  );
}
