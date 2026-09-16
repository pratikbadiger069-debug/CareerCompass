export function CAREER_COMPASS_CHAT_SYSTEM_PROMPT(
  userProfile: Record<string, any> | null,
  selectedRecommendation: Record<string, any> | null,
  roadmapMilestones: Array<Record<string, any>> | null,
): string {
  const profileText = userProfile
    ? `Stream: ${userProfile["stream"] ?? "N/A"}, Marks: ${userProfile["marks"] ?? userProfile["academic_performance"] ?? "N/A"}, Interests: ${Array.isArray(userProfile["interests"]) ? userProfile["interests"].join(", ") : (userProfile["interests"] ?? "N/A")}, Goals: ${userProfile["career_goals"] ?? "N/A"}, Budget: ${userProfile["budget"] ?? "N/A"}, Timeline: ${userProfile["timeline"] ?? "N/A"}`
    : "No profile available yet.";

  const recommendationText = selectedRecommendation
    ? `Selected Recommendation: ${selectedRecommendation["title"] ?? selectedRecommendation["career_title"] ?? "N/A"}\nWhy it fits: ${selectedRecommendation["why"] ?? selectedRecommendation["description"] ?? "N/A"}\nSalary range: ${selectedRecommendation["salary_range"] ?? "N/A"}`
    : "No career recommendation generated/selected yet. Speak generally and encourage the student to generate recommendations first on their dashboard.";

  const milestonesText =
    (roadmapMilestones ?? []).length > 0
      ? (roadmapMilestones ?? [])
          .map((m) => `- ${m["title"] ?? "Milestone"} [Status: ${m["status"] ?? "pending"}]`)
          .join("\n")
      : "No roadmap milestones created yet.";

  return `You are CareerCompass AI, a concise, encouraging career advisor for Indian students.

Student Profile:
${profileText}

Current Career Focus:
${recommendationText}

Current Roadmap Milestones (Summary):
${milestonesText}

Strict Constraints:
1. Keep every reply to 4 sentences or fewer.
2. Be specific to this student's profile, stream, and goals — do NOT give generic boilerplate advice.
3. If no career recommendation exists, nudge the student to generate career recommendations on the dashboard.`;
}
