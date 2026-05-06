# Handoff: Curriculum Inbox (Reading & Spelling)

> **Reference, not foundation.** Per `CLAUDE.md`: *"Patterns that worked carry forward. Code does not."*
> The files in this folder are an HTML/JSX prototype of teacher-side curriculum tooling for kindergarten reading & spelling. They are **design references**, not code to drop into the Vite/TS/Tailwind/Supabase build. Recreate the UI and behavior in the target environment using its established patterns.

---

## Overview

A teacher-facing module that gives Joelle:

1. **A 32-week structured-phonics curriculum** (Reading + Spelling tracks side-by-side) with examples, sentences, activities, songs, prereqs, common mistakes, and quick checks.
2. **Per-learner profile view** with collapsible buckets: To do · In progress · Needs review · Mastered.
3. **A standalone Sight Words inventory** (~80 Dolch words, three tiers) with the same status taxonomy.
4. **A monthly calendar** for assigning Reading/Spelling lessons to specific dates, with bulk scheduling.
5. **Six unit diagnostics** (digraphs, blends, silent E, vowel teams, R-controlled, soft & advanced) with auto-recommendations.
6. **A personalization engine** that swaps out sight words a learner has already mastered for fresh ones — and rewrites the practice sentence to match.

The personalization engine is the most novel piece. It is the part most worth porting carefully.

---

## Fidelity

**High-fidelity.** Final colors, type, spacing, and interactions are settled. Recreate pixel-faithfully on Joelle's side, but reconcile the palette with the existing project tokens (see "Subject color reconciliation" below).

---

## How this maps to `CLAUDE.md`

| Constitution requirement | How this prototype satisfies it | What needs reconciling on the Vite side |
|---|---|---|
| Joelle's side: warm, editorial, craftsman-y | ✅ Fraunces serif + Inter sans, paper-warm `#F8F1E5`-ish background, terracotta accent, generous whitespace | Match terracotta to the project's existing terracotta token; verify Fraunces is on the Joelle theme |
| Lyle's side: not built here | n/a | This handoff is **teacher-side only**. Lyle never sees these screens. |
| Multi-kid baked into data model | ✅ All progress, notes, assignments, sight-word mastery keyed by `studentId` | Replace `localStorage` keys with `profile_id` foreign keys per the schema |
| Status taxonomy | `todo` · `progress` · `review` · `mastered` | Becomes `completion_state` enum on `completions` rows. **Append-only** per the constitution — flipping a word from `mastered` back to `progress` writes a new event, not a mutation. |
| 5-subject color stability | This module only touches Reading and Writing/Spelling | No new colors invented — terracotta accent here ≈ Reading red (`#E85D4A`) on the Lyle side |
| RLS / `profile_id` on every query | Prototype uses unscoped localStorage | All Supabase queries must filter by `profile_id`. The personalization engine in `personalize.js` reads sight-word mastery — that read **must** be `profile_id`-scoped. |
| Curriculum content versioned/immutable | Prototype edits curriculum data in place | When porting, snapshot lesson content into the completion row so an edit doesn't retroactively change what Lyle did. |

---

## Screens / Views

### 1. Curriculum (the inbox)

**Purpose.** Joelle's primary planning surface. Two parallel tracks (Reading | Spelling) by week.

**Layout.**
- 240px sidebar (brand, learner picker, section nav, search, skill filter, progress block)
- Main pane: sticky track header → unit dividers → week rows (3-column grid: 80px week number / 1fr Reading / 1fr Spelling)
- Click a lesson cell → expands a 2-column detail panel (lesson detail | spelling instruction)

**Components per week row.**
- Big serif week number (Fraunces, 28px), unit tag (italic, terracotta)
- Reading cell: status circle button + skill tag + focus title (Fraunces 19px) + secondary line + word pills (mono, 11px) + chevron
- Spelling cell: identical structure, sight words italicized in subtitle

**Status circle** has 4 visual states:
- `todo`: hollow ring, ink-3 stroke
- `progress`: filled with amber-soft, amber dot inside
- `review`: hollow ring with thicker terracotta stroke + serif "!" inside
- `mastered`: solid sage with white checkmark

