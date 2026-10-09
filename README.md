# Home gym log

A small, phone-friendly app to follow your weekly training plan (three strength days, three walking and cardio days, and a rest day), log weight and reps for each set, run rest timers, and see your progress over time. No server, no account. Your data stays on your device.

Built with Next.js as a static site, with a small local database (IndexedDB, through [Dexie](https://dexie.org)) in your browser.

## Where things are

- `app/` — the pages: Workout (`page.tsx`), `history/`, `plan/`, plus `globals.css` (the look)
- `components/` — the pieces each page is built from
- `lib/defaultPlan.ts` — your weekly plan, Monday to Sunday. You can also edit the plan inside the app.
- `lib/db.ts` — the local database
- `public/images/` — exercise photos

## Run it on your computer

1. Install Node.js 20 or later (with nvm: `nvm use 22`).
2. In a terminal, open this folder and run `npm install`, then `npm run dev`.
3. Open http://localhost:3000. Changes show up as you save files.

`npm run build` makes the finished site in `out/`. `npm start` serves it.

## Run it with Docker

1. Install Docker Desktop.
2. Run `docker compose up -d --build`.
3. Open http://localhost:8080. Run `docker compose down` to stop it.

## Put it on Vercel

Push to the `main` branch on GitHub. Vercel builds and publishes it in about a minute (`vercel.json` tells it this is a Next.js project).

On your phone, open the link and use "Add to Home Screen" so it opens like an app.

## How it works

- **Workout**: today's day opens automatically (underlined in the day bar). Enter kg and reps, or minutes for walks, and tap the plate to mark a set done. A rest timer starts automatically. Finish the session to save it. Sunday is a rest day with gentle suggestions and nothing to log.
- **History**: your top weight per exercise over time, and every session you've saved.
- **Edit plan**: change exercises, sets, reps, minutes, rest and cues; add or remove days; mark a day as a rest day.

## Your data

Everything is saved in your browser on that device. It is not uploaded anywhere. Clearing browser data erases it, and your phone and laptop won't share it automatically. Use **Edit plan, Export backup** regularly, and **Import backup** to move your log to another device.

If you used the earlier version of the app on the same link, your plan and history move over automatically the first time you open this version.
