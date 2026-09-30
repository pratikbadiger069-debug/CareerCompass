# Project Roadmap: CareerCompass

## Phase 1: Foundation, Database & Auth Infrastructure
- **Objective:** Establish Supabase client configuration, database schemas, Row Level Security policies, and user auth routing.
- **Deliverables:**
  - Supabase client integration & environment configuration.
  - SQL migration schema (`user_profiles`, `career_recommendations`, `roadmap_milestones`, `chat_messages`, `saved_colleges`).
  - Auth context provider and Login / Register / Profile management.

## Phase 2: Landing Page & Design System
- **Objective:** Implement hero section, feature spotlights, pricing/demo preview, and theme tokens (Navy `#1E3A5F` + Gold `#F5B342`).
- **Deliverables:**
  - Landing page with demo mode switch.
  - Navigation bar, footer, and glassmorphic UI card components.

## Phase 3: Career Assessment & AI Recommendation Engine
- **Objective:** Build interactive multi-step questionnaire and recommendation engine.
- **Deliverables:**
  - Interactive assessment flow.
  - Career recommendation dashboard with match scores and career breakdown.

## Phase 4: Visual Career Path Roadmap & Milestone Tracker
- **Objective:** Deliver interactive visual roadmap timeline and skill milestone tracking.
- **Deliverables:**
  - Dynamic visual roadmap UI with interactive node connections.
  - Milestone checklist with progress persistence in Supabase `roadmap_milestones`.

## Phase 5: AI Counselor Chat & College Explorer
- **Objective:** Interactive AI chat advisor and college/course search & bookmarking.
- **Deliverables:**
  - Conversational AI advisor panel.
  - Saved colleges dashboard (`saved_colleges`).
