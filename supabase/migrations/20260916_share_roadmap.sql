-- Migration to add share_id and is_public to career_recommendations table
ALTER TABLE public.career_recommendations
ADD COLUMN IF NOT EXISTS share_id text UNIQUE,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- RLS Policy allowing public read access to career_recommendations where is_public = true
CREATE POLICY "Public read for shared recommendations"
ON public.career_recommendations
FOR SELECT
TO public
USING (is_public = true);

-- RLS Policy allowing public read access to roadmap_milestones linked to public recommendations
CREATE POLICY "Public read for shared milestones"
ON public.roadmap_milestones
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.career_recommendations r
    WHERE r.id = recommendation_id AND r.is_public = true
  )
);
