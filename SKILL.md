---
name: home-workout-plan
description: Rules for designing, revising or adding workouts in the Home gym log app, including the trainee's goals, available home equipment, exercise selection, sets, reps, rest, progression and safety, and how to write them into data.js. Use this whenever the user asks to add or change an exercise, swap equipment, create a new day (such as Wednesday), make a session harder or easier, focus on a body area (glutes, core, belly fat), or edit data.js, even if they don't mention "workout plan".
---

# Home workout plan

How to write and change workouts for this app so they stay safe, consistent with the rest of the plan, and usable with the equipment the trainee actually owns.

## The trainee

- Woman, early 40s, beginner to strength training, training at home.
- Main goals: **fat loss** (about 10 kg over roughly 12 weeks), **glutes**, and **a firmer midsection**.
- Personal measurements are intentionally not stored here because this repo is public. If a decision depends on them, ask the user.

## Equipment at home

- Bench (assume it adjusts to an incline; if unsure, give a flat-bench alternative)
- Barbell and weight plates
- Dumbbells
- MH home gym cable machine with a **high pulley** (rope, lat bar, short bar). Don't assume a low pulley; if an exercise needs one, give an alternative.
- Exercise mat
- **No** leg press, treadmill, bike, rower, pull-up bar or resistance bands unless the user says they've bought one.

Cardio is done outdoors (brisk walking, hills, stairs).

## Weekly structure

| Day | Session |
| --- | --- |
| Monday | Strength A: glutes, legs and push, plus a core block (in the app as `mon`) |
| Tuesday | Brisk walk and a core circuit |
| Wednesday | Strength B: hinge and pull (Romanian deadlift, rows, pulldowns); not in the app yet |
| Thursday | Steady cardio (intervals from week 5) |
| Friday | Strength C: full body and single-leg work (in the app as `fri`) |
| Saturday | Long easy walk, hike or cycle |
| Sunday | Rest, gentle walk and stretching |

## Session rules

- Length: 75–90 minutes, made up of a 10-minute warm-up, 45–50 minutes of main work, a 20-minute brisk walk, and a 5–10 minute cool-down.
- 5–9 exercises. Put the biggest lower-body or glute lift first, while the trainee is fresh.
- Glute work on every strength day: hip thrust, glute bridge, Romanian deadlift, reverse lunge, split squat, step-up, or a wide-stance goblet squat.
- Sets and reps: 2–3 sets of 8–15 reps. Holds: 20–45 seconds.
- Rest: 90 seconds on big lifts, 60–75 seconds on accessories, 30–45 seconds inside core blocks.
- Tempo cue: 2 seconds up breathing out, 3 seconds down breathing in.
- Balance push and pull across the week. Don't load the same muscle hard on two days in a row.
- Every exercise needs a `cue` (2–3 short sentences on form) and a conservative `start` weight (bodyweight or the lightest dumbbell or plate is fine).

## Progression

When every set reaches the top of the rep range with clean form, add 1–2 reps, or the next small weight, the following week. The app shows this hint automatically when the last session hit target on every set.

## Honesty about belly fat

Don't describe any exercise as burning belly fat. Spot reduction doesn't work. Fat loss comes from the calorie deficit, protein (about 120–135 g a day), daily steps (8,000–10,000) and the walking finishers. Core exercises are there for strength, posture and a firmer midsection as the fat comes off.

## Safety

- Every new exercise gets a regression in its cue (for example, "start from your knees", "bodyweight first", "use a lower step").
- No high-impact jumping while the trainee is still a beginner or reports joint pain.
- Keep the stop rule in mind: dizziness, chest pain or sharp joint pain means stop. Muscle burn is fine.
- Don't give medical advice. If the user mentions pain or an injury, suggest a qualified professional and offer a gentler alternative.

## Writing it into the app

Add the workout to `window.DEFAULT_WORKOUTS` in `data.js`, using the schema in `AGENTS.md`. Example exercise:

```js
{ id: "wed-rdl", name: "Romanian deadlift", equipment: "Barbell", sets: 3, target: 10, unit: "reps", label: "10", rest: 90,
  start: "Empty bar, or two light dumbbells",
  cue: "Soft knees, push the hips back and slide the bar down the thighs until you feel the hamstrings stretch. Back flat, then drive the hips forward to stand." }
```

Checklist:

1. A new workout gets a short, permanent `id` (for example `wed`) and the right `weekday` (0 = Sunday ... 6 = Saturday).
2. Exercise ids follow `<workoutId>-<slug>` and must not reuse an existing id.
3. Never change an existing exercise's `id`, because that orphans its history. Edit `name` and other fields instead.
4. Run `node --check data.js`.
5. Tell the user how to get the change onto their phone (see "Important gotcha" in `AGENTS.md`).
