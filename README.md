# Dialysis Academy

An interactive video learning and assessment platform for dialysis care
professionals. Built against the specification in [`docs/`](./docs):

- [`docs/00-README-START-HERE.md`](./docs/00-README-START-HERE.md) — audit
  findings, resolved content ambiguities, stack, phased build plan, design tokens
- [`docs/01-PRODUCT-BRIEF.md`](./docs/01-PRODUCT-BRIEF.md) — the authoritative
  UX / behaviour / motion / accessibility specification

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build            # production build
npm run typecheck        # tsc --noEmit
npx eslint .             # lint
npm run fetch:durations  # replace estimated video durations with real ones
```

## Stack

| Choice | Why |
| --- | --- |
| Next.js 16 (App Router) + TypeScript | README §3. All pages are prerendered; learner state is entirely client-side. |
| Tailwind CSS v4 | Design tokens live in `@theme` in `src/app/globals.css`, so README §5 translates straight into CSS custom properties. |
| `motion` (Framer Motion) | Installed for Phases 3–9; the product's premise depends on well-executed motion (brief §24). |
| `localStorage` behind an async adapter | No backend exists. `LearnerStateStore` in `src/lib/storage.ts` is swappable for a server-backed store without touching callers. |

## Build progress

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Data layer, types, persistence | Done |
| 2 | Course shell + navigation | Done |
| 3 | Video lesson experience | Not started |
| 4 | Quiz engine core | Not started |
| 5 | Micro-learning feedback | Not started |
| 6 | Completion + scoring | Not started |
| 7 | Insights, review, retakes | Not started |
| 8 | Ranking, XP, achievements | Not started |
| 9 | Ratings + module/course completion | Not started |
| 10 | Responsive / a11y / motion / edge-state pass | Not started |

## Architecture

```
src/
  app/                      routes (server components: params + metadata only)
  components/
    ui/                     Button, Card, Badge, Icon, TickProgress
    course/                 CourseShell, CourseProgress, ModuleNavigation, …
  data/
    course-content.ts       delivered content, unmodified
    course-meta.ts          nominal module counts + documented content gaps
    video-durations.generated.json
  lib/
    content.ts              the only module that reads src/data
    types.ts                learner-state types
    learner-state.ts        pure reducer for the whole quiz lifecycle
    scoring.ts              tiers, grading, XP rules — all thresholds
    storage.ts              persistence adapter
    progress-provider.tsx   React context over the reducer + adapter
    progress-selectors.ts   derived progress projections
```

`src/data/course-content.ts` is the delivered file, unchanged. Anything that
needed to be recorded *about* the content (nominal module counts, why two
lessons are absent) lives in `course-meta.ts` beside it.

## Content decisions carried into the build

These follow `docs/00-README-START-HERE.md` §2 and are implemented rather than
silently resolved:

- **§2b — Missing lessons.** "Dialysis Fundamentals" ships 9 of a nominal 10
  modules. Progress is measured against modules that exist; the shortfall shows
  as hollow ticks on the progress scale, an inline note, and a greyed entry in
  the sidebar at its original position in the sequence.
- **§2c — No quiz for one lesson.** `akiAkfCkd` has `quiz: null`. It renders the
  "Quiz unavailable" state and completes on the video alone, so it can't strand
  a learner on an assessment that doesn't exist.
- **§2d — Course 1's converted quiz.** Those questions carry
  `flaggedForReview: true` in the data and are unchanged here.
- **§2e — The flagged "backbone" question.** `type: 'conceptual-flagged'`
  questions are **ungraded**: excluded from both numerator and denominator of
  the score (`ResponseOutcome` has three values, not two). Phase 4 will render
  them explanation-first rather than as a right/wrong selection.
- **§2f — Durations are estimates.** They render as `~4:45` with an "estimated"
  note for screen readers until real values are fetched. **Note:** YouTube's
  oEmbed endpoint does not return duration — only the Data API v3 does, so
  `npm run fetch:durations` needs `YOUTUBE_API_KEY`.
- **§2g — Clinical review.** `clinicalInsight` text still needs a clinical
  reviewer before this reaches real learners.
- **§15 — No fabricated rankings.** `getRankingData()` returns the unavailable
  state; the shape is ready for real cohort data.

## Design system

Tokens are defined once in `src/app/globals.css` under `@theme`. Six named
colours plus border and muted text; `*-tint` / `*-strong` values are lighter and
darker steps of those same hues, not new ones. Radii are 12px on cards and 8px
on controls. Inter carries the whole interface; IBM Plex Mono is used
**exclusively for numbers** — scores, counters, durations, percentages.

The signature motif is `TickProgress`: progress drawn as discrete measurement
ticks like a dosage scale, used for course progress and (from Phase 4) quiz
progress and the score ring.

## Known constraints

- Video posters load from `i.ytimg.com`; where that host is unreachable the
  player area degrades to a plain surface rather than a broken image.
- YouTube captions can be toggled but not restyled to match the app's
  typography (README §3). Phase 3 states this in the UI rather than
  overpromising custom captions.
