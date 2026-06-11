# Claude Instructions — Acme Bank QR Portal

## PRD Update Protocol

After every conversation that includes a discussion, decision, or new requirement:

1. **Propose** what you intend to add/change in `docs/PRD.md` — summarize it clearly.
2. **Wait for Sujeet's confirmation** before writing anything.
3. **Then update** the PRD in one shot — do not make partial updates.

Never update the PRD silently. Always ask first.

## PRD Location

`docs/PRD.md` — this is the single source of truth for all product decisions, discussions, open questions, and the feature backlog.

## What to Update in the PRD After Each Session

- **Discussion Log (Section 5):** Add a new `[DISC-XXX]` entry for each new topic discussed. Include:
  - Every question asked by Claude, with the user's answer
  - Unanswered questions marked clearly for carry-forward
  - The final decision or summary
- **Open Questions (Section 8):** Add any unresolved questions with a unique OQ-XXX ID. Remove or resolve them once answered.
- **Decision Log (Section 7):** Add a row for each finalized decision.
- **Backlog (Section 6):** Add new feature items; update status of existing ones.
- **User Roles / Status Workflow (Sections 2–3):** Update if roles or statuses are changed.
- **Features Built (Section 4):** Update when new features are implemented.

## General Behavior

- This project is for Acme Bank — a regulated banking context. Be conservative with data handling suggestions.
- All admin users have L1 or L2 roles — never treat admins as a single homogeneous group.
- Branch officers are read-only after submission — never suggest edit flows for branch post-submission.
- The app is currently frontend-only (localStorage). Assume no backend until told otherwise.
- Before implementing anything non-trivial, confirm the approach with Sujeet.
- Do not introduce new libraries without asking first.
- Default to no comments in code unless the WHY is non-obvious.

## Key Open Questions (as of 2026-04-24)

See `docs/PRD.md` Section 8 for the full list. Always check this before building a feature — if an open question blocks it, raise it before coding.
