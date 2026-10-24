# CLAUDE.md

@AGENTS.md

## Notes for Claude

- Project rules, file map and data model are in `AGENTS.md` (imported above). Follow them.
- For any change to exercises, sets, reps, rest, warm-ups or a new workout day, use the `home-workout-plan` skill in `.claude/skills/`.
- `lib/defaultPlan.ts` is only the example plan for new accounts. After changing it, tell the user it doesn't change anyone's existing plan; to change their own, they use **Edit plan** (see `AGENTS.md`).
- The system Node may be old. Run `source ~/.nvm/nvm.sh && nvm use 22` before `npm` commands. The project `.npmrc` uses the public npm registry.
- Keep explanations short and non-technical. When a change is done, say what changed in the app and what to commit.
