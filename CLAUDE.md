# CLAUDE.md

@AGENTS.md

## Notes for Claude

- Project rules, file map and data model are in `AGENTS.md` (imported above). Follow them.
- For any change to exercises, sets, reps, rest, warm-ups or a new workout day, use the `home-workout-plan` skill in `.claude/skills/`.
- After changing `data.js`, tell the user how the change reaches their phone. New days arrive automatically if `DEFAULT_PLAN_VERSION` was increased. Changes to existing days need **Edit plan** or **Restore original plan** (see `AGENTS.md`).
- Keep explanations short and non-technical. When a change is done, say what changed in the app and what to commit.
