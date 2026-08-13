# CareerCompass — Cloud Backend, Auth, and Landing Page

Set up the backend (database + authentication) and build the public landing page. App pages come later.

## 1. Database

Five tables, all owned by the signed-in user via a `user_id` column referencing the auth user.

- **user_profiles** — one row per user: full name, avatar, education level, current grade/year, field of interest, target country, career goals, onboarding completion flag, created/updated timestamps.
- **career_recommendations** — AI-generated suggestions: career title, description, match score, required skills, salary range, growth outlook, related fields, saved/dismissed flag, created timestamp.
- **roadmap_milestones** — steps toward a career: linked recommendation, title, description, category (education, skill, exam, experience), target date, order index, status (pending/in progress/done), created/updated timestamps.
- **chat_messages** — advisor conversation: conversation id, role (user/assistant), content, created timestamp.
- **saved_colleges** — college name, country, city, program, tuition estimate, application deadline, website, notes, created timestamp.

Security on every table:
- Row Level Security enabled.
- One policy set per table allowing select/insert/update/delete only where `user_id` equals the signed-in user.
- No anonymous read access; privileges granted only to signed-in users and backend services.
- A trigger creates a `user_profiles` row automatically when someone signs up.

## 2. Authentication

- Email + password sign-in and sign-up.
- Google sign-in enabled through the managed Cloud auth broker.
- **Demo mode**: the "Try Demo Mode" button creates an anonymous guest account instantly, so demo activity is real and saved. Guests can later attach an email/password or Google account to keep their data.
- A sign-in/sign-up screen at `/auth` and the protected-route gate so future app pages are guarded.

## 3. Landing page (replaces the placeholder home page)

Dark navy `#1E3A5F` base with gold `#F5B342` accents, used as theme tokens rather than one-off colors.

- Hero with the headline "CareerCompass — AI-Powered Career & Education Advisor", a short subheadline, and two CTAs: **Sign Up** (gold, primary) and **Try Demo Mode** (outlined gold).
- Supporting sections: how it works (three steps), feature highlights matching the data model (career matches, roadmap, AI chat, saved colleges), and a closing CTA.
- Header shows Sign In when signed out and a dashboard/sign-out affordance when signed in.
- Page-specific title, description, and social preview metadata.

## Technical notes

- Lovable Cloud is enabled for database, auth, and server-side logic.
- Schema and policies ship in a single migration with explicit grants; each table has `user_id uuid not null` defaulting to the current user.
- Auth pages are public routes; protected pages will live under the authenticated layout.
- Demo mode uses anonymous sign-in (enabled in auth settings), then routes to the app shell.
- Colors are added as semantic tokens in `src/styles.css`; no hardcoded hex values in components.
