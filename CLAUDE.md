# CLAUDE.md — Wild Stewart Homeschool

> This is the project constitution. Read this first, every session. It contains the
> principles, architecture, and non-negotiables that govern the work. For current
> phase status, decisions made, and running context, read `DECISIONS.md`.
>
> **Measure twice, cut once.** Propose a plan before writing code. Wait for explicit
> approval (a 'y', 'go', or equivalent) before multi-file edits or architectural moves.

---

## 🌟 The North Star

Wild Stewart Homeschool is the Stewart family's homeschool operating system. It serves
two very different people with one shared database:

- **Joelle**, the teacher, who plans curriculum on Sunday nights and writes her own
  lesson content. Her interface is adult and editorial — a tool she sits down with on
  purpose.
- **Lyle** (and eventually his siblings), the learners, who open an iPad and see their
  week of lessons as a set of colorful tiles. Their interface is kid-joyful, warm, and
  celebratory.

The deeper mission: **give Joelle a homeschool command center that makes the prep
feel like craft, not drudgery — and give Lyle a learning experience that feels like
play, not school.** The app exists so Joelle can invest her planning energy in
*teaching well*, not in wrestling with tools.

This is not a generic homeschool SaaS product. It is a family-scale tool built for
one family's specific way of working.

---

## 🏛 Ecosystem Context

This project replaces the "Wild Stewart Homeschool" prototype app (vanilla React +
localStorage, single-device, kid-facing only) that exists as reference code. The
prototype validated the 5-subject module grid, the lesson type taxonomy, and the
celebration flow — those patterns carry forward. Everything else gets rebuilt.

**No Product 2 is planned.** This is not a product that becomes a business. It is a
tool Joelle uses. If it later becomes something other families might use, that is a
completely separate decision made from a position of strength, not a plan baked in
from day one.

---

## 🛠 Tech Stack (with rationale)

| Layer | Choice | Why |
|---|---|---|
| Hosting | **Cloudflare Pages** | House stack across Chad's projects. Git-push deploys. CDN included. |
| Build tool | **Vite** | Fast, minimal config. No Webpack ceremony. |
| Frontend framework | **React + TypeScript** | Patterns transfer from prototype. TypeScript catches the class of bug that hurts most in data-heavy apps — missing required fields on lesson content silently breaking the UI. |
| Styling | **Tailwind** | Utility-first iteration speed. Custom theme tokens let us run two visual worlds (adult / learner) from one codebase. |
| Database | **Supabase Postgres** | Real relational SQL. The data model (lessons ↔ resources ↔ assignments ↔ completions ↔ learner profiles) is genuinely relational; Postgres handles it cleanly. |
| Auth | **Supabase Auth** (email + password) | One household login for Joelle. Ships with the platform. |
| File storage | **Supabase Storage** | For PDFs, uploaded handouts, images. |
| State | **React Context + local component state** | Don't reach for Redux/Zustand unless a specific need appears. |
| Deployment | **Git push → Cloudflare auto-deploy** | Standard pattern. |

**Architectural consequence worth naming:** there is no separate backend server and
no serverless functions in v1. The React app talks directly to Supabase. If we ever
need server-side logic beyond what Supabase provides (scheduled jobs, email sending,
etc.), Cloudflare Workers is the pre-approved escape hatch.

---

## 👥 Users & Profiles

The app has exactly **one authenticated user**: Joelle. Her email + password is the
household credential. The iPad stays logged in essentially forever after first setup.

**Kids are learner profiles, not users.** Joelle creates and manages them. Each
profile has a name, an avatar/color, and its own set of lesson assignments and
completions. When the iPad loads, it shows a Netflix-style profile picker: "Who's
here?" → tap a name → their dashboard loads.

**Multi-kid is baked into the data model from day one**, even though Lyle is the only
learner at v1 launch. Every assignment and completion row carries a `profile_id`.
When the sibling joins, Joelle adds a profile and the existing UI just works — no
migration, no retrofit.

