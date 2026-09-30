# Project Requirements: CareerCompass

## 1. Authentication & User Management (AUTH)
- [ ] **AUTH-01:** Implement Supabase Auth (Sign Up, Sign In, Sign Out, Password Reset).
- [ ] **AUTH-02:** User Profile creation and onboarding setup (`user_profiles` table).
- [ ] **AUTH-03:** Row Level Security (RLS) enforcement on all Supabase tables (`user_id = auth.uid()`).

## 2. Landing Page & Design System (LAND)
- [ ] **LAND-01:** Design high-converting landing page with "CareerCompass — AI-Powered Career & Education Advisor".
- [ ] **LAND-02:** Apply Navy (`#1E3A5F`) and Gold (`#F5B342`) modern design theme with sleek CTA buttons.
- [ ] **LAND-03:** Interactive "Try Demo Mode" allowing exploration without initial signup.

## 3. Assessment & AI Recommendation Engine (RECM)
- [ ] **RECM-01:** Multi-step assessment questionnaire (interests, current skills, education level, career goals).
- [ ] **RECM-02:** AI-driven career matching engine producing detailed recommendations with match percentage.
- [ ] **RECM-03:** Display career insights: required skills, salary ranges, industry growth trends, and college options.

## 4. Visual Career Roadmap & Skill Tracker (ROAD)
- [ ] **ROAD-01:** Interactive visual career roadmap showing step-by-step progress from novice to expert.
- [ ] **ROAD-02:** Skill milestone checklist with real-time completion tracking (`roadmap_milestones` table).
- [ ] **ROAD-03:** Recommended courses, certifications, and learning resources per milestone.

## 5. College & Course Bookmarking (COLG)
- [ ] **COLG-01:** Search and filter colleges/programs based on recommended career paths.
- [ ] **COLG-02:** Save/Bookmark colleges to user profile (`saved_colleges` table).
