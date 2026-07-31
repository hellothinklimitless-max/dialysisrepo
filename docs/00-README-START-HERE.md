# Dialysis Academy — Interactive Learning Platform
## Build Package for Claude Code — Read This File First

This folder contains everything needed to build the platform in one focused session:

- **00-README-START-HERE.md** — this file: audit findings, open decisions, stack, phased plan
- **01-PRODUCT-BRIEF.md** — the full, verbatim UX/product specification (authoritative for behavior, motion, accessibility, states)
- **02-course-content-data.ts** — the real course, module, and quiz content, typed and structured

Read all three before writing code. The product brief and the content data are both source-of-truth; this README is the glue between them.

---

## 1. AUDIT FINDINGS (Section 36 of the brief, already done)

The brief's own Section 36 says "inspect the existing codebase first." That inspection has already happened:

**There is no existing frontend project.** No `package.json`, no Next.js app, no component library, no design system, and no prior implementation exist anywhere in this workspace. This is a **greenfield build**, not an extension of existing code. Skip straight to Section 36, step 6 ("determine what functionality already exists" — answer: none) and proceed to implementation planning.

**Real educational content does exist** — 11 complete video lessons with real YouTube URLs, real transcripts, and real quiz questions with answers and reasoning already written. That content is in `02-course-content-data.ts`. Do not invent placeholder course content — the real thing is provided and must be used as-is per the brief's Section 31.

---

## 2. OPEN DECISIONS — READ BEFORE BUILDING

A few things in the source material are genuinely ambiguous or incomplete. Rather than silently guessing, here is the default each was resolved to, and why. Change any of these if the person running this build tells you otherwise.

### 2a. Course/module hierarchy
The original content list mixes standalone "Courses" and numbered "Lessons" without an explicit hierarchy. This build assumes:

- **Course A — "Dialysis Fundamentals"**: a 10-module course = the Introduction video + Lessons 1–9, in numeric order.
- **Course B — "Advanced Dialysis Techniques"**: standalone, 1 module.
- **Course C — "Dialysis Machines Explained"**: standalone, 1 module.
- **Course D — "Complications in Dialysis"**: standalone, 1 module.

This is a reasonable default, not a certainty — the numbering jumps from "Course 3" to "Course 5" with no "Course 4" ever provided, so nothing was invented to fill that gap. Build the data layer so re-grouping courses/modules later is a data change, not a code change.

### 2b. Two modules have no content yet
- **"Hemodialysis Machines" (Lesson 5)** — no transcript was ever produced for this lesson. It is **excluded** from `02-course-content-data.ts` entirely rather than stubbed with fake content.
- **A duplicate "Hemodialysis Fundamentals" URL** appeared in the original list pointing to a second, different YouTube video. No transcript exists for that second video either. Also excluded.

Build the course-listing UI so a course can legitimately show fewer modules than its nominal count without breaking — this is a good real test of the brief's "Course incomplete" edge state (Section 32), not a bug to work around.

### 2c. One lesson has a video but genuinely no quiz
The "AKI, AKF, CKD" lesson's source transcript never included a quiz section — this is real, not a gap in extraction. Its `quiz` field is `null` in the data file. This is the natural trigger for the brief's "Quiz unavailable" edge state (Section 32) — implement that state for real rather than assuming every module has an assessment.

### 2d. Course 1's quiz was reformatted
Course 1's original quiz was written as open-ended discussion questions with model answers, not the 4-option multiple choice format every other lesson uses. To keep the assessment experience consistent across the whole course, these were converted into 4-option questions using the same "obviously-wrong distractor" pattern already used throughout the other ten quizzes (a plausible decade, a "none/no effect" dummy, etc.). The correct answer and explanation are drawn directly from the original model answers — nothing clinical was invented, only the wrong-answer scaffolding was added. Flagged in the data file with a comment on each affected question; review before shipping if exact wording matters.

### 2e. One question in Course 3 doesn't cleanly fit the format
"What is the backbone of a dialysis machine?" is explicitly framed in the source as a trick question, and its stated answer — "it's really all the components together, but pumps and filters are key" — doesn't match any single one of the four given options (pumps / filtration / blood purifiers / tubing). This is a genuine content defect inherited from the original script, not something introduced here.

It's marked `flaggedForReview: true` in the data with a `flagNote` explaining the mismatch, and typed as `type: 'conceptual-flagged'` rather than `'single-best'`. Recommendation: render flagged questions with the explanation-first framing already written ("it's a bit of a trick...") rather than forcing a strict right/wrong selection UI — the brief's own tone principles (Section 8: never punitive) support this. Don't force a fix by silently picking one option as correct.