**Detail panel left column** (lesson):
- Eyebrow (skill tag + focus), serif title, italic summary
- Spelling rule (spelling lessons only)
- Example words grid
- Sight words this week (terracotta pills) — **shows "✦ Adapted" sage badge if any words were swapped, plus a swap-summary block listing `old → new`**
- Practice sentence (large serif italic, terracotta left border) — **if rewritten, shows "Original:" with the unchanged version below**
- Activity card, Song/chant card, Prerequisites, Common mistakes, Quick check
- Status row (4 buttons), Assigned date input, Notes textarea

**Detail panel right column** (how to teach spelling — fixed teaching content):
- 4-step encoding method (say slowly → tap sounds → match letters → read back)
- Spelling list to dictate
- Sight word spelling tips (heart-word approach)
- Recovery moves when stuck

**Banner at top of curriculum view**: shows when adaptations are active. *"Curriculum adapted for this child. N sight words marked mastered — M lessons updated…"*

### 2. Profile (per-learner)

Collapsible buckets sorted by status: To do, In progress, Needs review, Mastered. Each row shows: week number, lesson focus, optional note preview, optional assigned-date pill, status dropdown, and (when present) a `bucket-note` italic preview.

### 3. Sight Words

Three tier groups (Pre-Primer / Primer / Kindergarten + High Frequency). Click any word to cycle status. Header shows mastered count, in-progress count, review count. **This is the input that drives the personalization engine.**

### 4. Calendar

Monthly grid (7×variable). Today highlighted. Click empty day → modal picker of unscheduled lessons. Click chip → clear. Bulk schedule panel: pick start Monday + start week + run length; writes Reading→Mon and Spelling→Wed.

### 5. Diagnostic

Six unit assessments (collapsible). Per-word ✓/✗ marks. Auto-recommendation derived from score: ≥90% Mastered · ≥70% Almost there · ≥40% Practicing · else Just starting.

---

## The personalization engine — `personalize.js`

This is the centerpiece. **Port this with care.**

### What it does

When a sight word is marked `mastered` in the Sight Words view, every curriculum lesson that originally taught that word gets adapted:
1. The mastered word is removed from the lesson's `sightWords` list
2. A replacement is pulled from the unmastered pool (preferring the same tier so difficulty stays right)
3. The practice `sentence` is rewritten — every occurrence of a mastered sight word is replaced with its substitute, preserving capitalization and punctuation

### Why these specific choices matter

- **Deterministic by `(week, kind)`** — uses a tiny FNV-style hash so the *same* lesson always picks the *same* replacement. Joelle should not see the words shuffle when she revisits a week. Port this property.
- **Tier-aware substitution** — closest tier to the median tier of the original lesson's words wins, then falls back outward. Don't replace "the" with "another" if "have" is available.
- **Only sight words** — the lesson's phonics target words (`words` array) are **never touched**. Those are the whole point of the lesson. Same rule applies to sentence rewriting: only tokens that match a known sight word get replaced.
- **Heart-word logic intact** — the spelling instruction block always says "for 'the', tap /th/ + /uh/ (heart part)." When porting, keep the heart-word framing in the spelling teaching panel even if the specific word being taught changes.

### Data flow on the Supabase side

```
sight_words (catalog)         ← seed once from sight-words-data.js
profiles                      ← Joelle creates Lyle, etc.
sight_word_states             ← (profile_id, word, state, updated_at) — append-only
                                state ∈ {'todo','progress','review','mastered'}
lessons                       ← curriculum-data.js becomes seed data
completions                   ← (profile_id, lesson_id, state, snapshot_json, created_at)
assignments                   ← (profile_id, lesson_id, scheduled_date)
```

The personalization read becomes:
```
SELECT word FROM sight_word_states
WHERE profile_id = :p AND state = 'mastered'
```
…fed into the same `personalizeEntry(entry, masteredSet)` pure function. Keep the function pure — don't bake Supabase access into it.

### What can break if you port it wrong

- Reading from a non-`profile_id`-scoped query → one kid's mastery affects another's curriculum. **Hard violation of constitution rule 4.**
- Mutating curriculum data in place instead of cloning → React re-render bugs and (worse) corrupted snapshots in `completions`.
- Treating `sight_word_states` as mutable → loses history. Append-only per rule 2.

---

## Subject color reconciliation

Prototype uses **terracotta** (`oklch(0.55 0.11 38)` ≈ `#C56A4E`) as its single accent.
The Wild Stewart system has **Reading=`#E85D4A`** and **Writing=`#2BBFB5`**.

