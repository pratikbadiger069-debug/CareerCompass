# Code Review Summary: Roadmap Video Learning & AI JSON Resilience

**Review Date:** 2026-10-31  
**Scope:** Recent Roadmap, YouTube Learning Integrations & AI Resilience Features  
**Review File:** See [`.planning/phase-5/05-REVIEW.md`](file:///d:/PRATIK/Git_clone(CareerCompass)/CareerCompass/.planning/phase-5/05-REVIEW.md) for full detailed report.

---

## Findings Summary

| Severity | ID | Category | Description | File(s) |
|---|---|---|---|---|
| **Warning** | CR-05-01 | Security | Hardcoded base64-encoded fallback Gemini API key in source | `src/lib/roadmap.server.ts` |
| **Warning** | CR-05-02 | Null Safety | Unchecked parameter access in `getDirectYoutubeSearchUrl` can throw TypeError | `src/lib/youtubeResources.ts` |
| **Info** | CR-05-03 | Performance | Re-evaluating YouTube resource lookups on every re-render | `src/routes/_authenticated/dashboard.tsx` |
| **Info** | CR-05-04 | Concurrency | Un-awaited floating promise when fetching user profile | `src/routes/_authenticated/roadmap.tsx` |
| **Info** | CR-05-05 | Code Quality | Redundant fallback chaining in `activeSkill` resolution | `src/routes/_authenticated/dashboard.tsx` |

---

## Quick Fix Recommendations
1. **CR-05-02 (Null Safety in `getDirectYoutubeSearchUrl`)**: Add `(query ?? "").trim()` to avoid null pointer errors if `query` is undefined.
2. **CR-05-01 (API Key Security)**: Ensure fallback keys are loaded solely from environment variables.
3. **CR-05-03 (Performance)**: Wrap the dashboard's YouTube lookup in `useMemo`.
4. **CR-05-04 (Roadmap Profile Sync)**: Use `Promise.all` to fetch both `user_profiles` and `career_recommendations` simultaneously on roadmap load.
