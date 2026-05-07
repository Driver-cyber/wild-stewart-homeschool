-- Wild Stewart Homeschool — database schema
-- Run this in the Supabase SQL editor (wildly-stewart project)
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS + CREATE POLICY IF NOT EXISTS

-- ─── Learner profiles ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  color         text        NOT NULL DEFAULT '#E8970A',
  avatar_emoji  text        NOT NULL DEFAULT '⭐',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Migration: customizable spaceship per learner profile (Feature 3)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS spaceship_config jsonb;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles: owner full access'
  ) THEN
    CREATE POLICY "profiles: owner full access" ON profiles
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── Lesson catalog (Joelle's library) ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS lessons (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         text        NOT NULL,
  subject       text        NOT NULL CHECK (subject IN ('reading','writing','math','science','social_studies')),
  description   text,
  resource_url  text,
  pdf_path      text,
  lesson_type   text        NOT NULL DEFAULT 'general',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Migrations: run these in the Supabase SQL editor
-- ALTER TABLE lessons ADD COLUMN IF NOT EXISTS pdf_path text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS resource_url_2 text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_image_path text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS quiz_questions jsonb;

-- Storage: in the Supabase dashboard → Storage, create a bucket named 'resources'
-- with "Public bucket" enabled. This allows getPublicUrl() to work for PDFs and images.
-- Without this bucket, file uploads and the "Open worksheet" button will return 404.

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lessons' AND policyname = 'lessons: owner full access'
  ) THEN
    CREATE POLICY "lessons: owner full access" ON lessons
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── Assignments (lesson scheduled for a profile on a date) ──────────────────

CREATE TABLE IF NOT EXISTS assignments (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id       uuid        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  profile_id      uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_date  date        NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assignments' AND policyname = 'assignments: owner full access'
  ) THEN
    CREATE POLICY "assignments: owner full access" ON assignments
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── Completions (append-only — a completion is a fact that happened) ─────────

CREATE TABLE IF NOT EXISTS completions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id  uuid        NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  profile_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'completions' AND policyname = 'completions: owner full access'
  ) THEN
    CREATE POLICY "completions: owner full access" ON completions
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── Weekend build (2026-05-06): 4-state status, snapshot, sight words, curriculum content ───
-- Safe to re-run. Run as one transaction in the Supabase SQL editor.

-- Four-state status enum (used by completions and sight_word_states)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_state') THEN
    CREATE TYPE lesson_state AS ENUM ('todo', 'progress', 'review', 'mastered');
  END IF;
END $$;

-- Completions become an append-only state-event log:
-- existing rows = mastered events; new states append new rows; latest per assignment wins.
ALTER TABLE completions
  ADD COLUMN IF NOT EXISTS state lesson_state NOT NULL DEFAULT 'mastered';

-- Lesson content snapshot frozen onto the completion at event time
-- (resolves CLAUDE.md non-negotiable #3 — curriculum versioning).
ALTER TABLE completions
  ADD COLUMN IF NOT EXISTS lesson_snapshot jsonb;

-- Lesson reference on the completion event, so curriculum-inbox can read
-- per-(lesson, profile) state without JOINing through assignments. Enables
-- "catalog state" updates that don't have a scheduled assignment yet
-- (e.g. Joelle marks W3 Reading 'mastered' from the curriculum view).
ALTER TABLE completions
  ADD COLUMN IF NOT EXISTS lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL;

-- Backfill from existing rows.
UPDATE completions c
   SET lesson_id = a.lesson_id
  FROM assignments a
 WHERE c.assignment_id = a.id
   AND c.lesson_id IS NULL;

CREATE INDEX IF NOT EXISTS completions_profile_lesson_idx
  ON completions (profile_id, lesson_id, completed_at DESC);

-- Don't lose completion history when an assignment is unassigned
-- (resolves drift named in the 2026-04-23 demo-week DECISIONS entry).
ALTER TABLE completions
  DROP CONSTRAINT IF EXISTS completions_assignment_id_fkey;
ALTER TABLE completions
  ALTER COLUMN assignment_id DROP NOT NULL;
ALTER TABLE completions
  ADD CONSTRAINT completions_assignment_id_fkey
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL;

-- Lessons: offline flag + curriculum-track fields
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_offline   boolean NOT NULL DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS week_number  int;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS track        text;   -- 'reading' | 'spelling' | 'phonics' | null
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content      jsonb;  -- curriculum-inbox structured fields

-- ─── Sight word catalog (per household; seeded once from sight-words-data.js) ────────────────

CREATE TABLE IF NOT EXISTS sight_words (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word        text        NOT NULL,
  tier        text        NOT NULL CHECK (tier IN ('pre_primer','primer','kindergarten','high_frequency')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, word)
);

ALTER TABLE sight_words ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sight_words' AND policyname = 'sight_words: owner full access'
  ) THEN
    CREATE POLICY "sight_words: owner full access" ON sight_words
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── Per-profile sight-word state (append-only; latest row per (profile_id, word) wins) ──────

CREATE TABLE IF NOT EXISTS sight_word_states (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id  uuid         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word        text         NOT NULL,
  state       lesson_state NOT NULL,
  created_at  timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sight_word_states_profile_word_idx
  ON sight_word_states (profile_id, word, created_at DESC);

ALTER TABLE sight_word_states ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sight_word_states' AND policyname = 'sight_word_states: owner full access'
  ) THEN
    CREATE POLICY "sight_word_states: owner full access" ON sight_word_states
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── Append-only enforcement (2026-05-06 review #3) ──────────────────────────────
-- The `FOR ALL` policies above let owners UPDATE and DELETE state rows. The append-only
-- invariant is currently enforced only by convention in the React code. Drop the FOR ALL
-- policies and replace with explicit FOR SELECT + FOR INSERT so the database enforces
-- the rule at its strongest layer. RLS is still scoped to the household (user_id).

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'completions' AND policyname = 'completions: owner full access') THEN
    DROP POLICY "completions: owner full access" ON completions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'completions' AND policyname = 'completions: owner read') THEN
    CREATE POLICY "completions: owner read" ON completions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'completions' AND policyname = 'completions: owner insert') THEN
    CREATE POLICY "completions: owner insert" ON completions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sight_word_states' AND policyname = 'sight_word_states: owner full access') THEN
    DROP POLICY "sight_word_states: owner full access" ON sight_word_states;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sight_word_states' AND policyname = 'sight_word_states: owner read') THEN
    CREATE POLICY "sight_word_states: owner read" ON sight_word_states
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sight_word_states' AND policyname = 'sight_word_states: owner insert') THEN
    CREATE POLICY "sight_word_states: owner insert" ON sight_word_states
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── Curriculum lesson uniqueness (2026-05-06 review #4) ─────────────────────────
-- Make the seed step idempotent by giving the (user_id, track, week_number) tuple a
-- unique constraint. Repeat clicks of "Seed curriculum" will no-op via upsert
-- ON CONFLICT instead of inserting duplicates.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lessons_curriculum_unique'
  ) THEN
    -- Partial unique index — only curriculum lessons (those with both track AND
    -- week_number set) need uniqueness; ad-hoc library lessons stay free.
    CREATE UNIQUE INDEX lessons_curriculum_unique
      ON lessons (user_id, track, week_number)
      WHERE track IS NOT NULL AND week_number IS NOT NULL;
  END IF;
END $$;
