# CLAUDE.md

@AGENTS.md

## Notes for Claude

- Project rules, file map and data model are in `AGENTS.md` (imported above). Follow them.
- For any change to exercises, sets, reps, rest, warm-ups or a new workout day, use the `home-workout-plan` skill in `.claude/skills/`.
- After changing `data.js`, always remind the user how the change reaches their phone: either they add it in **Edit plan**, or they tap **Restore original plan**, which wipes their plan edits.
- Keep explanations short and non-technical. When a change is done, say what changed in the app and what to commit.
