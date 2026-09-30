# Phase 1 Plan: Foundation, Database & Auth Infrastructure

## Goal
Verify and harden the Supabase database schema, Row Level Security (RLS) policies, TypeScript types, Supabase Auth state integration, and global theme tokens (#1E3A5F navy + #F5B342 gold).

## Scope & Requirements Map
- **AUTH-01:** Supabase Auth Client & Session State Provider.
- **AUTH-02:** Database tables (`user_profiles`, `career_recommendations`, `roadmap_milestones`, `chat_messages`, `saved_colleges`).
- **AUTH-03:** Strict RLS Policies (`user_id = auth.uid()`).
- **FOUNDATION-01:** Design system tokens & Tailwind CSS styling for Navy (`#1E3A5F`) and Gold (`#F5B342`) theme.

## Task Decomposition

### Task 1: Database Schema & RLS Verification (Tracer)
- **Goal:** Ensure all 5 core tables exist in migrations with correct foreign keys and RLS policies (`user_id = auth.uid()`).
- **Outputs:** Verified SQL schema in `supabase/migrations/` and updated `src/integrations/supabase/types.ts`.
- **Verification:** Schema linting / SQL verification.

### Task 2: Supabase Auth & Session Provider Integration
- **Goal:** Verify Supabase authentication hooks/context for email/password and social login.
- **Outputs:** `src/integrations/supabase/client.ts`, Auth provider/hook integration in root router/app.
- **Verification:** Client instantiation test / auth state listener check.

### Task 3: Theme Tokens & Layout Shell Setup
- **Goal:** Configure Tailwind CSS theme tokens for `#1E3A5F` (Navy) and `#F5B342` (Gold), plus dynamic dark mode glassmorphic utility classes.
- **Outputs:** `src/styles.css` / theme utilities update.
- **Verification:** App build (`npm run build`).

## Success Criteria
- Build succeeds cleanly with `npm run build`.
- Supabase schema definitions cover all 5 required domains with strict RLS.
