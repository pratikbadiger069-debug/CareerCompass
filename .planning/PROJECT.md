# Project Context: CareerCompass Advisor

## Overview
**CareerCompass** is an AI-powered career and education advisor web application. It empowers students and job seekers to assess their interests and skills, receive personalized AI career recommendations, visualize step-by-step career path roadmaps, and track skill milestones towards their dream careers.

## Vision & Core Objectives
- **Target Audience:** Students, graduates, career changers, and job seekers.
- **Primary Focus for MVP:** 
  1. Landing Page with dark navy (`#1E3A5F`) and gold (`#F5B342`) aesthetic.
  2. Supabase Authentication (Email/Password & Social OAuth).
  3. Interactive Career & Skill Assessment engine.
  4. Personalised AI Career Recommendations.
  5. Visual Career Path Roadmap & Interactive Skill Milestone Tracker.

## Tech Stack
- **Frontend Framework:** TanStack Start / React 19 / Vite / TypeScript
- **Styling & UI:** Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Framer Motion, Recharts
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **Deployment & Tooling:** Lovable platform sync, Vite, Bun / npm

## Architecture & Schema Requirements
Tables to support:
- `user_profiles`: User metadata, target preferences, target career field.
- `career_recommendations`: Recommended paths, match scores, description, required skills, salary insights.
- `roadmap_milestones`: Milestones, steps, completion status, resources linked to user career paths.
- `chat_messages`: AI Advisor conversation logs.
- `saved_colleges`: Bookmarked educational institutions and course details.

## UI/UX Design System
- **Primary Colors:** Dark Navy (`#1E3A5F`), Warm Gold (`#F5B342`), Slate Accents
- **Theme:** Dark mode rich glassmorphism with dynamic card animations and responsive layouts.