**Permissions, simplified:**
- Joelle sees everything across all profiles.
- Each profile view (on iPad) sees only its own assignments and completions.
- The library, the lesson catalog, and the curriculum itself are shared across all
  profiles in the household.

---

## 🧩 Modules

Module status legend: 🔜 not started · 🏗 in progress · ✅ complete

### 🔜 Module 1 — The Skeleton
Project scaffolding: Vite + React + TypeScript + Tailwind, Supabase client wired up,
Cloudflare Pages deploy, basic routing shell (Joelle's view, learner view). No real
features yet — just a running frontend that connects to the database and knows which
mode it's in.

### 🔜 Module 2 — Auth & Profiles
Joelle signs in with email + password. Creates at least one learner profile (Lyle).
iPad shows profile picker; tapping a profile routes to the learner view. Logout
exists but is not prominent.

### 🔜 Module 3 — Data Model & Lesson Catalog
Postgres schema for: `profiles`, `lessons`, `assignments`, `completions`, `resources`,
`resource_lesson_links`. RLS policies locked down (all rows owned by Joelle's
user_id). Seed data includes the 5-subject taxonomy. Joelle can view the lesson
catalog on her side (read-only in this module).

### 🔜 Module 4 — The `general` Lesson Type, End to End
The thinnest possible vertical slice. Joelle can create a general lesson (text intro,
key points, optional discussion). She can schedule it to a week for Lyle. Lyle opens
his iPad, sees it in the week view, taps it, reads through it, taps "done," and gets
a celebration. Joelle's week view shows the lesson as done. **This module is the
definition of v1 — everything after it is thickening the slice.**

### 🔜 Module 5 — The `reading` Lesson Type
Adds the digraph → words → sentences flow. Same scheduling loop, richer lesson
content. Proves the data model handles structured interactive content.

### 🔜 Module 6 — The `spelling` Lesson Type
Adds the word jumble interaction. Proves the data model handles interactive
completion state with in-lesson correctness checking.

### 🔜 Module 7 — The Calendar Planning View
Replaces the basic scheduling UI with a proper week-view calendar for Joelle. Drag
lessons from a sidebar library onto days. Per-learner filtering. This is the
Sunday-night-planner's home base.

### 🔜 Module 8 — The Resource Library (MVP)
Joelle can upload a PDF or paste a URL, give it a name, and attach it to a lesson.
Lessons render links to their attached resources. No tags, no search, no previews —
just the minimum that makes the library real.

### 🔜 Module 9 — Progress Visibility (Minimal)
Joelle's week view shows a done/not-done indicator per scheduled lesson. **Literally
that. Nothing more.** Progress views expand without limit if allowed; v1 holds the
line.

### 🔜 Module 10 — Real-World Shakedown
Joelle plans a real week. Lyle uses it. Chad watches the seams. Bugs get fixed, rough
edges filed. This module is not "features" — it's "the thing actually works under
real conditions."

**After Module 10, v1 is done.** Everything beyond is v1.x and v2 (see
Out-of-Scope below).

---

## 🚫 Out of Scope for v1

Named deliberately, with dates, so they stop getting re-litigated.

| Item | Date scoped out | Reason |
|---|---|---|
| Board view of planning calendar | 2026-04-23 | Dual-mode is the direction; calendar ships first. Board is v1.1. |
| Month-view calendar | 2026-04-23 | Week-view first. Add month only if Joelle asks for it. |
| Library tags, search, previews | 2026-04-23 | Phased library. Joelle will tell us what she needs after using the MVP. |
| `math_place_value`, `math_stacked`, `interactive` lesson types | 2026-04-23 | Math uses `general` temporarily. Other types return in v1.x as vertical slices. |
| Custom lesson type authoring (Joelle designs new interactive types) | 2026-04-23 | Genuinely large scope. v2 at earliest. |
| Visual handout/worksheet creator | 2026-04-23 | Same — v2 at earliest. Joelle can upload handouts she designs in other tools. |
| Cross-kid comparison or reporting views | 2026-04-23 | Multi-kid is in the schema; UI for comparing them is not. |
| Printing flows beyond basic resource download | 2026-04-23 | Sunday-night planning rhythm doesn't center on daily printing. |
| Rich writing surface for Joelle (markdown vs. block vs. rich text) | 2026-04-23 | Deferred pending Joelle's input on her working style. |
| Separate login for each learner | 2026-04-23 | Kids are profiles, not users. Revisit only if this model breaks down. |
| Offline mode | 2026-04-23 | Web-based, requires network. Not worth the architectural cost. |

---

## 🛡 Domain Accuracy Non-Negotiables

The places where "good enough" engineering produces wrong answers. These rules must
never be bent.

1. **RLS policies are the access control layer — not application code.** Every table
   has row-level security tied to Joelle's user_id. App code that queries data
   without RLS protecting it is a bug, not a shortcut.

2. **Learner progress is append-only in v1.** A completion is a fact that happened.
   Joelle can un-mark a lesson done if needed, but the action creates a new event,
   not a mutation of history. This matters later for reporting and for protecting
   against accidental data loss.

3. **Curriculum content is versioned or immutable after first use.** If Joelle edits
   a lesson Lyle has already completed, the completion record still refers to what
   Lyle actually did, not to the edited version. Implementation: either version
   lessons or snapshot lesson content into the completion row.

4. **Learner profiles are first-class.** Any query that returns assignments or
   completions without a `profile_id` filter is a bug.

5. **File uploads are always to Supabase Storage, never inline base64 in the
   database.** Base64 blobs in Postgres is an anti-pattern.

6. **No kid-facing UI ever shows data belonging to another profile.** Not even for a
   flash during navigation. This is the strongest permission boundary in the app.

7. **The 5-subject color taxonomy is stable.** Reading is red. Writing is teal. Math
   is amber. Science is green. Social Studies is purple. These colors are load-bearing
   for Lyle's mental model; they do not change without a deliberate decision.

---

## 🎨 Design Language — Two Aesthetics, Shared Taxonomy

This app runs two design worlds from one codebase. Tailwind theme contexts resolve
the same utility classes differently depending on which side is rendering.

### Joelle's side: warm, editorial, craftsman-y

The reference points: Frank Chimero's writing layouts, a good indie bookstore, a
well-set editorial magazine. **Not** Linear/Notion minimalism. **Not** corporate
SaaS. A tool that feels thought-through.

- **Typography:** Fraunces (serif, display + headers) + a quiet sans for UI chrome
  (Plus Jakarta Sans or similar). Lowercase display type where it reads well.
- **Palette:** Muted and saturated. Terracotta, ochre, deep forest, ink, parchment.
  Not beige. Not grey. Warm and confident.
- **Layout:** Editorial rhythm. Asymmetric where it earns its place. Generous
  whitespace used for hierarchy, not emptiness.
- **Motion:** Restrained. Fades, gentle reveals. No bounce, no pop.
- **Voice:** First-person, direct, warm. The app talks to Joelle like a colleague.

### Lyle's side: refined kid-joyful

The reference point: the existing prototype's feel, tightened. The Nunito-rounded-
friendly-pastels world works for a 7-year-old; we keep what works and clean up what
feels muddy.

- **Typography:** Nunito (rounded, warm, the existing choice).
- **Palette:** Clearer, more harmonious pastels than the prototype. Subject colors
  stay (Reading=red, Writing=teal, Math=amber, Science=green, Social=purple). The
  background is soft and warm, not white.
- **Layout:** Tile-based. Big tap targets. Lots of air between elements.
- **Motion:** Playful. Celebration energy on completion (the existing confetti is
  good — keep it). Buttons can have a bit of life.
- **Voice:** Addresses Lyle by name. Celebratory. Warm.

### What the two sides share

- The 5-subject color taxonomy (more muted on Joelle's side, clearer on Lyle's)
- Logo, name, favicon
- Tailwind theme primitives: spacing scale, border radius philosophy, shadow tokens
- The underlying data model and database

### What they do not share

- Typography stacks
- Density (Joelle's is airy and text-forward; Lyle's is tile-based and tactile)
- Motion language
- Navigation chrome (Joelle has sidebars and nested views; Lyle has the 5-tile grid
  and back buttons only)

---

## 🧭 Principles That Govern the Work

1. **Measure twice, cut once.** Propose plans before implementing. Wait for approval
   on multi-file changes. Friction at the planning stage is cheaper than rework at
   the execution stage.

2. **Ordo ab chao.** The product's job is to bring order to the chaos of homeschool
   planning. But perfect is the enemy of good — we accept that not everything can be
   organized, and ship what reduces chaos rather than waiting until we've solved it.

3. **Focused elegance in design, uncompromising utility.** The app must work first.
   Beauty is the second job, not an afterthought — but it is the second job.

4. **Vertical slices over horizontal layers.** We build the full loop for one lesson
   type before building features on top of it. A half-built feature on a fully-built
   loop is better than a fully-built feature with no loop around it.

5. **Token thrift.** Don't read files that haven't been named. Don't run grep over
   the whole tree when the user knows where the relevant code is. Ask for specific
   file paths when unsure.

6. **The existing prototype is reference, not foundation.** Patterns that worked
   (subject taxonomy, lesson type shapes, celebration flow) carry forward. Code does
   not.

7. **Joelle is the product's primary user.** When there is a tension between making
   Joelle's life easier and making the implementation cleaner, Joelle's life wins by
   default.

8. **Every in-scope decision is a budget item.** Adding something to v1 means either
   cutting something else or pushing the ship target. Scope creep compounds;
   discipline here saves months later.

---

## 📋 Session Startup Protocol

At the start of every session, Claude Code does, in order:

1. **Read `DECISIONS.md`** — current phase, recent decisions, open questions,
   parking lot.
2. **Read `wild-stewart-tracker.html`** — top 3 priorities per column.
3. **Confirm the current task** with Chad before starting work. Don't sprint ahead
   based on assumed context from the last session.

If the session is resuming after a 2+ week gap, treat it as a **red team trigger**
(see below).

---

## 🔴 Red Team Checkpoints

Adversarial review of recent decisions happens at these triggers:

- After every 2–3 completed modules
- Before any phase transition
- At the start of any session after a 2+ week gap
- When Chad explicitly calls for one

The format: Claude argues *against* recent decisions; Chad defends or concedes.
Formal outcomes:

- **Confirmed** — decision stands, move on.
- **Revised** — better approach identified, cleanup goes on the backlog.
- **Scheduled** — flagged for re-evaluation at a natural break.

Red teams get logged in `DECISIONS.md` under a dated entry.

---

## 🗂 Maintenance Protocol

- After completing each module, ask Chad: "Should I update DECISIONS.md?"
- After any pivot or substantive change of direction, update DECISIONS.md and the
  tracker in the same session.
- Update the `updated` date in `wild-stewart-tracker.html` at the end of any session
  that changes priorities.
- When a deferred decision becomes ready to be made (e.g., "writing surface after
  Joelle's input"), move it out of DECISIONS.md's parking lot into the active
  decision log.
- Keep `CLAUDE.md` stable. This document is the constitution. It changes when
  principles change, not when implementation details do. Implementation goes in
  DECISIONS.md.

---

## 🛠 Development Environment

- **Repo:** `wild-stewart-homeschool` (GitHub, under Chad's account)
- **Install:** `npm install`
- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Type check:** `npm run typecheck`
- **Deploy:** automatic on push to `main` (Cloudflare Pages)
- **Supabase project:** named in DECISIONS.md once created

---

*This document was drafted 2026-04-23 as the founding constitution for the Wild
Stewart Homeschool rebuild. Chad is the project lead; Joelle is the primary user;
Lyle (and eventually his siblings) are the learners. Ordo ab chao.*
