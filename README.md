# Home gym log

A small, phone-friendly app to follow your Monday and Friday workouts, log weight and reps for each set, run rest timers, and see your progress over time. No build step, no server, no account.

## Files

- `index.html` — the page
- `styles.css` — the look
- `app.js` — logging, history, editing, rest timer, backup
- `data.js` — your workout plan (Monday Strength A and Friday Strength C). You can also edit the plan inside the app.

## Put it on Vercel

**Option A: GitHub (no terminal needed)**

1. Create a new GitHub repository and upload these files using "Add file, Upload files".
2. In Vercel, choose Add New, Project, import the repository, and click Deploy. Framework preset: Other.

**Option B: Vercel CLI**

1. Install Node.js if you don't have it.
2. In a terminal, open this folder and run `npx vercel`.
3. Answer the prompts (accept the defaults; there is no build command and the output folder is the project root).
4. Run `npx vercel --prod` to publish. You'll get a link like `home-gym-log.vercel.app`.


On your phone, open the link and use "Add to Home Screen" so it opens like an app.

## How it works

- **Workout**: tap a day, enter kg and reps, tap the plate to mark a set done. A rest timer starts automatically. Finish the session to save it.
- **History**: your top weight per exercise over time, and every session you've saved.
- **Edit plan**: change exercises, sets, reps, rest, cues; add a Wednesday or any other day.

## Your data

Everything is saved in your browser on that device. It is not uploaded anywhere. Clearing browser data erases it, and your phone and laptop won't share it automatically. Use **Edit plan, Export backup** regularly, and **Import backup** to move your log to another device.
