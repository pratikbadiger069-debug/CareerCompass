# PathWay Advisor

Create a Supabase database with these tables: user_profiles, career_recommendations, 

roadmap_milestones, chat_messages, saved_colleges [paste exact schema from your source doc].

Enable Row Level Security on all tables — every table must have a policy that only allows 

users to read/write rows where user_id = auth.uid().

Then set up Supabase Auth with email/password and Google OAuth.

Build a landing page with the headline "PathWay — AI-Powered Career & Education Advisor" 

and CTA buttons for Sign Up and Try Demo Mode. Dark navy (#1E3A5F) + gold (#F5B342) theme.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/22b85788-59d6-4896-ba06-b295f782c5d0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