### 2f. Video durations are estimates, not fetched facts
`durationLabel` values in the data file are **estimates** derived from where each transcript's timestamps end — useful for layout, not guaranteed accurate to the second. **On build, fetch the real duration for each `videoUrl` via the YouTube oEmbed or Data API and use that as the displayed duration.** Do not present the estimate as fact in the shipped product. Every module has `durationIsEstimate: true` as a reminder.

### 2g. Clinical insight text needs a real clinical review pass
`clinicalInsight` fields were written conservatively, staying inside what each lesson's own transcript already states — nothing was pulled from outside general medical knowledge to fill a gap. That said, per the brief's own Section 31 instruction ("do not fabricate clinical claims"), **these lines should get a pass from an actual clinical reviewer before this ships to real learners.** This is training content for healthcare professionals; that review is not optional.

---

## 3. RECOMMENDED STACK

No existing stack to preserve (see Section 1), so choose deliberately rather than defaulting:

- **Next.js 14+ (App Router), TypeScript** — matches the brief's own Section 35 preference if a framework choice has to be made from scratch.
- **Tailwind CSS** — for the token system in this README/brief to translate directly into config without a translation layer.
- **Framer Motion (`motion`)** — explicitly pre-approved by Section 35 ("if none exists and introducing one is justified, prefer... Framer Motion/Motion"). This product's entire premise (Section 24) depends on well-executed motion — justified.
- **shadcn/ui primitives (optional, minimal)** — not a runtime dependency, just copied accessible primitives (Radio Group, Dialog) for the accessible-radio-group-as-cards requirement (Section 6 + Section 28). Skip it entirely if hand-rolling the accessibility is preferred; don't reach for a heavier component library.
- **Local component state + React Context (or Zustand if state sharing gets unwieldy) for quiz/progress state**, persisted to `localStorage` for the "resume quiz on refresh" requirement (Section 11). No backend exists yet — build the state shape so it could later be swapped for a real persistence layer without a rewrite (Section 30 already asks for this separation).
- **Video: YouTube IFrame Player API**, not a bare `<iframe>`. This is a real technical decision the original brief doesn't make explicitly, so it's made here: the IFrame Player API gives programmatic control over play/pause, seek, volume, playback rate, and fullscreen — enough to build the custom player Section 4 describes. **One real constraint: YouTube's caption styling cannot be fully custom-skinned** — captions can be toggled on/off (if the source video has them) but not restyled to match the app's typography. State this limitation in the UI rather than silently omitting captions or overpromising a fully custom caption track. If fully custom captions become a hard requirement later, that means self-hosting video files with `<track>` VTT — a bigger infrastructure decision, out of scope for this pass.

---

## 4. PHASED BUILD PLAN

37 sections of spec is a lot to hold at once. Build in this order so each phase is independently testable:

