// Default plan. Edit in the app (Edit tab) or here before deploying.
// target = number of reps (or seconds when unit is "sec"); label = what you see.
window.DEFAULT_WORKOUTS = [
  {
    id: "mon",
    weekday: 1,
    dayLabel: "Monday",
    title: "Strength A",
    summary: "Glutes, legs and push, plus a core block. About 75\u201385 minutes.",
    warmup: [
      ["Marching on the spot with arm swings", "4 min", "Replaces the bike. Easy pace, you can chat."],
      ["Leg swings, front to back", "10 per leg", "Hold the cable machine frame for balance."],
      ["Bodyweight squat", "15", "Slow, as deep as is comfortable."],
      ["Glute bridge", "15", "On the mat, one-second squeeze at the top."],
      ["Side-lying clamshell", "15 per side", "Knees bent, feet together, open the top knee."],
      ["Arm circles, forwards and back", "15 each way", "Replaces the band pull-apart before pressing."]
    ],
    exercises: [
      { id: "mon-hipthrust", name: "Barbell hip thrust", equipment: "Bench, barbell, towel or pad", sets: 3, target: 10, unit: "reps", label: "10", rest: 90,
        start: "Empty bar, or glute bridge on the floor first",
        cue: "Upper back on the long side of the bench, bar across the hip crease with a folded towel under it. Chin tucked, drive through the heels until hips are level with knees, squeeze 2 seconds. Ribs stay down; don't arch the lower back." },
      { id: "mon-goblet", name: "Goblet squat", equipment: "1 dumbbell", sets: 3, target: 10, unit: "reps", label: "10", rest: 90,
        start: "4\u20136 kg",
        cue: "Feet a little wider than shoulders, toes turned out slightly. Sit down between your knees, pause 2 seconds at the bottom, then push up through the whole foot." },
      { id: "mon-dbbench", name: "Dumbbell bench press", equipment: "Flat bench, 2 dumbbells", sets: 3, target: 10, unit: "reps", label: "10", rest: 90,
        start: "3\u20135 kg per hand",
        cue: "Elbows about 45\u00b0 from the body, not flared out. Lower under control to chest level, press up." },
      { id: "mon-revlunge", name: "Dumbbell reverse lunge", equipment: "2 dumbbells", sets: 3, target: 10, unit: "reps", label: "10 per leg", rest: 75,
        start: "Bodyweight, then 2\u20134 kg per hand",
        cue: "Step back, lower the back knee towards the floor. Lean the torso slightly forward and push up through the front heel. Bodyweight first if balance is shaky." },
      { id: "mon-shpress", name: "Seated dumbbell shoulder press", equipment: "Bench upright, 2 dumbbells", sets: 2, target: 10, unit: "reps", label: "10", rest: 75,
        start: "2\u20134 kg per hand",
        cue: "Back supported. If the shoulder pinches, turn palms to face each other." },
      { id: "mon-pushdown", name: "Rope triceps pushdown", equipment: "Cable, high pulley, rope", sets: 2, target: 12, unit: "reps", label: "12", rest: 60,
        start: "Plate 1\u20132",
        cue: "Elbows pinned to your sides; only the forearms move." },
      { id: "mon-crunch", name: "Kneeling cable crunch", equipment: "Cable, high pulley, rope", sets: 2, target: 12, unit: "reps", label: "12", rest: 30,
        start: "Plate 1\u20132",
        cue: "Core block: two rounds. Kneel facing the machine, rope beside your head. Curl ribs towards hips; don't pull with the arms." },
      { id: "mon-deadbug", name: "Dead bug", equipment: "Mat", sets: 2, target: 10, unit: "reps", label: "10 per side", rest: 30,
        start: "Bodyweight",
        cue: "Lower back stays flat on the mat. Shorten the range if it lifts." },
      { id: "mon-plank", name: "Plank", equipment: "Mat", sets: 2, target: 30, unit: "sec", label: "30\u201345 s", rest: 60,
        start: "Bodyweight",
        cue: "Ribs down, glutes squeezed. Stop when the hips start to sag." }
    ],
    finisher: "Brisk walk, 20 minutes. Pick a route with a hill or stairs; talk-but-not-sing pace.",
    cooldown: "Figure-four glute stretch, half-kneeling hip flexor stretch, hamstring stretch, doorway chest stretch. 20\u201330 s each, no bouncing."
  },
  {
    id: "fri",
    weekday: 5,
    dayLabel: "Friday",
    title: "Strength C",
    summary: "Full body with single-leg work. About 75\u201390 minutes.",
    warmup: [
      ["Marching on the spot with arm swings", "5 min", "Replaces the bike. Light effort, you can chat."],
      ["Walking lunge (or static lunge)", "10 per side", "Bodyweight, hold the machine frame if needed."],
      ["Arm circles, forwards and back", "15 each way", "Small circles growing bigger."],
      ["Cable external rotation", "15 per side", "Lightest plate, elbow tucked, rotate the hand outwards."],
      ["Glute bridge", "15", "On the mat, one-second squeeze at the top."]
    ],
    exercises: [
      { id: "fri-split", name: "Dumbbell split squat", equipment: "2 dumbbells", sets: 3, target: 8, unit: "reps", label: "8 per leg", rest: 90,
        start: "Bodyweight or 2\u20134 kg per hand",
        cue: "Back foot on the floor. Front shin roughly vertical, torso upright, lower the back knee towards the floor." },
      { id: "fri-incline", name: "Incline dumbbell press", equipment: "Bench at ~30\u00b0, 2 dumbbells", sets: 3, target: 10, unit: "reps", label: "10", rest: 90,
        start: "3\u20135 kg per hand",
        cue: "Lower to the upper chest, press up and slightly together. Flat bench only? Do a flat dumbbell press." },
      { id: "fri-stepup", name: "Step-up", equipment: "Bench or sturdy step", sets: 3, target: 10, unit: "reps", label: "10 per leg", rest: 90,
        start: "Bodyweight",
        cue: "Drive through the top foot; don't push off the bottom one. If the bench is above knee height, use a lower step." },
      { id: "fri-sapd", name: "Straight-arm pulldown", equipment: "Cable, high pulley, lat bar", sets: 3, target: 12, unit: "reps", label: "12", rest: 60,
        start: "Plate 1\u20132",
        cue: "Arms almost straight, pull the bar down to your thighs. Feel it under the armpits." },
      { id: "fri-facepull", name: "Face pull", equipment: "Cable, high pulley, rope", sets: 3, target: 15, unit: "reps", label: "15", rest: 60,
        start: "Plate 1",
        cue: "Step back, pull towards your forehead with elbows high and wide. Squeeze shoulder blades together." },
      { id: "fri-curl", name: "Dumbbell biceps curl", equipment: "2 dumbbells", sets: 2, target: 12, unit: "reps", label: "12", rest: 60,
        start: "2\u20134 kg per hand",
        cue: "Elbows pinned to your sides, no swinging." },
      { id: "fri-sideplank", name: "Side plank", equipment: "Mat", sets: 3, target: 20, unit: "sec", label: "20\u201330 s per side", rest: 45,
        start: "Bodyweight",
        cue: "Hips stacked and lifted. Start from your knees if the full version is too hard." }
    ],
    finisher: "Brisk walk, 20 minutes. A route with a hill if you can.",
    cooldown: "Hip flexor, hamstring, chest and calf stretches. 15\u201330 s each, 2 rounds."
  }
];
