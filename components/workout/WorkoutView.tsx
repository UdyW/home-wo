"use client";
import { useRouter } from "next/navigation";
import { useRestTimer } from "@/components/RestTimer";
import { useToast } from "@/components/Toast";
import { buildDraft, orderedWorkouts } from "@/lib/plan";
import { useStore } from "@/lib/store";
import type { Draft, SetEntry, Workout } from "@/lib/types";
import { ExerciseCard } from "./ExerciseCard";
import { WarmupList } from "./WarmupList";

function Hero({ w, children }: { w: Workout; children?: React.ReactNode }) {
  return (
    <section className="hero">
      <p className="day">{w.dayLabel}</p>
      <h2>{w.title}</h2>
      <p className="sub">{w.summary}</p>
      {children}
    </section>
  );
}

function RestDay({ w, workouts }: { w: Workout; workouts: Workout[] }) {
  const next = orderedWorkouts(workouts).find((x) => !x.restDay && x.exercises.length);
  return (
    <div data-tint={w.weekday}>
      <Hero w={w} />
      {w.warmup?.length > 0 && (
        <details className="block" open>
          <summary className="row-toggle">Gentle options for today</summary>
          <WarmupList items={w.warmup} />
        </details>
      )}
      {next && (
        <p className="empty">Nothing to log today. Your week starts again with {next.dayLabel} {next.title}.</p>
      )}
    </div>
  );
}

export function WorkoutView() {
  const { data, sessions, workout: w, saveDraft, clearDraft, finishSession } = useStore();
  const startRest = useRestTimer();
  const toast = useToast();
  const router = useRouter();

  if (w.restDay) return <RestDay w={w} workouts={data.workouts} />;

  const draft = buildDraft(w, data.drafts[w.id], sessions);
  const allSets = w.exercises.flatMap((ex) => draft.entries[ex.id]);
  const doneCount = allSets.filter((s) => s.done).length;

  const setSets = (exId: string, sets: SetEntry[]) =>
    saveDraft({ ...draft, entries: { ...draft.entries, [exId]: sets } });

  const finish = () => {
    const any = Object.values(draft.entries).some((sets) => sets.some((x) => x.done));
    if (!any) { toast("Tap a plate to mark at least one set done first."); return; }
    finishSession(w, draft);
    toast("Session saved");
    router.push("/history");
    window.scrollTo(0, 0);
  };

  const discard = () => {
    if (confirm("Clear everything you've entered for this workout today?")) clearDraft(w.id);
  };

  return (
    // data-tint gives the page this day's colour (see "Day colours" in globals.css)
    <div data-tint={w.weekday}>
      <Hero w={w}>
        <div className="meter" aria-hidden="true">
          {allSets.map((s, i) => <i key={i} className={s.done ? "on" : ""} />)}
        </div>
        <p className="count"><b>{doneCount}</b> of {allSets.length} sets done</p>
      </Hero>

      {w.warmup?.length > 0 && (
        <details className="block">
          <summary className="row-toggle">Warm-up</summary>
          <WarmupList items={w.warmup} />
        </details>
      )}

      {w.exercises.map((ex, i) => {
        const sets = draft.entries[ex.id];
        return (
          <ExerciseCard
            key={ex.id}
            ex={ex}
            num={i + 1}
            sets={sets}
            sessions={sessions}
            onSetChange={(j, patch) => setSets(ex.id, sets.map((s, k) => (k === j ? { ...s, ...patch } : s)))}
            onKgDone={(j) => {
              const kg = sets[j].kg;
              if (kg === "") return;
              const next = sets.map((s, k) => (k > j && s.kg === "" && !s.done ? { ...s, kg } : s));
              if (next.some((s, k) => s !== sets[k])) setSets(ex.id, next);
            }}
            onToggle={(j) => {
              const done = !sets[j].done;
              setSets(ex.id, sets.map((s, k) => (k === j ? { ...s, done } : s)));
              if (done) startRest(ex.rest);
            }}
          />
        );
      })}

      <div className="closing">
        {w.finisher && <p><b>Finisher:</b> {w.finisher}</p>}
        {w.cooldown && <p><b>Cool-down:</b> {w.cooldown}</p>}
        <label className="field">
          <span>Notes for today (how it felt, anything that hurt)</span>
          <textarea value={draft.notes} onChange={(e) => saveDraft({ ...draft, notes: e.target.value })} />
        </label>
      </div>
      <div className="actions stack">
        <button className="btn primary large" onClick={finish}>Finish and save session</button>
        <button className="btn plain danger" onClick={discard}>Clear today’s entries</button>
      </div>
    </div>
  );
}
