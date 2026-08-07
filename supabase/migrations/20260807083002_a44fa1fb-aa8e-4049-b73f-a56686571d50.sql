ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS education_stage text,
  ADD COLUMN IF NOT EXISTS stream text,
  ADD COLUMN IF NOT EXISTS current_marks text,
  ADD COLUMN IF NOT EXISTS institution_name text,
  ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS current_skills text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS goal_type text,
  ADD COLUMN IF NOT EXISTS budget_range text,
  ADD COLUMN IF NOT EXISTS timeline text,
  ADD COLUMN IF NOT EXISTS career_goal text,
  ADD COLUMN IF NOT EXISTS extra_context text;