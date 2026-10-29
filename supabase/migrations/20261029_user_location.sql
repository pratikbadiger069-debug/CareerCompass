-- Migration to add state and city to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS city text;

