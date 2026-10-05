// Default plan. Edit in the app (Edit tab) or here before deploying.
// target = number of reps, seconds (unit "sec") or minutes (unit "min"); label = what you see.
// weighted: false hides the kg box. restDay: true shows a rest-day page with no logging.
// Bump DEFAULT_PLAN_VERSION when you add new workout days: the app then adds any day
// whose id it doesn't have yet, without touching days the user already has.
window.DEFAULT_PLAN_VERSION = 2;
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
    id: "tue",
    weekday: 2,
    dayLabel: "Tuesday",
    title: "Walk and core",
    summary: "A brisk walk, then a short core and glute circuit on the mat. About 60\u201370 minutes. Bodyweight, with an optional dumbbell for the bridges.",
    warmup: [
      ["Easy walking", "5 min", "Start of the walk, before you pick up the pace."]
    ],
    exercises: [
      { id: "tue-walk", name: "Brisk walk", equipment: "Outdoors", sets: 1, target: 45, unit: "min", label: "45 min", rest: 0, weighted: false,
        start: "6\u20136.5 km/h on the flat",
        cue: "Fast enough that you can talk but not sing. Hills or steps make it work like an incline treadmill and bring the glutes in. Bad weather: 40 minutes of stairs or an indoor walking video." },
      { id: "tue-glutebridge", name: "Glute bridge", equipment: "Mat, 1 dumbbell optional", sets: 3, target: 15, unit: "reps", label: "15", rest: 15,
        start: "Bodyweight, then a dumbbell on the hips",
        cue: "Circuit: three rounds of these four moves, 60 s rest after each round. Drive through the heels, squeeze for one second at the top, ribs down." },
      { id: "tue-deadbug", name: "Dead bug", equipment: "Mat", sets: 3, target: 10, unit: "reps", label: "10 per side", rest: 15, weighted: false,
        start: "Bodyweight",
        cue: "Lower back stays flat on the floor. If it lifts, shorten the range." },
      { id: "tue-sideplank", name: "Side plank", equipment: "Mat", sets: 3, target: 20, unit: "sec", label: "20\u201330 s per side", rest: 15, weighted: false,
        start: "Bodyweight",
        cue: "Hips stacked and lifted. Drop to the knees if the full version is too much for now." },
      { id: "tue-birddog", name: "Bird dog", equipment: "Mat", sets: 3, target: 10, unit: "reps", label: "10 per side", rest: 60, weighted: false,
        start: "Bodyweight",
        cue: "Opposite arm and leg, slow. Don't let the hips rotate. Rest 60 s, then start the next round." }
    ],
    finisher: "",
    cooldown: "Hip flexor stretch 45 s per side, 10 slow cat-cows, seated hamstring stretch 45 s per side, doorway chest stretch 45 s per side."
  },
  {
    id: "wed",
    weekday: 3,
    dayLabel: "Wednesday",
    title: "Strength B",
    summary: "Hinge and pull: the back of the body, glutes and hamstrings. About 75\u201385 minutes.",
    warmup: [
      ["Marching on the spot with arm swings", "4 min", "Easy pace, you can chat."],
      ["Good morning, bodyweight", "12", "Hands on hips, soft knees, push the hips back. Rehearses the deadlift."],
      ["Glute bridge", "15", "One-second squeeze at the top."],
      ["Cat-cow", "10", "Slow, wakes up the spine."],
      ["Light straight-arm pulldown", "12", "Lightest plate, to warm the upper back before pulling."]
    ],
    exercises: [
      { id: "wed-rdl", name: "Romanian deadlift", equipment: "Barbell", sets: 3, target: 10, unit: "reps", label: "10", rest: 90,
        start: "Empty bar, or 2 light dumbbells",
        cue: "Soft knees, push the hips back and slide the bar down the thighs until you feel the hamstrings stretch, around mid-shin. Back flat, then drive the hips forward to stand. Squeeze the glutes at the top." },
      { id: "wed-pulldown", name: "Lat pulldown", equipment: "Cable, high pulley, lat bar", sets: 3, target: 10, unit: "reps", label: "10", rest: 90,
        start: "Plate 2\u20133",
        cue: "Kneel, or sit on the bench, facing the machine. Chest up, pull the bar to the top of your chest, elbows down and slightly back. Control it on the way up." },
      { id: "wed-sumo", name: "Dumbbell sumo squat", equipment: "1 dumbbell", sets: 3, target: 12, unit: "reps", label: "12", rest: 75,
        start: "6\u20138 kg",
        cue: "Wide stance, toes turned out, hold one dumbbell between the legs. Sit straight down with knees pushed out over the toes, then squeeze the glutes to stand. Replaces the leg press." },
      { id: "wed-row", name: "Single-arm dumbbell row", equipment: "Bench, 1 dumbbell", sets: 3, target: 10, unit: "reps", label: "10 per side", rest: 60,
        start: "4\u20136 kg",
        cue: "One knee and hand on the bench, back flat. Pull the dumbbell towards your hip, elbow close to the body, pause, lower slowly. Replaces the seated cable row." },
      { id: "wed-slbridge", name: "Single-leg glute bridge", equipment: "Mat", sets: 2, target: 10, unit: "reps", label: "10 per leg", rest: 60, weighted: false,
        start: "Bodyweight",
        cue: "One foot planted, the other leg straight or knee hugged in. Drive through the planted heel and keep the hips level. Use both legs if the hips drop." },
      { id: "wed-lateral", name: "Dumbbell lateral raise", equipment: "2 dumbbells", sets: 2, target: 12, unit: "reps", label: "12", rest: 60,
        start: "1\u20132 kg per hand",
        cue: "Slight bend in the elbows, raise the arms out to shoulder height, little fingers slightly up. No swinging." },
      { id: "wed-reversecrunch", name: "Reverse crunch", equipment: "Mat", sets: 2, target: 12, unit: "reps", label: "12", rest: 45, weighted: false,
        start: "Bodyweight",
        cue: "On your back, knees bent at 90\u00b0. Curl the hips up off the mat using the lower abs, then lower slowly. Don't swing the legs." },
      { id: "wed-deadbug", name: "Dead bug", equipment: "Mat", sets: 2, target: 10, unit: "reps", label: "10 per side", rest: 45, weighted: false,
        start: "Bodyweight",
        cue: "Lower back stays flat on the mat. Shorten the range if it lifts." }
    ],
    finisher: "Brisk walk, 20 minutes. A route with a hill or stairs if you can.",
    cooldown: "Hamstring stretch, figure-four glute stretch, child's pose, doorway chest stretch. 20\u201330 s each, no bouncing."
  },
  {
    id: "thu",
    weekday: 4,
    dayLabel: "Thursday",
    title: "Steady cardio",
    summary: "A steady walk, plus a few minutes of glute activation. About 50\u201360 minutes. From week 5, swap in intervals.",
    warmup: [
      ["Easy walking", "5 min", "Gradually build the pace."]
    ],
    exercises: [
      { id: "thu-walk", name: "Steady walk or hill walk", equipment: "Outdoors", sets: 1, target: 40, unit: "min", label: "40 min", rest: 0, weighted: false,
        start: "Conversation pace",
        cue: "Weeks 1\u20134: a steady pace where you could hold a conversation, with hills if possible. From week 5: after a 5-minute warm-up, do 10 rounds of 1 minute fast uphill or up stairs, then 1 minute easy." },
      { id: "thu-clamshell", name: "Side-lying clamshell", equipment: "Mat", sets: 2, target: 15, unit: "reps", label: "15 per side", rest: 30, weighted: false,
        start: "Bodyweight",
        cue: "Knees bent, feet together, open the top knee without rolling the hips back. Light work to keep the glutes switched on before Friday." },
      { id: "thu-glutebridge", name: "Glute bridge", equipment: "Mat", sets: 2, target: 15, unit: "reps", label: "15", rest: 30, weighted: false,
        start: "Bodyweight",
        cue: "Drive through the heels, one-second squeeze at the top. Keep it easy; tomorrow is a strength day." }
    ],
    finisher: "",
    cooldown: "Calf, hamstring and hip flexor stretches, 30 s each side."
  },
  {
    id: "sat",
    weekday: 6,
    dayLabel: "Saturday",
    title: "Long easy day",
    summary: "A long easy walk, hike or cycle. About 60\u201375 minutes. Pick something you enjoy.",
    warmup: [],
    exercises: [
      { id: "sat-long", name: "Long walk, hike or cycle", equipment: "Outdoors", sets: 1, target: 60, unit: "min", label: "60\u201375 min", rest: 0, weighted: false,
        start: "Easy, conversation pace",
        cue: "Low effort, long time. Walk with a friend, explore a trail, or cycle. If you track steps, this day often covers 10,000 on its own." }
    ],
    finisher: "",
    cooldown: "Gentle stretches for calves, hamstrings and hips when you get home."
  },
  {
    id: "sun",
    weekday: 0,
    dayLabel: "Sunday",
    title: "Rest day",
    restDay: true,
    summary: "Rest is when your muscles recover and get stronger. Keep moving gently, nothing hard.",
    warmup: [
      ["Gentle walk", "About 30 min", "Easy pace. Counts towards your steps."],
      ["Hip flexor stretch", "45 s per side", "Half-kneeling, squeeze the glute of the back leg."],
      ["Figure-four glute stretch", "45 s per side", "On your back, ankle over the opposite knee."],
      ["Cat-cow", "10 slow reps", "Loosens the back after the week's lifting."],
      ["Plan the week", "5 min", "Prep some protein-rich meals and check your training days."]
    ],
    exercises: [],
    finisher: "",
    cooldown: ""
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
