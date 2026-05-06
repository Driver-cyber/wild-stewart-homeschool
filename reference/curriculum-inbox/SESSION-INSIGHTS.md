# Session Insights — Curriculum Inbox build

> Companion to `HANDOFF.md`. That file documents *what* was built and how to port it.
> This file documents *why* it was built that way, what Joelle was actually after, and how this fits the prep/learn split that governs Wild Stewart Homeschool.
>
> Read this **before** starting implementation work. The technical handoff makes more sense once the strategic intent is clear.

---

## What Joelle was actually trying to build

Underneath the feature list, three distinct teacher-side jobs kept surfacing:

1. **Plan a year of reading & spelling without re-deciding every Sunday.**
   A 32-week structured-phonics scope-and-sequence she can trust — digraphs → blends → silent E → vowel teams → R-controlled → soft & advanced — so weekly prep is *picking from a plan*, not *building from scratch*.

2. **Make the plan fit *this* kid.**
   When Lyle has already mastered "the," she doesn't want him drilling "the" again — but she also doesn't want to manually rewrite every lesson. She wants the curriculum to adapt around what each learner already knows.

3. **See progress at the right altitude.**
   Not analytics dashboards. Just: which lessons are done, which need review, which words are mastered, what's assigned this week. The four-state taxonomy (`todo → progress → review → mastered`) was the smallest vocabulary that captured how she actually thinks.

Everything else — the diagnostics, the calendar, the heart-word spelling instructions — was in service of those three jobs.

---

## What worked (the patterns to carry forward)

- **Two parallel tracks per week (Reading | Spelling).** Single source of truth, but the visual rhythm respects how she actually teaches. This is the layout pattern.
- **Status circles with four states.** Visually distinct enough that she can scan a column and instantly see what's outstanding. Becomes the universal completion vocabulary across the app.
- **Heart-word spelling instruction.** The encoding-first, "tap the sounds, mark the heart part" framing is genuinely Joelle's pedagogy. The teaching-method panel needs to survive porting; it's not just decoration.
- **Sight Words as a separate inventory.** Pulling them out of lessons and into their own surface was the unlock that made personalization possible. Mastery is a property of the *learner*, not of any one lesson.
- **Personalization engine (`personalize.js`).** Deterministic, tier-aware, sentence-rewriting, leaves phonics targets untouched. This is the most novel piece of the whole build.
- **Diagnostics with auto-recommendation.** Six unit assessments that map a score to a status. Cuts the cognitive load of "how is he actually doing on blends?" down to a number.
- **Bulk schedule with a Mon/Wed cadence.** Encodes the weekly rhythm so she's not dragging individual lessons.
- **Adaptation transparency.** "✦ Adapted" badge + swap summary + "Original: …" sentence. She can trust the system *because* she can see what it changed.

---

## How this lands inside Wild Stewart's prep / learn split

The constitution is clear about the boundary: **Joelle's side is editorial, adult, deliberate. Lyle's side is tile-based, joyful, simple.** This build is almost entirely prep-side. Here's the clean integration:

### Prep side (Joelle) — where most of this lives

- **Curriculum Library** (new prep-side surface): the inbox view becomes the home for the seeded 32-week reading & spelling track. Other subjects (math, science, social studies) join as their own tracks over time. The two-column-by-week layout generalizes — just add columns or stacked sections.
- **Per-learner Profile** (extends Module 2 / Module 3): the bucket view *is* the profile detail page. Plug it in once profiles + completions exist in Postgres.
- **Sight Words inventory** (new prep-side surface, sub-section of the learner profile): one screen per learner, drives personalization for that learner only.
- **Calendar planner** (Module 7): the monthly grid + day-modal-picker + bulk schedule UI is a starting point Claude Code can lift directly. Joelle assigns *here*; Lyle just *receives*.
- **Diagnostics** (new prep-side surface): standalone tab. Results write `sight_word_states` + per-skill mastery flags that the curriculum view reads back.

### Learn side (Lyle) — what gets fed forward

The learner never sees this prep UI. What flows through to Lyle's tiles:

- An **assignment** = `(profile_id, lesson_id, scheduled_date)`. Joelle creates these in the calendar; Lyle's dashboard renders them as tiles for today/this week.
- The **lesson content** Lyle taps into is the *adapted* version — sight words personalized, sentence rewritten, phonics target intact. The personalization happens once when the assignment is rendered, then the snapshot lives on the completion row (per the immutability rule in `CLAUDE.md`).
- Lyle's **completion** writes back: lesson id, state, snapshot. Joelle sees that flip the status circle in her curriculum view. Same vocabulary, two faces.
- The **heart-word instruction** is teacher-only — it does not bleed into Lyle's tiles. He just sees the word and the activity.

### The flow, end-to-end

```
Sunday night (Joelle, prep side):
  Profile picker → Lyle
  Sight Words → mark "the", "and", "you" mastered
  → Curriculum auto-adapts (banner shows what changed)
  Calendar → bulk schedule weeks 17–20
  → Reading lessons land on Mondays, Spelling on Wednesdays

Monday morning (Lyle, learn side):
  Profile picker → Lyle's tile dashboard
  Today's tiles include Reading W17 (with personalized sight words)
  Tap → reading lesson (kid view) → done → celebration
  → completion row written, snapshotted

Sunday again (Joelle):
  Curriculum view: W17 Reading status circle now sage with checkmark
  Profile view: lesson moved from "in progress" → "mastered" bucket
  Diagnostic suggests blends are "almost there" — schedule a retest
```

---

## What to watch when porting

1. **Personalization stays a pure function.** `personalizeEntry(entry, masteredSet)` should never touch Supabase directly. The Supabase read produces `masteredSet`; the function transforms; the caller renders. This is the boundary that keeps it testable.
2. **Append-only sight-word state.** A "mastered" event is a fact that happened. Un-marking writes a new event; it doesn't erase the old one. (Constitution rule 2.)
3. **Snapshot lessons into completions.** When Lyle finishes an adapted lesson, the *adapted* sight words and sentence freeze onto the completion row. If Joelle later edits the lesson, his record still shows what he actually did. (Constitution rule 3.)
4. **`profile_id` on every read.** The personalization engine reading an unscoped sight-word query is the most likely place this rule gets violated. Lock it down once, in the data-access layer. (Constitution rule 4.)
5. **Subject color question is still open.** Reading red vs. Writing teal as the curriculum module's accent — Joelle's call. Worth raising in the first session.

---

## Where this could go beyond v1

- **Curriculum library generalizes** to other subjects with the same week-row pattern.
- **Personalization engine expands** beyond sight words: skill prereqs ("Lyle hasn't mastered short-vowel CVC, so soft-c lessons get a warning"), pace adjustments ("he's two weeks behind on spelling — show a 'catch up' option").
- **Diagnostic-driven scheduling**: a "just starting" result on R-controlled vowels could auto-suggest the four lessons that teach it.
- **Note threading**: bucket-level notes on the profile view become a lightweight running record per learner.

---

## The through-line

**Prep is craft, learn is play, and the data model is one shared truth between them.** This build is the prep half of that, designed so the learn half can sit on top of it without retrofitting.
