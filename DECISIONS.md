# DECISIONS.md — Wild Stewart Homeschool

> **Note to Claude Code:** This is the project's living log. It holds the current
> vibe, active decisions, recent pivots, and the parking lot of deferred questions.
> Read this at the start of every session. For stable principles and architecture,
> read `CLAUDE.md`.

---

## 🎯 The North Star (Current Goal)

**Goal:** Ship v1 — Joelle plans a week for Lyle on Sunday, Lyle uses it on iPad
through the week, Joelle sees done/not-done in her week view. The full loop.

**Vibe:** Deliberate and foundation-first. We are rebuilding from scratch after a
working prototype, so we have the luxury of getting the architecture right without
the pressure of an impatient first user. Joelle will onboard when the core loop
works — not before. Rolling improvements after that.

**Ship target:** Ongoing, not a specific date. Minimum bar to declare v1 "real" is
Module 10 (Real-World Shakedown) in CLAUDE.md.

---

## 🛠 Active Tech Stack

- **Frontend:** Vite + React + TypeScript
- **Styling:** Tailwind (with two theme contexts — adult/learner)
- **Database:** Supabase Postgres
- **Auth:** Supabase Auth (email + password, single household login)
- **Storage:** Supabase Storage
- **Hosting:** Cloudflare Pages
- **State:** React Context + local component state (no Redux/Zustand)
- **Repo:** `wild-stewart-homeschool` on GitHub (under Chad's account)

---

## 📝 Decision Log

### 2026-05-06 — Joelle's curriculum-inbox handoff and the three-ring expansion

After Joelle ran her own session in Claude and produced a high-fidelity prototype
of teacher-side curriculum tooling (the `reference/curriculum-inbox/` bundle),
Chad and Claude reviewed the handoff and reshaped the v1.x roadmap. This entry
captures the strategic conversation and the resulting weekend build plan.

**Joelle's curriculum-inbox is a *pattern*, not a single feature.** The two-track
week-row planner she designed for Reading & Spelling generalizes: each subject
deserves its own deep prep workshop tuned to how that subject is actually taught.
Reading & Spelling first (because she built them); math, science, social studies,
writing follow as v1.x modules using the same shell with subject-appropriate
content shapes. This recognizes that prep is craft, and the tool's job is to
respect Joelle's pedagogy rather than flatten it.

**Three-ring architecture.** Adopted as the mental model for everything ahead:

- *Ring 1 — Per-subject curriculum modules.* Joelle's deep prep workshops. Same
  week-row spine, subject-specific organs (digraphs/sight-words for reading;
  number-sense/strategies for math; concepts/observations for science).
- *Ring 2 — Prep dashboard (cockpit).* Cross-subject overview. The calendar lives
  here. Pulls completion + benchmark data from every subject module.
- *Ring 3 — Learner view (tiles).* Unchanged in feel. Receives assignments;
  writes completions back. Kid-facing simplicity is load-bearing — Rings 1 and 2
  do not bleed into Ring 3.

**Benchmarks as connective tissue.** New `benchmarks` table:
`(profile_id, subject, skill, score, max, taken_at)`. Append-only. Read by both
the per-subject curriculum modules ("fractions: 3/5 — focus area") and the prep
dashboard. Quiz results, diagnostic results, and Joelle's manual skill marks all
funnel into the same shape. This is what lets a 60% on fractions inform next
week's curriculum customization.

**Personalization engine boundary, confirmed.** `personalizeEntry(entry,
masteredSet)` is a pure function. Supabase access lives in the caller, never the
function. Deterministic by `(week, kind)` so words don't shuffle on revisit.
Tier-aware substitution preferring the original lesson's median tier. Phonics
target words (the lesson's `words` array) are **never** substituted. Sentence
rewriting only touches tokens that match a known sight word. Adapted content
snapshots into the completion row when Lyle finishes — resolving constitution
non-negotiable #3 cleanly. Append-only sight-word state per non-negotiable #2.

**Offline / external lesson type added to scope.** Real-world activities — library
books, piano practice, field trips, "watch this together" — need a way to be in
the day plan and check off when done. Implementation: small extension to
`general` (no in-app interactive content required; "Instructions for Lyle" + a
"✓ Done" button is sufficient), plus an optional `is_offline` flag for filter /
display purposes. This generalizes the app from "lesson player" to **comprehensive
homeschool day planner**. It is the smallest change that makes the command
center actually comprehensive.

**Status taxonomy upgrade: done/not-done → todo / progress / review / mastered.**
Joelle's prototype proved the four-state vocabulary. Replaces the binary today.
Append-only — flipping `mastered` back to `progress` writes a new event, never
mutates history. Same vocabulary on both sides of the prep/learn split (Joelle's
status circles + Lyle's tile state).

**PWA stays. No move to iOS native.** Install-to-home-screen on iPad gives Lyle
a full-screen launch icon. The case for native (gestures, lock-screen presence,
true offline) doesn't justify doubling the codebase for a family-scale tool. To
keep the option open at zero cost: avoid browser-specific APIs that Capacitor /
Tauri can't wrap. Revisit only if a specific platform need surfaces.

**Architecture growth.** Frontend keeps talking directly to Supabase for
everything non-AI. The Cloudflare Workers escape hatch named in CLAUDE.md
becomes real once AI features land — quiz generator, worksheet OCR, scheduled
"week-ahead" emails. Server-side is also where Claude API keys live; never
exposed in the browser bundle. Supabase Edge Functions are an alternative worth
evaluating when the time comes.

**Constitutional creak, named.** The "no Product 2 is planned" line in CLAUDE.md
still holds — this is a tool Joelle uses, not a SaaS we're selling. But the
expanded vision quietly architects for portability at low cost: RLS already
scopes by household, subject taxonomy and curriculum content live in seed-data
tables (not hardcoded), `profile_id` is on every row. Cost: ~5%. Benefit: if
Joelle ever wants to share what she built with another family, the path is open.
We are *not* designing multi-tenant flows, billing, or marketing. Decision is to
preserve optionality, not to chase it.

**Module reshuffle (this entry supersedes the original CLAUDE.md numbering for
status; CLAUDE.md's module legend is now a historical reference).**

| # | Module | Status | Notes |
|---|---|---|---|
| 1 | Skeleton (Vite/TS/Tailwind/Supabase/routing) | ✅ Shipped | 2026-04-23 |
| 2 | Auth + learner profiles | ✅ Shipped | 2026-04-23 |
| 3 | Data model (lessons / assignments / completions / resources) + RLS | ✅ Shipped | 2026-04-23 |
| 4 | `general` lesson type end-to-end (the v1 loop) | ✅ Shipped | 2026-04-23 |
| 5 | Library MVP (PDF / image / docx upload, YouTube embed, links) | ✅ Shipped | 2026-04-23/24 |
| 6 | Quiz builder + galaxy view + spaceship customizer + responsive pass | ✅ Shipped | 2026-04-24 / 2026-05-01 |
| 7 | Status taxonomy expansion (4-state) | 🏗 Weekend | Schema enum + UI. Append-only events. |
| 8 | Offline / external lesson support | 🏗 Weekend | Generalizes day plan to library books & IRL activities. |
| 9 | Curriculum-inbox shell — Reading & Spelling track | 🏗 Weekend | Two-track week-row planner. Joelle's prep surface. |
| 10 | Sight Words inventory + Personalization engine | 🏗 Weekend | Pure function, `profile_id`-scoped read, append-only. |
| 11 | Bulk schedule (Mon→Reading, Wed→Spelling, run length) | 🏗 Weekend | Calendar UX upgrade from Joelle's prototype. |
| 12 | Append-only completion fix (snapshot lesson into completion row) | 🏗 Weekend | Resolves known drift from non-negotiables #2 and #3. |
| 13 | Per-subject curriculum modules (math first, then science / social / writing) | 🔜 v1.x | Same shell, subject-specific content shapes. Math uses `general` until then. |
| 14 | Benchmarks table + Diagnostics view (six unit assessments) | 🔜 v1.x | Score-to-status auto-recommendation. |
| 15 | Prep dashboard (cross-subject cockpit) | 🔜 v1.x | Pulls from every subject module + benchmarks. |
| 16 | Quiz generator (Cloudflare Workers + Claude API) | 🔜 v1.x | First server-side AI feature. Aggressive caching. |
| 17 | Worksheet OCR / photo-to-benchmark | 🔜 v2 | Vision API. Removes data-entry tax. |
| 18 | Real-world shakedown | 🔜 Continuous | Joelle uses it weekly; bugs filed and fixed; v1 is "real." |

**Weekend ship target — Sunday 2026-05-10.** Modules 7–12 land. Joelle uses the
expanded prep surface to plan the week of Mon 2026-05-11 for Lyle. Modules 13–17
are explicitly *not* this weekend — they need data to be useful, and that data
only exists once Joelle has actually used the new modules.

**Subject color reconciliation — open question for Joelle.** Curriculum-inbox
accent options: (a) Reading red on reading rows, Writing teal on spelling rows
(per-track split, more visual structure); (b) single accent — pick Reading red
or Writing teal across the module (cleaner, less chatter). Default to (a) unless
Joelle prefers otherwise.

**Personalization on/off question for Joelle.** Should adaptation happen
automatically when a sight word is marked mastered, or as an explicit "Refresh
curriculum for Lyle" action she triggers? Default to automatic with the
"✦ Adapted" badge + swap summary visible — the prototype's transparency pattern
was designed to make trust earnable. Revisit if it feels noisy in practice.

---

### 2026-05-01 — Galaxy navigation and customizable spaceships

Three feature requests from Joelle's Apr 30 session notes were implemented and
shipped as PR #6 — a substantial expansion of the learner experience beyond
"list of tiles."

**Features shipped:**

- **Completed lessons section** — In the learner week view, completed lessons
  no longer mix with pending ones; they sink into a dimmed "Done this week"
  collection at the bottom (still tappable to revisit). Prep view now always
  shows the profile selector and adds an "X of Y done" summary alongside the
  week label.

- **Galaxy navigation** — Alt view for the learner, toggled by a 🌌 button in
  the week header. Each lesson is a planet placed on one of two elliptical
  orbit rings around a central sun. Subject-keyed color palette. Planets sized
  44px when the lesson has a quiz, 32px otherwise. Completed lessons render
  with `.planet.dim` (45% opacity, desaturated). View choice persists per
  profile in localStorage so the kid lands back in galaxy after finishing a
  lesson. Tap a planet → ship flies to it (400ms) → stage scales 8× over 950ms
  → lesson page loads. Stars streak during the warp; planet glyphs fade.

- **Command Center modal** — Replaces the old chrome buttons in galaxy view
  with a single ⚙ button (and the ship sprite is also clickable when idle).
  Opens a glassmorphism panel anchored top-right with: a Done-this-week list
  (each row tappable to revisit), Switch-to-list-view, Back-to-profiles, and
  Customize-spaceship action. Galaxy chrome is now minimal — HUD title plus
  one button.

- **Customizable spaceship profiles** — New `spaceship_config jsonb` column on
  profiles. Hand-coded SVG renderer with four customizable dimensions:
  hull (round / classic / angular), color (8-preset palette), engine
  (single / twin / plasma), decal (none / star / lightning / heart / flame /
  moon). Customizer page at `/learn/:profileId/customize` with a 170px live
  preview at the top and four option sections — each option button is itself
  a mini-Spaceship rendered with that variant applied to the kid's current
  config. Profile picker now shows the saved ship as the avatar (on a
  space-themed dark gradient plate) instead of the emoji circle, with an
  "✨ Edit ship" pill below the name. Galaxy ship sprite is now `<Spaceship>`
  driven by the same config — replaces the 🚀 emoji placeholder.

**Schema migration (run in Supabase SQL editor):**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS spaceship_config jsonb;
```

**Architectural decisions:**

- **Ship lives outside `.galaxy-stage`.** If the ship were inside the stage,
  the warp transform (`scale(8)`) would also scale the ship. Keeping it in
  `.galaxy-wrap` instead means the ship arrives at the planet's coordinates
  and stays there while the camera zooms past — a natural "ship dropped me
  off, now we're entering the lesson" feel.

- **Mini-ship previews in the customizer.** Each option tile renders a full
  Spaceship with that single dimension changed (rest of config held). Costs
  more SVGs to render but means the kid sees what each choice looks like on
  *their* ship, not a generic template. Worth it for a kid-facing customizer.

- **View preference persisted per profile.** localStorage key
  `learner_view_${profileId}` stores `'list'` or `'galaxy'`. Kid finishes a
  lesson, navigates back, lands in whichever view they were using — no
  re-toggling.

- **Default ship config.** When `spaceship_config` is null (un-customized
  profile), the Spaceship component falls back to `DEFAULT_SHIP` (classic
  hull, sky blue, single engine, star decal) so galaxy view always has a
  ship at center even before the kid customizes.

- **Disabled "Soon" placeholder removed.** Command Center's previously-
  disabled "Customize spaceship" row is now active and routes to the
  customizer. No half-finished UI.

**Cleanup in the same pass:**
- `.env.local.save` (a nano emergency-save artifact) was accidentally
  committed during local setup. Removed and gitignored. The `anon` key it
  contained is publishable by design — Vite inlines it into the browser
  bundle, RLS does the actual access control — so no rotation needed.

---

### 2026-04-28 — Tracker and Galaxy housekeeping

Tracker `updated` field was in a non-ISO format (`"2026-04-23-r2"`), causing the
project-dashboard at garden.chadstewartcpa.com to show "NaN weeks ago". Fixed by
setting `public = true` on the Supabase Storage bucket (same session) and pushing
`"updated": "YYYY-MM-DD"` directly to main.

Enriched the tracker's `shipped` array from flat strings to structured objects with
`date`, `what`, `tags`, and `learned` fields for the dashboard's Galaxy tab. Added
10 missing entries (quiz/editing features + pre-demo fixes + founding constitution),
sorted newest-first by commit date. 19 entries total.

---

### 2026-04-24 — Lesson enrichment pass (quiz, editing, media, links)

Joelle's session notes from Apr 23 captured five feature requests that were
implemented and shipped in one pass, plus two bug fixes surfaced during the session.

**Features shipped:**

- **Quiz builder** — Any lesson can now have up to 5 quiz questions. Two types:
  multiple choice (question + up to 4 options, radio to mark correct) and word
  order (Joelle types the correct sentence; Lyle sees shuffled word chips to tap
  into order). Stored as `quiz_questions jsonb` on the lessons table.

- **Quiz carousel in Lyle's view** — When a lesson has quiz questions and isn't
  yet completed, the "I'm done!" button is replaced by "Ready for the quiz? ✨".
  One question at a time: MC uses big tappable option buttons (green correct /
  red flash wrong, try again); word order uses tap-to-place word chips with a
  "Check! ✓" button once all words are placed. Correct on the last question
  fires confetti and the celebration screen — same reward, now earned.

- **Lesson editing** — Pencil icon on each library card (hover to reveal).
  Populates the form with all current values including existing file names, quiz
  questions, and both links. Saves via UPDATE; replaces storage files when
  swapped, cleans up the old ones.

- **Second link per lesson** — Link 1 + Link 2, both YouTube-embed-aware. Both
  render in Lyle's lesson view (embeds or link cards).

- **Inline reference image** — Separate image upload on the lesson form. Displays
  in Lyle's lesson view between the description and the worksheet — good for maps,
  diagrams, reference charts. Stored as `content_image_path text` on lessons.

- **Expanded file upload types** — Worksheet picker now accepts PDF, images, and
  Word docs (not just PDF). Images uploaded to `pdf_path` render inline in the
  lesson; PDFs and docs show the "Open worksheet" button.

- **Clickable links in instructions** — URLs typed into the "Instructions for
  Lyle" textarea are auto-detected and rendered as tappable links in the lesson
  view.

**Bug fixes:**

- **Supabase Storage `resources` bucket not public** — `getPublicUrl()` was
  generating correct URLs but the bucket had `public = false`, causing every
  file access to return `{"error":"Bucket not found"}`. Fixed with:
  `UPDATE storage.buckets SET public = true WHERE name = 'resources';`
  Schema.sql now documents this requirement explicitly.

- **Schema migration** — Three new columns added via SQL:
  `resource_url_2 text`, `content_image_path text`, `quiz_questions jsonb`.

**Design decisions:**

- Word order uses **tap-to-select chips** rather than HTML drag-and-drop. Native
  drag events on iPad touch are unreliable without a library; tap-to-place gives
  the same mental model with reliable touch behavior.

- Quiz is **required for completion** when present — "I'm done!" only appears on
  lessons without a quiz. If Joelle needs to remove a quiz after the fact, she
  can edit the lesson and toggle it off.

- Word order shuffling is pre-computed at quiz start and stored in a ref, so
  words don't re-shuffle on re-render mid-question.

---

### 2026-04-23 — Mobile and iPad responsiveness pass

Pre-demo audit of all screens against iPhone, iPad portrait, and Mac browser.
Issues found and fixed in one pass; no architectural changes, layout fixes only.

**Welcome slides (`/welcome`):**
- SlideWeek's 5-column mini calendar was ~60px per column on iPhone —
  unreadable (confirmed in screenshot). Fixed with `overflow-x-auto` wrapper
  and `min-width: 340px` so the grid scrolls horizontally rather than crushing.
  Sample tile titles shortened and tile text drops to `text-[10px]` on mobile
  with `line-clamp-2`.
- SlideVision and SlideStatus had `grid-cols-2` that squished two tiny columns
  on phones — changed to `grid-cols-1 sm:grid-cols-2`.
- No touch-swipe navigation existed (keyboard-only). Added `onTouchStart` /
  `onTouchEnd` handlers with a 50px drag threshold. Swipe now works on iPhone
  and iPad without any library.
- Tall slide content could clip on landscape phones — `overflow-y-auto` added
  to the slide area so content scrolls rather than disappearing.

**Joelle's app:**
- AppShell nav: 5 items at `gap-6` overflows on iPhone. Logo gets
  `flex-shrink-0 whitespace-nowrap`; links container gets `overflow-x-auto` —
  all items always reachable by scrolling horizontally.
- WeekPage 5-column calendar: ~66px/col on iPhone. `overflow-x-auto` wrapper
  with `min-w-[560px]` on the grid — identical on Mac/iPad, scrollable on phone.
- WeekPage header: `flex-col sm:flex-row` so controls stack below the title on
  narrow screens instead of fighting for horizontal space.
- LibraryPage form: `grid-cols-1 sm:grid-cols-2` so subject/URL fields stack on
  phones.

**Unchanged (already mobile-first):** Login, ProfilePicker, Lyle's WeekView,
LessonPage — single-column layouts with correct touch tap targets.

**Breakpoint decision:** Tailwind `sm:` (640px) as the threshold for all
two-column layout switches. Horizontal scroll (not layout collapse) for the
5-column calendar and welcome grid — both are intentionally 5-wide and scroll
preserves that semantics rather than hiding days.

---

### 2026-04-23 — Demo-week build-out (Modules 1–4 + slices of 7, 8, 9 shipped)

After the founding session, a long working session took the project from empty
repo to Joelle-ready demo. End state:

- **Modules 1–4 complete.** Full scaffolding, Supabase schema + RLS, auth,
  learner profiles, and the `general` lesson type end-to-end. Joelle can log
  in, build a library, plan a week, and Lyle can open his iPad, do a lesson,
  hit "I'm done," and see confetti. The full loop exists.
- **Module 7 (calendar planning) partially done.** The week view works with
  Mon–Fri grid, per-day assignment, profile selector, and a lesson picker
  modal. No drag-and-drop yet; that's v1.1.
- **Module 8 (library) MVP done and then some.** Upload PDFs to Supabase
  Storage, paste URLs, attach to lessons. YouTube URLs auto-embed in Lyle's
  lesson view. This jumped ahead of its numbered slot because lesson content
  was too thin without it — a 6-year-old can't read notes off a screen
  independently.
- **Module 9 (progress visibility) minimal done.** Week view shows ✓ Done
  per assignment. Holding the line on anything beyond that.

**Decisions made during this session:**

- **PDF upload over custom worksheet builder.** Joelle designs worksheets in
  Canva / Google Slides / anywhere she already knows, exports PDF, uploads in
  ~10 seconds. Lyle sees a big "Open my worksheet" button. This is the "oh
  wow" demo moment without the cost of building a visual editor.
- **YouTube auto-embed, not a generic video player.** Paste a YouTube URL →
  iframe plays inline. Any other URL renders as a link card. This is a single
  platform bet made on the assumption that YouTube is where the educational
  content Joelle will use actually lives.
- **Supabase Storage public-read policy for `resources` bucket.** Anyone with
  the URL can read; only Joelle can upload/delete. This is the simplest way
  to make `getPublicUrl()` work for the PDF open button without auth plumbing.
- **Welcome/guide walkthrough at `/welcome`.** Five-slide dark walnut deck
  Joelle can step through to see the vision, the library flow, the planning
  rhythm, Lyle's experience, and what's ready vs. coming next. Route is
  public (no auth required) so it doubles as a hand-off surface.
- **Confetti celebration, no star/coin tracking yet.** Deliberately deferred —
  we want to watch whether Lyle cares about accumulation vs. the immediate
  feel of completion. Confetti handles immediate gratification.

**Bug fixes before hand-off (same session):**

- ProtectedRoute's kid-friendly lock screen was rendering `<Navigate>`
  inline, so Lyle never actually saw the "Time to check in" message —
  replaced with a Sign in button.
- Double-tap guard on "I'm done!" so fast taps can't insert duplicate
  completion rows.
- `window.confirm` on profile and lesson deletes.
- Lesson picker filters out lessons already assigned to that day, so the
  same lesson can't be scheduled twice on one date.
- `schema.sql` backfilled with the `pdf_path` column added via migration.

**Known drift from CLAUDE.md non-negotiables (acknowledged, not yet fixed):**

- **Completions cascade-delete with assignments.** Non-negotiable #2 says
  completions are append-only — a completion is a fact that happened. Today,
  if Joelle unassigns a lesson, the FK `ON DELETE CASCADE` wipes any
  completion that referenced it. In practice this won't hit during demo week
  (Joelle won't unassign a lesson Lyle already did), but a proper fix needs
  either soft-delete on assignments or snapshotting lesson state into the
  completion row. Parked for post-demo.

### 2026-04-23 — Founding session

*Captured from the planning conversation that produced these docs. Decisions are
listed with the reasoning behind them so future sessions understand the why, not
just the what.*

**Architecture & foundation:**

- **Fresh rebuild, not an extension.** The existing Wild Stewart Homeschool app
  (vanilla React + Babel-in-browser + localStorage) is reference code only.
  Patterns that worked carry forward; the codebase does not. Rationale: the
  existing app is a prototype architecture, not a product architecture, and
  extending it would inherit constraints that don't serve the real scope.

- **Supabase + Cloudflare chosen over Firebase.** Chad's explicit preference for
  Supabase's simplicity of maintenance and Cloudflare's infrastructure. The data
  model is genuinely relational (lessons ↔ resources ↔ assignments ↔ completions ↔
  profiles), so Postgres is a better fit than Firestore's document model.

- **Auth from day one, not "added later."** The no-login default was reconsidered
  and reversed: retrofitting auth into a Supabase app is a weekend of work vs. 10
  minutes now. Single household login (Joelle's email + password) chosen over
  magic links to match the "simple for our family" feel Chad was after.

- **Two accounts → one user + multiple learner profiles.** Initial answer was
  "two accounts." Reasoning follow-up revealed that the intent was "each person
  has their own data view," which is better served by learner profiles under a
  single authenticated user than by separate user accounts. Joelle logs in; kids
  are profiles she manages. Netflix-style profile picker on iPad.

- **Multi-kid supported in data model from day one.** A sibling is likely joining
  in the next 1–2 years. Schema carries `profile_id` on every assignment and
  completion row from the start. Retrofitting this later would mean a painful
  migration. Lyle is the only learner at v1 launch.

- **TypeScript, not plain JavaScript.** Data-heavy app with structured lesson
  content; TypeScript catches the class of bug that most often breaks this kind
  of product (missing required fields on lesson content silently failing).

- **Tailwind for styling.** Utility-first speed for the large UI surface area
  ahead (planning calendar, library, lesson editor, learner views). Custom theme
  tokens will handle the two-aesthetic requirement.

**Product scope:**

- **One integrated product, two surfaces.** Not two separate apps. Joelle's
  planning side and the learner-facing side live in the same codebase and talk
  to the same database.

- **Dual-mode planning UX (calendar + board), calendar first.** Both views
  render the same underlying assignment data. Build order: calendar view in v1,
  board view in v1.1. Rationale: two views of broken data is worse than one view
  of working data.

- **Sunday-night-planner rhythm drives the design.** Joelle's workflow is batch
  planning once a week, not daily glances. The week-view calendar is optimized
  for focused 30-minute sessions, not quick lookups.

- **V1 = full loop with thin surface area.** Joelle creates a lesson, schedules
  it, Lyle does it, progress tracks. Minimum viable. Everything else is v1.x
  or v2.

- **V1 lesson types: `general` + `reading` + `spelling`.** Three types cover:
  all-text, structured-interactive, and interactive-with-completion-state.
  Math uses the `general` type in v1 (acknowledged roughness). Other types
  (`math_place_value`, `math_stacked`, `interactive`) return in v1.x as
  vertical slices.

- **Library is MVP-only in v1.** Upload a PDF or URL, attach to a lesson,
  basic list view. Phased approach: tags/search/previews/organization in v1.x
  after Joelle has used the MVP and told us what she actually needs. Resources
  in scope include PDFs, web links, and Joelle's own written lesson plans.

- **Progress visibility is minimal in v1.** Done/not-done per scheduled lesson
  in Joelle's week view. Literally that. Progress dashboards expand without
  limit if allowed; we hold the line.

- **Kid-facing side inherits the prototype's DNA.** Refined, not replaced. Nunito
  rounded typography, tightened pastels, celebration energy, the 5-subject
  color system. The prototype's kid-facing feel works for a 7-year-old.

- **Joelle's side is warm/editorial/craftsman-y.** Reference points: Frank
  Chimero, good indie bookstores, editorial magazines. Fraunces serif +
  supporting sans. Muted saturated palette. Not Swiss minimalism. Not corporate
  SaaS.

- **Project name stays "Wild Stewart Homeschool."** Keeps the family identity
  and the brand continuity with the prototype.

**Governance:**

- **Three founding artifacts:** `CLAUDE.md` (constitution), `DECISIONS.md` (this
  file), `wild-stewart-tracker.html` (visual priority board). Tracker follows
  the schema from Chad's New Project Constitution Snippet.

- **Red team cadence:** every 2–3 completed modules, at phase transitions, and
  at the start of any session after a 2+ week gap.

- **Session startup protocol:** Read DECISIONS.md → read tracker → confirm
  current task before starting work.

---

## 🅿️ The Parking Lot (Deferred Decisions)

These are things we deliberately did not decide today. Each has a named condition
for when it becomes ready to decide.

### Joelle's writing surface (markdown vs. block editor vs. rich text)
**Decide when:** Joelle has weighed in on her working style for writing lesson
content.
**Why deferred:** The right answer depends on whether she thinks in plain text,
structured blocks, or formatted prose. Guessing wrong here would cost real time.

### Calendar week-only vs. week + month toggle
**Decide when:** Joelle has used v1 for at least 4 weeks and told us whether the
week view alone is sufficient for her planning.
**Why deferred:** Adding a month view now is building to a guess. Adding one later
based on observed need is building to a signal.

### Joelle's exact color palette
**Decide when:** Module 7 (Calendar Planning View) is in active design.
**Why deferred:** We know the *direction* (warm/editorial, muted and saturated),
but picking specific swatches before the first real interface is ready is
premature. Chad's branding swatch engine project is a natural tool for this.

### Logo and favicon
**Decide when:** Before v1 ships — ideally between Module 7 and Module 10.
**Why deferred:** The existing prototype doesn't have a logo we love. Worth
creating one with intent rather than throwing something in early.

### "All learners at once" cross-kid view on Joelle's side
**Decide when:** A second learner is about to join the household.
**Why deferred:** Real question but not a real need yet.

### Subject list modifications (adding subjects beyond the current 5)
**Decide when:** Joelle explicitly requests it.
**Why deferred:** The current 5 (Reading, Writing, Math, Science, Social Studies)
were validated by the prototype. No reason to open the taxonomy until there is
pressure to.

### Printing flows beyond basic resource download
**Decide when:** Joelle identifies a specific printing workflow she needs.
**Why deferred:** Her Sunday-night rhythm doesn't center on daily printing, and
guessing at the printing experience she wants is lower-value than listening to
her describe it.

### Whether to expose Joelle's lesson catalog to any outside audience
**Decide when:** Never, unless Chad and Joelle deliberately decide to broaden
scope. Not v1. Not v2. This is here as an explicit non-question.

---

## 💡 Notes & Observations

*Things worth remembering that aren't decisions, but would be lost without being
written down.*

- The existing prototype's kid-facing UX is genuinely good for Lyle. The
  5-subject tile grid, the subject color system, the completion celebration —
  these work. The rebuild improves the chrome, not the core experience.

- Chad's consulting motto is "ordo ab chao." The product is an applied instance of
  that philosophy. This matters for how the product is described in any
  user-facing copy.

- The v0 prototype's admin panel (localStorage + CSV upload) is v0 of what
  Joelle needs. Its roadmap comments name real pain points: no direct editing,
  no month view, no cloud sync. Those are the exact gaps this rebuild fills.

- Chad has a branding swatch engine project that generates visual branding
  artifacts. It will likely be used to generate Joelle-side palette swatches
  when that decision activates.

---

## 🏗 Build Tracker

`wild-stewart-tracker.html` is the visual priority board and machine-readable
record. It was created as part of the founding session and lives alongside these
docs. Update it at the end of any session that completes or changes priorities,
and bump the `updated` field in both the visual header and the JSON data block.
