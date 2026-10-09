"use client";
import { useStore } from "@/lib/store";
import { isToday, orderedWorkouts } from "@/lib/plan";

/** Day picker, Monday to Sunday. Today's day is underlined. */
export function DayBar() {
  const { data, workout, today, selectDay } = useStore();
  return (
    <div className="daybar" role="tablist" aria-label="Workout day">
      {orderedWorkouts(data.workouts).map((w) => {
        const name = w.dayLabel || w.title || "Day";
        const short = /day$/i.test(name) ? name.slice(0, 3) : name;
        return (
          <button
            key={w.id}
            role="tab"
            aria-selected={w.id === workout.id}
            aria-label={name}
            data-tint={w.weekday}
            className={isToday(w, today) ? "is-today" : undefined}
            onClick={() => selectDay(w.id)}
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}