**Recommendation:** on Joelle's side, the curriculum module's accent should be Writing's deep teal (it's a Reading & Spelling planning module, but Spelling is the active interaction track — Reading lessons here are the *teaching* of decoding, not the kid-facing reading lesson type). Or split: Reading-track cells use Reading red, Spelling-track cells use Writing teal. **Flag for Joelle.**

The "Adapted" badge uses sage green (`oklch(0.58 0.07 150)` ≈ `#5A8C6B`). This is fresh — no conflict with the 5-subject taxonomy.

---

## Design tokens

```
Colors (oklch → ~hex)
  paper          0.975 0.008 80   #F8F4ED
  paper-2        0.96  0.012 80   #F1ECE2
  paper-3        0.93  0.014 78   #E6DFD2
  line           0.86  0.012 75   #D4CCBE
  line-soft      0.91  0.010 75   #DFD8CB
  ink            0.22  0.015 60   #2A251F
  ink-2          0.42  0.013 60   #5C5448
  ink-3          0.58  0.010 60   #837C70
  accent (terracotta)  0.55 0.11 38   #C56A4E
  accent-soft          0.92 0.04 50   #F0DCCD
  sage                 0.58 0.07 150  #5A8C6B
  sage-soft            0.93 0.04 150  #DAEAD9
  amber                0.68 0.10 70   #C29347
  amber-soft           0.94 0.05 80   #F2E3C2

Type
  display: Fraunces (variable, opsz 9..144, wght 300..600), italic for accents
  ui:      Inter (300/400/500/600)
  mono:    JetBrains Mono (400/500)

Spacing scale: 4px-based, generous (typical row padding 18–28px)
Radius: 4px (chips) · 6–8px (cards) · 10–14px (panels) · 999px (badges, avatars)
Borders: 1px line tokens, 1.5px on status circles, 2px on the practice-sentence accent
Shadows: minimal — restraint over depth
```

---

## Files in this bundle

| File | Purpose |
|---|---|
| `Curriculum Inbox.html` | Entry point — loads React/Babel + all scripts |
| `styles.css` | Full design system + all view styles |
| `app.jsx` | Shell, routing, state, persistence |
| `curriculum-view.jsx` | Inbox + lesson detail + adaptation banner/badges |
| `profile-view.jsx` | Per-learner collapsible buckets |
| `sight-words-view.jsx` | Sight word inventory with status cycling |
| `calendar-view.jsx` | Monthly grid, day modal, bulk schedule |
| `diagnostic-view.jsx` | Six unit assessments with recommendations |
| `personalize.js` | **Personalization engine. Port with care.** |
| `curriculum-data.js` | 32-week curriculum (Reading + Spelling per week) |
| `sight-words-data.js` | Three tiers of sight words |
| `diagnostics-data.js` | Six unit diagnostic word lists |
| `utils.js` | Shared status constants, date helpers, persistence |

---

## Suggested module placement

Per the existing modules in `CLAUDE.md`:
- The **Reading** lesson type already exists conceptually in Module 5. The 32-week digraph→blend→silent E→vowel teams progression here is reference material for what good Reading lesson content looks like.
- The **Spelling** lesson type is Module 6. The "4-step encoding method" teaching block, dictation lists, and heart-word framing are reference for the *teacher's view* of those lessons.
- The **Sight Words inventory** is a new sub-module — likely Module 5.5 or a v1.x addition. Drives personalization.
- The **Calendar** view here is more developed than Module 7's plan suggests — borrow what's useful (assigned-date pills on lessons, bulk schedule UX).
- The **Personalization engine** is genuinely new. It belongs after sight-word state is in Postgres. Discuss with Joelle whether v1 ships with adaptation on or off by default.

---

## Open questions for Joelle / Chad

1. Subject color split (Reading red vs. Writing teal) for the curriculum module — pick one or split per track?
2. Should personalization happen automatically, or as an explicit "Refresh curriculum for this learner" action Joelle triggers?
3. Diagnostics here are mass-administered (one sitting per unit). Does Joelle prefer that, or interleaved diagnostic prompts inside lessons?
4. Bulk schedule writes Reading→Mon, Spelling→Wed — confirm the cadence matches Joelle's actual rhythm.
5. The "Adapted" badge and swap-summary box — is the transparency ("here's what got swapped and why") helpful, or just visual noise once Joelle trusts it?
