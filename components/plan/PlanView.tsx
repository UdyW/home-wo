"use client";
import { useToast } from "@/components/Toast";
import { newExercise, newWorkout, WEEKDAYS } from "@/lib/plan";
import { useStore } from "@/lib/store";
import type { Exercise, WarmupItem, Workout } from "@/lib/types";
import { BackupTools } from "./BackupTools";
import { ExerciseForm } from "./ExerciseForm";
import { CommitField, SelectField, TextField } from "./Fields";

// Warm-up is edited as text, one item per line: movement | amount | note
const warmupToText = (items: WarmupItem[]) => (items || []).map((r) => r.join(" | ")).join("\n");
const textToWarmup = (text: string): WarmupItem[] =>
  text.split("\n")
    .map((l) => l.split("|").map((p) => p.trim()))
    .filter((r) => r[0])
    .map((r) => [r[0], r[1] || "", r[2] || ""]);

export function PlanView() {
  const { data, workout: w, updateWorkout, setWorkouts } = useStore();
  const toast = useToast();

  const update = (patch: Partial<Workout>) => updateWorkout({ ...w, ...patch });
  const setExercises = (exercises: Exercise[]) => update({ exercises });

  const move = (i: number, by: -1 | 1) => {
    const to = i + by;
    if (to < 0 || to >= w.exercises.length) return;
    const list = w.exercises.slice();
    [list[i], list[to]] = [list[to], list[i]];
    setExercises(list);
  };

  const remove = (ex: Exercise) => {
    if (confirm("Remove " + ex.name + " from " + w.dayLabel + "? Past sessions keep their records.")) {
      setExercises(w.exercises.filter((x) => x.id !== ex.id));
    }
  };

  const addExercise = () => {
    const ex = newExercise(w.id);
    setExercises([...w.exercises, ex]);
    setTimeout(() => document.getElementById("edit-" + ex.id)?.scrollIntoView(), 0);
  };

  const addWorkout = () => {
    const name = prompt("Name the day, for example Wednesday");
    if (!name) return;
    const nw = newWorkout(name);
    setWorkouts([...data.workouts, nw], nw.id);
  };

  const deleteWorkout = () => {
    if (data.workouts.length === 1) { toast("Keep at least one workout day."); return; }
    if (confirm("Delete the " + w.dayLabel + " workout? Past sessions stay in History.")) {
      const rest = data.workouts.filter((x) => x.id !== w.id);
      setWorkouts(rest, rest[0].id);
    }
  };

  return (
    <>
      <h2 className="section">Edit {w.dayLabel}</h2>
      <div className="grid">
        <TextField label="Day name" value={w.dayLabel} onChange={(dayLabel) => update({ dayLabel })} />
        <TextField label="Title" value={w.title} onChange={(title) => update({ title })} />
        <SelectField
          label="Opens automatically on"
          value={String(w.weekday)}
          options={[["", "No day"], ...WEEKDAYS.map((d, i): [string, string] => [String(i), d])]}
          onChange={(v) => update({ weekday: v === "" ? "" : Number(v) })}
        />
        <SelectField
          label="Type of day"
          value={w.restDay ? "yes" : "no"}
          options={[["no", "Training day"], ["yes", "Rest day (nothing to log)"]]}
          onChange={(v) => update({ restDay: v === "yes" })}
        />
      </div>
      <TextField label="Summary" value={w.summary} onChange={(summary) => update({ summary })} />
      <CommitField
        key={w.id}
        label="Warm-up (one per line: movement | amount | note)"
        value={warmupToText(w.warmup)}
        onCommit={(v) => update({ warmup: textToWarmup(v) })}
        multiline
      />
      <TextField label="Finisher" value={w.finisher} onChange={(finisher) => update({ finisher })} />
      <TextField label="Cool-down" value={w.cooldown} onChange={(cooldown) => update({ cooldown })} />

      <h2 className="section">Exercises</h2>
      {w.exercises.map((ex, i) => (
        <ExerciseForm
          key={ex.id}
          ex={ex}
          num={i + 1}
          onChange={(patch) => setExercises(w.exercises.map((x) => (x.id === ex.id ? { ...x, ...patch } : x)))}
          onMove={(by) => move(i, by)}
          onRemove={() => remove(ex)}
        />
      ))}
      <div className="actions">
        <button className="btn primary" onClick={addExercise}>Add exercise</button>
      </div>

      <h2 className="section">Plan and data</h2>
      <div className="actions">
        <button className="btn" onClick={addWorkout}>Add a workout day</button>
        <button className="btn danger" onClick={deleteWorkout}>Delete {w.dayLabel}</button>
      </div>
      <BackupTools />
    </>
  );
}
