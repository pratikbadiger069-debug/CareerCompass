CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- user_profiles
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  education_level text,
  current_grade text,
  field_of_interest text,
  target_country text,
  career_goals text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_profiles_select_own" ON public.user_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_profiles_update_own" ON public.user_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_profiles_delete_own" ON public.user_profiles FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER user_profiles_set_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- career_recommendations
CREATE TABLE public.career_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  career_title text NOT NULL,
  description text,
  match_score integer,
  required_skills text[] NOT NULL DEFAULT '{}',
  salary_range text,
  growth_outlook text,
  related_fields text[] NOT NULL DEFAULT '{}',
  is_saved boolean NOT NULL DEFAULT false,
  is_dismissed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_recommendations TO authenticated;
GRANT ALL ON public.career_recommendations TO service_role;
ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "career_recommendations_select_own" ON public.career_recommendations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "career_recommendations_insert_own" ON public.career_recommendations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "career_recommendations_update_own" ON public.career_recommendations FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "career_recommendations_delete_own" ON public.career_recommendations FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX career_recommendations_user_id_idx ON public.career_recommendations(user_id);
CREATE TRIGGER career_recommendations_set_updated_at BEFORE UPDATE ON public.career_recommendations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- roadmap_milestones
CREATE TABLE public.roadmap_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id uuid REFERENCES public.career_recommendations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'skill',
  target_date date,
  order_index integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_milestones TO authenticated;
GRANT ALL ON public.roadmap_milestones TO service_role;
ALTER TABLE public.roadmap_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roadmap_milestones_select_own" ON public.roadmap_milestones FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "roadmap_milestones_insert_own" ON public.roadmap_milestones FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "roadmap_milestones_update_own" ON public.roadmap_milestones FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "roadmap_milestones_delete_own" ON public.roadmap_milestones FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX roadmap_milestones_user_id_idx ON public.roadmap_milestones(user_id);
CREATE TRIGGER roadmap_milestones_set_updated_at BEFORE UPDATE ON public.roadmap_milestones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- chat_messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_messages_select_own" ON public.chat_messages FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "chat_messages_update_own" ON public.chat_messages FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "chat_messages_delete_own" ON public.chat_messages FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX chat_messages_user_conversation_idx ON public.chat_messages(user_id, conversation_id, created_at);

-- saved_colleges
CREATE TABLE public.saved_colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  college_name text NOT NULL,
  country text,
  city text,
  program text,
  tuition_estimate text,
  application_deadline date,
  website_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_colleges TO authenticated;
GRANT ALL ON public.saved_colleges TO service_role;
ALTER TABLE public.saved_colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_colleges_select_own" ON public.saved_colleges FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "saved_colleges_insert_own" ON public.saved_colleges FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "saved_colleges_update_own" ON public.saved_colleges FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "saved_colleges_delete_own" ON public.saved_colleges FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX saved_colleges_user_id_idx ON public.saved_colleges(user_id);
CREATE TRIGGER saved_colleges_set_updated_at BEFORE UPDATE ON public.saved_colleges FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- auto-create a profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NULLIF(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'), ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture'), '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();