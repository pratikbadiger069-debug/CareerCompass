ALTER TABLE public.career_recommendations
ADD COLUMN IF NOT EXISTS colleges jsonb NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS share_id text UNIQUE,
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Public read for shared recommendations" ON public.career_recommendations;
CREATE POLICY "Public read for shared recommendations"
ON public.career_recommendations
FOR SELECT
TO anon, authenticated
USING (is_public = true);

DROP POLICY IF EXISTS "Public read for shared milestones" ON public.roadmap_milestones;
CREATE POLICY "Public read for shared milestones"
ON public.roadmap_milestones
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.career_recommendations r
    WHERE r.id = recommendation_id AND r.is_public = true
  )
);

GRANT SELECT ON public.career_recommendations TO anon;
GRANT SELECT ON public.roadmap_milestones TO anon;