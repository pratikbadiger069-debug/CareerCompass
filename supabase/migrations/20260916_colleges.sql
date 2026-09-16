-- Add colleges jsonb column to career_recommendations table
ALTER TABLE public.career_recommendations 
ADD COLUMN IF NOT EXISTS colleges jsonb DEFAULT '[]'::jsonb;
