# Project Context: CareerCompass Advisor

## Overview
**CareerCompass** is an AI-powered career and education advisor web application. It empowers students and job seekers to assess their interests and skills, receive personalized AI career recommendations, visualize step-by-step career path roadmaps, and track skill milestones towards their dream careers.

## Shipped Version: v1.0 (MVP)
- **Status:** Shipped & Verified with 0 build errors (`npm run build`).
- **Core Features Delivered:**
  1. High-conversion landing page with dark navy (`#1E3A5F`) and gold (`#F5B342`) aesthetic + instant 1-click Demo Mode.
  2. Supabase Authentication & Profile Onboarding (`user_profiles`).
  3. Interactive 5-stage Career & Skill Assessment questionnaire.
  4. AI Career Matching Engine with salary, required skills, and growth outlook insights.
  5. Interactive Visual Career Path Roadmap & Milestone Tracker (`roadmap_milestones`).
  6. AI Counselor Chat & College/Course Explorer with bookmarking (`saved_colleges`).

## Tech Stack
- **Frontend Framework:** TanStack Start / React 19 / Vite / TypeScript
- **Styling & UI:** Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Framer Motion, Recharts
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **Deployment & Tooling:** Lovable platform sync, Vite, Bun / npm

## Architecture & Schema Requirements
Tables implemented & RLS protected:
- `user_profiles`: User metadata, target preferences, target career field.
- `career_recommendations`: Recommended paths, match scores, description, required skills, salary insights.
- `roadmap_milestones`: Milestones, steps, completion status, resources linked to user career paths.
- `chat_messages`: AI Advisor conversation logs.
- `saved_colleges`: Bookmarked educational institutions and course details.

## UI/UX Design System
- **Primary Colors:** Dark Navy (`#1E3A5F`), Warm Gold (`#F5B342`), Slate Accents
- **Theme:** Dark mode rich glassmorphism with dynamic card animations and responsive layouts.

