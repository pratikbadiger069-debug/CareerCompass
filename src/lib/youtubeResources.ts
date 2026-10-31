export type YouTubeResource = {
  title: string;
  channel: string;
  url: string;
  description: string;
  badge?: string;
};

/**
 * Returns authentic, highly curated YouTube learning resources for any milestone,
 * skill, or interest area.
 */
export function getYoutubeResourcesForMilestone(
  milestoneTitle: string,
  milestoneCategory?: string,
  targetSkill?: string,
): YouTubeResource[] {
  const combinedText = `${milestoneTitle} ${milestoneCategory ?? ""} ${targetSkill ?? ""}`.toLowerCase();

  // 1. React / Next.js / Frontend Web Development
  if (
    combinedText.includes("react") ||
    combinedText.includes("next.js") ||
    combinedText.includes("frontend") ||
    combinedText.includes("web dev") ||
    combinedText.includes("html") ||
    combinedText.includes("css") ||
    combinedText.includes("javascript")
  ) {
    return [
      {
        title: "React & Next.js Complete Course with Real Projects",
        channel: "Chai aur Code",
        url: "https://www.youtube.com/results?search_query=chai+aur+code+react+nextjs+playlist",
        description: "Hands-on, deep-dive series in Hindi covering components, hooks, state management, and full-stack Next.js.",
        badge: "Full Course",
      },
      {
        title: "Full Stack Web Development for Beginners",
        channel: "freeCodeCamp.org",
        url: "https://www.youtube.com/results?search_query=freecodecamp+full+stack+web+development+course",
        description: "Comprehensive English masterclass from zero to building full-stack web applications with modern architecture.",
        badge: "Comprehensive",
      },
      {
        title: "Web Development Playlist (HTML, CSS, JS, React)",
        channel: "CodeWithHarry",
        url: "https://www.youtube.com/results?search_query=codewithharry+web+development+playlist",
        description: "Step-by-step project-oriented tutorials for beginner to intermediate developers.",
        badge: "Beginner Friendly",
      },
    ];
  }

  // 2. Data Structures & Algorithms (DSA) / LeetCode
  if (
    combinedText.includes("dsa") ||
    combinedText.includes("algorithm") ||
    combinedText.includes("data structure") ||
    combinedText.includes("leetcode") ||
    combinedText.includes("competitive programming")
  ) {
    return [
      {
        title: "Striver's A2Z DSA Course / Playlist",
        channel: "take U forward (Striver)",
        url: "https://www.youtube.com/results?search_query=take+u+forward+striver+a2z+dsa+course",
        description: "The gold standard DSA preparation roadmap for tech placements with pattern breakdowns and coding problems.",
        badge: "Top Placement Prep",
      },
      {
        title: "Data Structures & Algorithms in Depth",
        channel: "Abdul Bari",
        url: "https://www.youtube.com/results?search_query=abdul+bari+algorithms+playlist",
        description: "Legendary visual explanations of algorithm complexity, dynamic programming, and graph algorithms.",
        badge: "Core Theory",
      },
      {
        title: "LeetCode Blind 75 Solutions & Patterns",
        channel: "NeetCode",
        url: "https://www.youtube.com/results?search_query=neetcode+blind+75+playlist",
        description: "Clear, concise walkthroughs of the most frequent coding interview patterns asked by FAANG & product companies.",
        badge: "Interview Ready",
      },
    ];
  }

  // 3. AI, Machine Learning, Deep Learning & LLMs
  if (
    combinedText.includes("ai") ||
    combinedText.includes("machine learning") ||
    combinedText.includes("deep learning") ||
    combinedText.includes("llm") ||
    combinedText.includes("gpt") ||
    combinedText.includes("data science") ||
    combinedText.includes("pytorch")
  ) {
    return [
      {
        title: "Machine Learning Specialization by Andrew Ng",
        channel: "DeepLearning.AI / Stanford",
        url: "https://www.youtube.com/results?search_query=andrew+ng+machine+learning+deeplearningai",
        description: "The foundational curriculum created by AI pioneer Andrew Ng covering supervised, unsupervised, and modern ML.",
        badge: "Industry Standard",
      },
      {
        title: "Complete Generative AI & LangChain Playlist",
        channel: "Krish Naik",
        url: "https://www.youtube.com/results?search_query=krish+naik+generative+ai+langchain+playlist",
        description: "Production GenAI tutorials covering RAG architecture, vector databases, OpenAI/Gemini APIs, and Hugging Face.",
        badge: "Hands-on Projects",
      },
      {
        title: "100 Days of Machine Learning & Deep Learning",
        channel: "CampusX",
        url: "https://www.youtube.com/results?search_query=campusx+100+days+of+machine+learning",
        description: "Rigorous mathematical intuition coupled with scikit-learn, TensorFlow, and end-to-end deployment.",
        badge: "Structured Series",
      },
    ];
  }

  // 4. Python & Core Programming
  if (
    combinedText.includes("python") ||
    combinedText.includes("java") ||
    combinedText.includes("c++") ||
    combinedText.includes("programming basics")
  ) {
    return [
      {
        title: "Python for Beginners (Full 6-Hour Course)",
        channel: "freeCodeCamp.org",
        url: "https://www.youtube.com/results?search_query=freecodecamp+python+for+beginners+course",
        description: "Learn Python fundamentals, data structures, object-oriented programming, and file handling from scratch.",
        badge: "Beginner Masterclass",
      },
      {
        title: "Python Foundation & Real World Projects",
        channel: "Chai aur Code",
        url: "https://www.youtube.com/results?search_query=chai+aur+code+python+series",
        description: "Practical Python series focusing on syntax clarity, decorators, generators, and building real scripts.",
        badge: "Hindi & Practical",
      },
      {
        title: "Complete Python Playlist with Notes",
        channel: "CodeWithHarry",
        url: "https://www.youtube.com/results?search_query=codewithharry+python+playlist",
        description: "Detailed video lessons with downloadable exercises, quizzes, and mini projects.",
        badge: "Structured Notes",
      },
    ];
  }

  // 5. Cloud, DevOps & System Architecture
  if (
    combinedText.includes("cloud") ||
    combinedText.includes("devops") ||
    combinedText.includes("docker") ||
    combinedText.includes("kubernetes") ||
    combinedText.includes("aws") ||
    combinedText.includes("system design")
  ) {
    return [
      {
        title: "DevOps & Docker / Kubernetes Bootcamp",
        channel: "TechWorld with Nana",
        url: "https://www.youtube.com/results?search_query=techworld+with+nana+devops+docker+kubernetes",
        description: "World-class visual animations explaining containers, CI/CD pipelines, and cloud-native architecture.",
        badge: "Most Recommended",
      },
      {
        title: "System Design for Software Engineers",
        channel: "Gaurav Sen",
        url: "https://www.youtube.com/results?search_query=gaurav+sen+system+design+playlist",
        description: "Master load balancing, caching, database sharding, and high-availability system architecture.",
        badge: "Tech Interviews",
      },
      {
        title: "AWS Certified Solutions Architect Associate",
        channel: "freeCodeCamp.org",
        url: "https://www.youtube.com/results?search_query=freecodecamp+aws+solutions+architect+full+course",
        description: "Full exam prep and hands-on cloud deployment guide for Amazon Web Services.",
        badge: "Certification",
      },
    ];
  }

  // 6. Data Analysis, SQL & Business Intelligence
  if (
    combinedText.includes("data analyst") ||
    combinedText.includes("sql") ||
    combinedText.includes("power bi") ||
    combinedText.includes("tableau") ||
    combinedText.includes("excel")
  ) {
    return [
      {
        title: "Complete Data Analyst Portfolio Project & SQL Bootcamp",
        channel: "Alex The Analyst",
        url: "https://www.youtube.com/results?search_query=alex+the+analyst+data+analyst+bootcamp",
        description: "Full career guide: SQL querying, data cleaning in Excel/Pandas, and Power BI dashboards with portfolio projects.",
        badge: "Job Ready",
      },
      {
        title: "SQL & Power BI Full Course for Beginners",
        channel: "freeCodeCamp.org",
        url: "https://www.youtube.com/results?search_query=freecodecamp+sql+tutorial+full+course",
        description: "Learn relational database design, complex joins, subqueries, and analytical window functions.",
        badge: "Comprehensive",
      },
      {
        title: "Power BI & Dashboard Design Masterclass",
        channel: "Chandoo",
        url: "https://www.youtube.com/results?search_query=chandoo+power+bi+dashboard+tutorial",
        description: "Transform raw corporate data into beautiful executive business dashboards and KPI reports.",
        badge: "Executive Design",
      },
    ];
  }

  // 7. Finance, CA, Investment Banking & Stock Markets
  if (
    combinedText.includes("finance") ||
    combinedText.includes("stock") ||
    combinedText.includes("ca") ||
    combinedText.includes("cfa") ||
    combinedText.includes("banking") ||
    combinedText.includes("accounting")
  ) {
    return [
      {
        title: "Basics of Stock Market & Financial Statement Analysis",
        channel: "CA Rachana Ranade",
        url: "https://www.youtube.com/results?search_query=ca+rachana+ranade+basics+of+stock+market",
        description: "Fundamental analysis, reading balance sheets, P&L statements, and market valuation metrics.",
        badge: "Practical Finance",
      },
      {
        title: "Financial Modeling & Valuation Complete Course",
        channel: "Corporate Finance Institute (CFI)",
        url: "https://www.youtube.com/results?search_query=financial+modeling+valuation+full+course+youtube",
        description: "Discounted Cash Flow (DCF), LBO models, and valuation frameworks used in Investment Banking.",
        badge: "Investment Banking",
      },
      {
        title: "CA Foundation Accounts & Economics Classes",
        channel: "Unacademy CA / CA Foundation",
        url: "https://www.youtube.com/results?search_query=ca+foundation+accounts+full+playlist",
        description: "Structured lectures covering ICAI syllabus, accounting concepts, and revision tests.",
        badge: "ICAI Exam Prep",
      },
    ];
  }

  // 8. Competitive Exams (JEE / NEET / GATE / CAT / UPSC)
  if (
    combinedText.includes("jee") ||
    combinedText.includes("neet") ||
    combinedText.includes("gate") ||
    combinedText.includes("cat") ||
    combinedText.includes("upsc") ||
    combinedText.includes("entrance") ||
    combinedText.includes("exam")
  ) {
    return [
      {
        title: "Concept Revision & Practice Series for Competitive Exams",
        channel: "Physics Wallah / Unacademy",
        url: "https://www.youtube.com/results?search_query=physics+wallah+concept+revision+lectures",
        description: "High-yield topic revisions, problem-solving techniques, and previous year question breakdowns.",
        badge: "Exam Strategies",
      },
      {
        title: "Core Engineering Subjects for GATE & Technical Interviews",
        channel: "Gate Smashers",
        url: "https://www.youtube.com/results?search_query=gate+smashers+operating+systems+dbms+networks",
        description: "Clear, crisp explanations of Operating Systems, DBMS, Computer Networks, and Theory of Computation.",
        badge: "GATE & Placement",
      },
      {
        title: "CAT Quantitative Aptitude & DILR Master Series",
        channel: "Rodha (Ravi Prakash)",
        url: "https://www.youtube.com/results?search_query=rodha+cat+quant+dilr+playlist",
        description: "Comprehensive analytical problem sets, shortcut tricks, and speed math for competitive exams.",
        badge: "Aptitude Mastery",
      },
    ];
  }

  // 9. UI/UX Design & Product Management
  if (
    combinedText.includes("design") ||
    combinedText.includes("ui/ux") ||
    combinedText.includes("product management") ||
    combinedText.includes("figma")
  ) {
    return [
      {
        title: "Figma UI/UX Design Essentials Course",
        channel: "Mizko / DesignCourse",
        url: "https://www.youtube.com/results?search_query=mizko+figma+ui+ux+tutorial+course",
        description: "Wireframing, typography, auto-layout, design systems, and responsive prototype creation in Figma.",
        badge: "UI/UX Masterclass",
      },
      {
        title: "Product Management Fundamentals & Case Interviews",
        channel: "Exponent",
        url: "https://www.youtube.com/results?search_query=exponent+product+management+interview+prep",
        description: "Mock product manager interviews, metric design, prioritization matrices, and PRD frameworks.",
        badge: "Product Careers",
      },
    ];
  }

  // 10. Default / Dynamic Fallback: generates curated search link for exact milestone topic
  const query = encodeURIComponent(`${milestoneTitle} tutorial course playlist`);
  return [
    {
      title: `${milestoneTitle} — Complete Tutorial Playlist`,
      channel: "Curated YouTube Courses",
      url: `https://www.youtube.com/results?search_query=${query}`,
      description: `Watch top-rated, community-vetted video tutorials and project walkthroughs specifically covering ${milestoneTitle}.`,
      badge: "Targeted Tutorial",
    },
    {
      title: `${targetSkill ? `${targetSkill} Foundation & Best Practices` : `${milestoneTitle} Overview`}`,
      channel: "freeCodeCamp / Tech Tutorials",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${targetSkill || milestoneTitle} full course for beginners`)}`,
      description: "Comprehensive step-by-step video instruction to build practical projects and test your skills.",
      badge: "Deep Dive",
    },
  ];
}
