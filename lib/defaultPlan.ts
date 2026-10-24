import type { Workout } from "./types";

// Generic example plan for new users. It is not anyone's real plan: the repo is public,
// so real plans live only in each user's saved data. Users edit it in the app (Edit plan).
// target = number of reps, seconds (unit "sec") or minutes (unit "min"); label = what you see.
// weighted: false hides the kg box. restDay: true shows a rest-day page with no logging.
// Day ids stay within mon...sun so existing users with DEFAULT_PLAN_VERSION 2 get no new days.
export const DEFAULT_PLAN_VERSION = 2;
export const DEFAULT_WORKOUTS: Workout[] = [
  {
    id: "mon",
    weekday: 1,
    dayLabel: "Monday",
    title: "Example full body A",
    summary: "An example day. Change it to match your own routine in Edit plan.",
    warmup: [
      ["Easy cardio", "5 min", "Walk, bike or march on the spot."],
      ["Bodyweight squat", "10", "Slow, as deep as is comfortable."]
    ],
    exercises: [
      { id: "mon-goblet", name: "Goblet squat", equipment: "1 dumbbell", sets: 3, target: 10, unit: "reps", label: "10", rest: 90,
        start: "A light dumbbell",
        cue: "Hold the dumbbell at your chest. Sit down between your knees, then push up through the whole foot." },
      { id: "mon-dbbench", name: "Dumbbell bench press", equipment: "Flat bench, 2 dumbbells", sets: 3, target: 10, unit: "reps", label: "10", rest: 90,
        start: "Light dumbbells",
        cue: "Elbows about 45° from the body. Lower under control to chest level, then press up." },
      { id: "mon-plank", name: "Plank", equipment: "Mat", sets: 2, target: 30, unit: "sec", label: "30 s", rest: 60, weighted: false,
        start: "Bodyweight",
        cue: "Ribs down, glutes squeezed. Stop when the hips start to sag." }
    ],
    finisher: "",
    cooldown: "Gentle stretches for the legs, hips and chest."
  },
  {
    id: "thu",
    weekday: 4,
    dayLabel: "Thursday",
    title: "Example full body B",
    summary: "An example day. Change it to match your own routine in Edit plan.",
    warmup: [
      ["Easy cardio", "5 min", "Walk, bike or march on the spot."]
    ],
    exercises: [
      { id: "thu-glutebridge", name: "Glute bridge", equipment: "Mat", sets: 3, target: 12, unit: "reps", label: "12", rest: 60, weighted: false,
        start: "Bodyweight",
        cue: "Drive through the heels and squeeze at the top. Keep the ribs down." },
      { id: "thu-row", name: "Single-arm dumbbell row", equipment: "Bench, 1 dumbbell", sets: 3, target: 10, unit: "reps", label: "10 per side", rest: 60,
        start: "A light dumbbell",
        cue: "One hand and knee on the bench, back flat. Pull the dumbbell towards your hip, then lower slowly." },
      { id: "thu-walk", name: "Walk", equipment: "Outdoors, or treadmill", sets: 1, target: 20, unit: "min", label: "20 min", rest: 0, weighted: false,
        start: "Comfortable pace",
        cue: "A pace where you can still talk." }
    ],
    finisher: "",
    cooldown: "Gentle stretches for the legs and hips."
  },
  {
    id: "sun",
    weekday: 0,
    dayLabel: "Sunday",
    title: "Rest day",
    restDay: true,
    summary: "No training today. Gentle movement is fine.",
    warmup: [
      ["Gentle walk", "About 20 min", "Easy pace."]
    ],
    exercises: [],
    finisher: "",
    cooldown: ""
  }
];
