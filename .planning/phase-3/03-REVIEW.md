# Phase 3 Code Review: Career Assessment & AI Recommendation Engine

**Review Date:** 2026-10-12  
**Target Phase:** Phase 3 (Career Assessment & AI Recommendation Engine)  
**Scope Files:**
- `src/routes/_authenticated/onboarding.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- `src/lib/careerCompass.paths.ts`
- `src/components/PathDetailModal.tsx`
- `src/lib/geminiApi.ts`
- `src/lib/roadmap.server.ts`
- `src/lib/roadmap.functions.ts`

**Overall Status:** `Warning` (Clean build passes, but 1 High Logic issue, 2 UX/State warnings, and Accessibility improvements identified)

---

## Findings Summary

| Severity | ID | Category | Description | File(s) |
|---|---|---|---|---|
| **High** | CR-03-01 | Logic / Data | Roadmap milestones scattered across distinct recommendations by phase index | `src/routes/_authenticated/dashboard.tsx` |
| **Warning** | CR-03-02 | State / Cache | Onboarding resubmission does not invalidate localStorage cache | `src/routes/_authenticated/onboarding.tsx`, `dashboard.tsx` |
| **Warning** | CR-03-03 | UX / State | Custom What-If submission does not automatically focus/select the newly generated scenario | `src/routes/_authenticated/dashboard.tsx` |
| **Warning** | CR-03-04 | Accessibility | Interactive card wrapper `<div onClick>` lacks `role="button"`, `tabIndex`, and keyboard handlers | `src/routes/_authenticated/dashboard.tsx` |
| **Info** | CR-03-05 | Code Quality | Excessive use of `any` types in `dashboard.tsx` state and AI response payload parsing | `src/routes/_authenticated/dashboard.tsx` |
| **Info** | CR-03-06 | Security / UX | Raw database error messages leaked in user-facing error alerts | `src/routes/_authenticated/dashboard.tsx` |

---

## Detailed Findings

### 1. [High] CR-03-01: Roadmap Milestones Dispersed Across Recommendations by Phase Index
- **File:** `src/routes/_authenticated/dashboard.tsx` (Lines 331–344)
- **Problem:**
  When inserting generated milestones into Supabase `roadmap_milestones`, `dashboard.tsx` loops over `aiRoadmap` phases and maps each phase to a different recommendation using:
  ```ts
  const linkedRec = insertedRecs[Math.min(phaseIndex, insertedRecs.length - 1)];
  ```
  The AI returns a chronological progression (Phase 1: Months 1–3, Phase 2: Months 4–6, Phase 3: Months 7–12) for the recommended career path. Because of this index mapping:
  - Recommendation #1 only gets Phase 1 milestones.
  - Recommendation #2 only gets Phase 2 milestones.
  - Recommendation #3 only gets Phase 3 milestones.
  When a student selects a career on the Roadmap page (`roadmap.tsx`), filtering by `recommendation_id` shows an incomplete fragmented roadmap.
- **Remediation:**
  Link all sequential milestones from the primary generated roadmap to the primary recommendation (`insertedRecs[0].id`), or generate distinct milestones per recommendation.

---

### 2. [Warning] CR-03-02: LocalStorage Cache Invalidation on Onboarding Resubmission
- **Files:** `src/routes/_authenticated/onboarding.tsx` (Lines 212–237) and `src/routes/_authenticated/dashboard.tsx` (Lines 192–215)
- **Problem:**
  `dashboard.tsx` caches AI recommendations in `localStorage` under `career_compass_full_${user.id}`. When a user updates their goals, stream, or education stage in `onboarding.tsx` and navigates back to `/dashboard`, the dashboard checks if existing recommendations exist and restores the stale cached data without re-evaluating or notifying the user.
- **Remediation:**
  In `onboarding.tsx` upon successful profile save:
  ```ts
  if (typeof window !== "undefined") {
    localStorage.removeItem(`career_compass_full_${user.id}`);
  }
  ```
  And delete or trigger regeneration of obsolete recommendations.

---

### 3. [Warning] CR-03-03: Custom What-If Submission Does Not Auto-Select the New Scenario
- **File:** `src/routes/_authenticated/dashboard.tsx` (Lines 138–162)
- **Problem:**
  When a user asks a custom What-If scenario question via `handleAskCustomQuestion`, `newScenario` is appended to `whatIfScenarios`, and a success toast is displayed. However, `scenarioIndex` remains at its previous value (e.g., 0). The Select dropdown continues showing the previous question and the response box does not update, giving the impression that the question was not answered.
- **Remediation:**
  Update `scenarioIndex` to point to the newly appended scenario:
  ```ts
  setWhatIfScenarios((prev) => {
    const updated = [...prev, newScenario];
    setScenarioIndex(updated.length - 1);
    return updated;
  });
  ```

---

### 4. [Warning] CR-03-04: Non-Interactive `div` with `onClick` Lacks Keyboard Accessibility
- **File:** `src/routes/_authenticated/dashboard.tsx` (Lines 538–550)
- **Problem:**
  The recommendation card is wrapped in a plain `<div>` with `onClick`:
  ```tsx
  <div
    key={rec.id}
    onClick={() => {
      setSelectedRecId(rec.id);
      setSelectedDetailRec(rec);
      setDetailModalOpen(true);
    }}
    className="..."
  >
  ```
  Screen readers cannot identify it as an interactive element, and keyboard-only users cannot tab to it or press `Enter`/`Space` to open the detail modal.
- **Remediation:**
  Add accessibility attributes and keyboard event listener:
  ```tsx
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedRecId(rec.id);
      setSelectedDetailRec(rec);
      setDetailModalOpen(true);
    }
  }}
  ```

---

### 5. [Info] CR-03-05: TypeScript Typing Refinements
- **File:** `src/routes/_authenticated/dashboard.tsx` (Lines 103, 129, 200, 792)
- **Problem:**
  `recommendations` is typed as `any[]`, and multiple casts `(option as any)` are used.
- **Remediation:**
  Type `recommendations` as `Array<Recommendation & Partial<PathDetailRec>>` and standardize option interface properties (`nextSteps` / `next_steps`).

---

### 6. [Info] CR-03-06: Database Error Masking in UI Alerts
- **File:** `src/routes/_authenticated/dashboard.tsx` (Lines 180, 242, 249, 256, 310)
- **Problem:**
  Raw Postgres / Supabase error strings (e.g., `profileError.message`, `insertError.message`) are thrown and displayed directly inside the alert banner.
- **Remediation:**
  Log the detailed error to `console.error` and display a user-friendly generic message in the UI:
  `"Unable to load recommendations. Please check your connection and try again."`

---

## Build & Test Verification
- **Build Status:** PASSED (`cmd /c "npm run build"` exited with code 0).
- **TypeScript Compilation:** Clean, 0 syntax/type errors.
- **SSR & Bundle Size:**
  - `onboarding.tsx`: 22.51 kB (SSR)
  - `dashboard.tsx`: 92.68 kB (SSR)