1. **Data layer + types** — import `02-course-content-data.ts` as-is, build the Course/Module/Quiz TypeScript interfaces if not already satisfied by the provided file, set up local persistence (Section 11, 30).
2. **Course shell + navigation** — `CourseShell`, `CourseProgress`, `ModuleNavigation`, course overview and module list pages (Section 2, 3, 20).
3. **Video lesson experience** — `VideoLesson` (YouTube IFrame API integration), `LessonHeader`, `VideoCompletion`, lesson→quiz transition (Section 4).
4. **Quiz engine core** — `QuizIntro`, `QuizProgress`, `QuestionCard`, `AnswerOption` as an accessible radio-group-styled-as-cards, Check Answer flow, state management (Section 5, 6, 11, 33).
5. **Micro-learning feedback** — `AnswerFeedback`, `ClinicalInsight`, `KeyTakeaway` panels for both correct and incorrect paths (Section 7, 8, 9, 10). This is the heart of the product philosophy (Section 1) — don't rush it.
6. **Completion + scoring** — `QuizCompletion`, `ScoreRing`, `PerformanceTier`, `PerformanceBreakdown` (Section 12, 13, 14).
7. **Insights + review + retakes** — `PerformanceInsights` (topic-based strong/weak areas, using each question's `topic` field), `AnswerReview`, retake flow with attempt history (Section 17, 18, 19).
8. **Ranking, XP, achievements** — `RankingCard` built to spec but rendering the explicit "no data yet" state (Section 15 — no real cohort data exists), restrained `AchievementCard`/XP system (Section 16).
9. **Ratings + module/course completion** — `RatingCard`, `ModuleRating`, module completion state, `CourseCompletion` (Section 20, 21, 22, 23).
10. **Responsive, accessibility, motion, and edge-state pass** — go through Sections 24, 26, 27, 28, 32 explicitly as a checklist against what's built, not assumed along the way.

---

## 5. VISUAL DIRECTION — CONCRETE DESIGN TOKENS

The brief's own Section 25 asks for "premium modern healthcare" while explicitly rejecting "the stereotypical healthcare design of covering everything in blue gradients." That's a real constraint worth taking seriously rather than defaulting to it anyway. This section makes it concrete so the whole build derives from the same tokens instead of Claude Code choosing per-component.

**Why these choices:** dialysis, as a subject, is fundamentally about *precise measurement and balance* — fluid volumes, flow rates, dosing, timing. The visual signature below is built from that idea rather than generic "clinical blue," and it gives the product one memorable, disciplined signature instead of decoration scattered everywhere (per the frontend-design principle of spending boldness in one place).

### Color — 6 named values
```
--surface:      #FAFAF8   /* base background — warm-neutral off-white, not cream, not clinical white */
--ink:          #14181F   /* primary text — near-black graphite, not pure black */
--primary:      #1D4E4A   /* deep teal-pine — primary actions, links. Desaturated, used deliberately, never as a gradient wash */
--accent:       #C98A3E   /* warm amber-gold — the one warm accent: progress, XP, highlights. Used sparingly */
--success:      #2F8F6B   /* muted clinical green — correct states */
--error:        #C4483A   /* muted brick red — incorrect states, never a harsh alarm red */
--border:       #E7E5E0   /* neutral hairline borders */
--text-muted:   #6B6F76   /* secondary text */
```
No gradients as a default surface treatment anywhere. If a gradient is used at all, it should be a single deliberate moment (e.g. the score ring fill), never a page background or card background.

### Typography — 2 roles, deliberately paired
- **UI / body / display: Inter (variable weight)** — one confident, well-set sans-serif carrying the whole interface. Differentiate hierarchy through weight, size, and tracking, not by switching families.
- **Data / numeric signature face: a monospace (IBM Plex Mono or JetBrains Mono)** — used *exclusively* for numbers: scores, percentages, question counters ("4 of 10"), timers, XP values, durations. This is the product's signature element (per the frontend-design principle: one memorable, deliberate choice, executed with restraint everywhere else). It reads as clinical/measurement precision without resorting to a stethoscope icon or a blue gradient. Do not use the monospace face for prose.

### Layout & shape
- Corner radii: 12px on cards, 8px on buttons/inputs/badges. Deliberately in-between — not sharp broadsheet corners, not full pill shapes.
- Quiz screens: single-column, minimal chrome, sidebar/nav removed or collapsed (Section 26 already asks for this — the tokens just reinforce it).
- Course/module pages: two-column on desktop (main content + contextual sidebar per Section 26), single column on mobile — do not just scale the desktop layout down.

### Signature motif
A **segmented "measurement tick" progress indicator** — rendered as discrete tick marks (like a dosage/volume scale) rather than one smooth gradient-filled bar — used for the course progress bar, quiz progress bar, and the score ring's fill pattern. This is the one place to spend visual boldness; keep every other surface quiet and disciplined around it.

### What to avoid explicitly
- The warm-cream-background + serif-display + terracotta-accent look (a common AI-generated default) — this system uses a cooler neutral and no serif display face, deliberately.
- A near-black background with a single neon accent — this is a light-surface, calm product per the brief's own tone requirements.
- Gradient-heavy "healthcare blue" — explicitly what Section 25 asks to avoid; the palette above has exactly one blue-adjacent color (`--primary`, a desaturated teal-pine) and it's not used as a wash.

---

## 6. WHAT NOT TO DO (reinforcing the brief's own Section 34)

Worth restating given the scale of this build: don't let the size of the spec turn into "generate a generic LMS and hope it's close enough." The two things most likely to go wrong at this scope are (a) reverting to default Tailwind-blue-everything under time pressure, and (b) treating the quiz as a plain form instead of the micro-learning loop that's the entire point of Section 1. If time runs short, protect the correct-answer and incorrect-answer feedback panels (Section 7–9) over any of the gamification layer (Section 16) — the brief itself says XP/achievements should be restrained, and the educational feedback is what it calls the most important requirement (Section 37).
