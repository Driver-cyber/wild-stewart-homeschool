-- Wild Stewart Homeschool — database schema
-- Run this in the Supabase SQL editor (wildly-stewart project)
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS + CREATE POLICY IF NOT EXISTS

-- ─── Learner profiles ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  color         text        NOT NULL DEFAULT '#E8970A',
  avatar_emoji  text        NOT NULL DEFAULT '⭐',
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles: owner full access'
  ) THEN
    CREATE POLICY "profiles: owner full access" ON profiles
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── Lesson catalog (Joelle's library) ───────────────────────────────────────────

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

-- Migration: ALTER TABLE lessons ADD COLUMN IF NOT EXISTS pdf_path text;

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lessons' AND policyname = 'lessons: owner full access'
  ) THEN
    CREATE POLICY "lessons: owner full access" ON lessons
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── Assignments (lesson scheduled for a profile on a date) ──────────────────────────

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

-- ─── Completions (append-only — a completion is a fact that happened) ─────────────────

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
