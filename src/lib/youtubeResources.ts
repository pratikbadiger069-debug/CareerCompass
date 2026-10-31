export type YouTubeResource = {
  title: string;
  channel: string;
  url: string;
  description: string;
  badge?: string;
};

/**
 * Generates a direct YouTube search URL for any custom skill or topic.
 */
export function getDirectYoutubeSearchUrl(query?: string | null): string {
  const raw = query ?? "";
  const clean = raw.trim().replace(/[^\w\s+#.-]/gi, "");
  const searchTerm = clean || "Career and Skill Development";
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${searchTerm} tutorial course full playlist`)}`;
}

/**
 * Returns authentic, highly curated YouTube learning resources specifically for any skill
 * the student wants to achieve.
 */
export function getYoutubeResourcesForSkill(skillName: string): YouTubeResource[] {
  if (!skillName || !skillName.trim()) return [];
  const text = skillName.trim().toLowerCase();

  // 1. React / Next.js / Frontend / Web Development / JavaScript / TypeScript
  if (
    text.includes("react") ||
    text.includes("next") ||
    text.includes("frontend") ||
    text.includes("web dev") ||
    text.includes("html") ||
    text.includes("css") ||
    text.includes("tailwind") ||
    text.includes("javascript") ||
    text.includes("typescript")
  ) {
    return [
      {
        title: "React & Next.js Full Stack Masterclass",
        channel: "Chai aur Code",
        url: "https://www.youtube.com/results?search_query=chai+aur+code+react+nextjs+playlist",
        description: "Hands-on projects covering state management, hooks, server actions, and modern web development.",
        badge: "Top Rated Playlist",
      },
      {
        title: "Complete Web Development Bootcamp (HTML, CSS, JS, React)",
        channel: "freeCodeCamp.org",
        url: "https://www.youtube.com/results?search_query=freecodecamp+full+stack+web+development+course",
        description: "From beginner fundamentals to deploying full-stack web applications with best practices.",
        badge: "Comprehensive",
      },
      {
        title: "Modern JavaScript & React Complete Course",
        channel: "CodeWithHarry",
        url: "https://www.youtube.com/results?search_query=codewithharry+javascript+react+playlist",
        description: "Step-by-step video tutorials with downloadable notes, exercises, and real-world clone projects.",
        badge: "Beginner Friendly",
      },
    ];
  }

  // 2. Data Structures & Algorithms (DSA) / LeetCode / Problem Solving
  if (
    text.includes("dsa") ||
    text.includes("algorithm") ||
    text.includes("data structure") ||
    text.includes("leetcode") ||
    text.includes("competitive programming") ||
    text.includes("problem solving")
  ) {
    return [
      {
        title: "Striver's A2Z DSA Sheet & Video Solutions",
        channel: "take U forward (Striver)",
        url: "https://www.youtube.com/results?search_query=take+u+forward+striver+a2z+dsa+course",
        description: "The gold-standard placement prep series covering Arrays, Trees, Graphs, Dynamic Programming, and System Coding.",
        badge: "Placement Standard",
      },
      {
        title: "Data Structures & Algorithms in Depth",
        channel: "Abdul Bari",
        url: "https://www.youtube.com/results?search_query=abdul+bari+algorithms+playlist",
        description: "World-famous visual explanations of dynamic programming, divide and conquer, and graph theory.",
        badge: "Core Theory",
      },
      {
        title: "LeetCode Blind 75 / NeetCode 150 Coding Walkthroughs",
        channel: "NeetCode",
        url: "https://www.youtube.com/results?search_query=neetcode+blind+75+playlist",
        description: "Learn the core 14 coding patterns asked by Google, Microsoft, Amazon, and top tech companies.",
        badge: "FAANG Ready",
      },
    ];
  }

  // 3. AI, Machine Learning, Deep Learning, GenAI & LLMs
  if (
    text.includes("ai") ||
    text.includes("machine learning") ||
    text.includes("deep learning") ||
    text.includes("generative ai") ||
    text.includes("genai") ||
    text.includes("llm") ||
    text.includes("nlp") ||
    text.includes("computer vision") ||
    text.includes("langchain")
  ) {
    return [
      {
        title: "Machine Learning Specialization by Andrew Ng",
        channel: "DeepLearning.AI / Stanford",
        url: "https://www.youtube.com/results?search_query=andrew+ng+machine+learning+deeplearningai",
        description: "Pioneering course on supervised learning, neural networks, decision trees, and best ML practices.",
        badge: "Stanford Standard",
      },
      {
        title: "Generative AI, LangChain & LLM Application Building",
        channel: "Krish Naik",
        url: "https://www.youtube.com/results?search_query=krish+naik+generative+ai+langchain+playlist",
        description: "Hands-on implementation of RAG pipelines, Vector DBs (Pinecone/Chroma), OpenAI/Gemini APIs, and Hugging Face.",
        badge: "Production Ready",
      },
      {
        title: "Complete 100 Days of Machine Learning & Math",
        channel: "CampusX",
        url: "https://www.youtube.com/results?search_query=campusx+100+days+of+machine+learning",
        description: "Rigorous mathematical intuition, gradient descent, feature engineering, and model deployment.",
        badge: "In-Depth Intuition",
      },
    ];
  }

  // 4. Python, Java, C++, Go, Rust & Backend Engineering
  if (
    text.includes("python") ||
    text.includes("java") ||
    text.includes("spring") ||
    text.includes("c++") ||
    text.includes("golang") ||
    text.includes("rust") ||
    text.includes("backend") ||
    text.includes("node") ||
    text.includes("express")
  ) {
    if (text.includes("java") || text.includes("spring")) {
      return [
        {
          title: "Java Full Course for Beginners to Advanced",
          channel: "Telusko / freeCodeCamp",
          url: "https://www.youtube.com/results?search_query=telusko+java+full+course+playlist",
          description: "Core Java, OOP principles, Collections framework, Multi-threading, and Spring Boot foundations.",
          badge: "Enterprise Standard",
        },
        {
          title: "Spring Boot 3 & Microservices Complete Tutorial",
          channel: "Amigoscode",
          url: "https://www.youtube.com/results?search_query=amigoscode+spring+boot+tutorial",
          description: "Build robust REST APIs, JPA/Hibernate persistence, Spring Security with JWT, and microservice architecture.",
          badge: "Backend Microservices",
        },
        {
          title: "Java & Data Structures Complete Series",
          channel: "Kunal Kushwaha",
          url: "https://www.youtube.com/results?search_query=kunal+kushwaha+java+dsa+playlist",
          description: "In-depth Java walkthroughs with recursion, OOPs, Git, and interview coding challenges.",
          badge: "Interview Centric",
        },
      ];
    }

    return [
      {
        title: "Python for Beginners (Full Comprehensive Masterclass)",
        channel: "freeCodeCamp.org",
        url: "https://www.youtube.com/results?search_query=freecodecamp+python+for+beginners+course",
        description: "Complete programming fundamentals: data structures, object-oriented design, modules, and API integration.",
        badge: "Global Standard",
      },
      {
        title: "Python Foundation & Real World Projects Series",
        channel: "Chai aur Code",
        url: "https://www.youtube.com/results?search_query=chai+aur+code+python+series",
        description: "Learn Python through live building: virtual environments, decorators, generators, SQLite, and scripts.",
        badge: "Hands-on Practical",
      },
      {
        title: "Node.js & Backend System Architecture Course",
        channel: "freeCodeCamp.org / Piyush Garg",
        url: "https://www.youtube.com/results?search_query=piyush+garg+nodejs+full+course",
        description: "Event loop, streams, RESTful APIs, authentication, MongoDB/PostgreSQL, and real-time WebSockets.",
        badge: "Full Backend",
      },
    ];
  }

  // 5. Cloud, DevOps, Docker, Kubernetes & System Design
  if (
    text.includes("cloud") ||
    text.includes("devops") ||
    text.includes("docker") ||
    text.includes("kubernetes") ||
    text.includes("aws") ||
    text.includes("azure") ||
    text.includes("linux") ||
    text.includes("system design")
  ) {
    return [
      {
        title: "DevOps & Docker / Kubernetes Complete Bootcamp",
        channel: "TechWorld with Nana",
        url: "https://www.youtube.com/results?search_query=techworld+with+nana+devops+docker+kubernetes",
        description: "Top-tier animated tutorials explaining containers, image optimization, Kubernetes pods, and CI/CD pipelines.",
        badge: "Industry Favorite",
      },
      {
        title: "System Design for High Scale Applications",
        channel: "Gaurav Sen",
        url: "https://www.youtube.com/results?search_query=gaurav+sen+system+design+playlist",
        description: "Master load balancing, message queues (Kafka), caching (Redis), CAP theorem, and distributed databases.",
        badge: "Architect Level",
      },
      {
        title: "AWS Certified Solutions Architect Course (Hands-on Labs)",
        channel: "freeCodeCamp.org",
        url: "https://www.youtube.com/results?search_query=freecodecamp+aws+solutions+architect+full+course",
        description: "Practical AWS training covering EC2, S3, IAM, Lambda, VPC networking, and cloud security.",
        badge: "Cloud Certification",
      },
    ];
  }

  // 6. Data Analytics, SQL, Power BI, Excel & Tableau
  if (
    text.includes("data analyst") ||
    text.includes("data analytics") ||
    text.includes("sql") ||
    text.includes("power bi") ||
    text.includes("tableau") ||
    text.includes("excel")
  ) {
    return [
      {
        title: "Complete Data Analyst Bootcamp & Portfolio Projects",
        channel: "Alex The Analyst",
        url: "https://www.youtube.com/results?search_query=alex+the+analyst+data+analyst+bootcamp",
        description: "The complete roadmap: SQL querying, Excel data modeling, Tableau/Power BI dashboards, and resume advice.",
        badge: "Job Ready Career",
      },
      {
        title: "SQL Tutorial Full Database Course for Beginners",
        channel: "freeCodeCamp.org",
        url: "https://www.youtube.com/results?search_query=freecodecamp+sql+tutorial+full+course",
        description: "Relational database schema design, JOINS, GROUP BY, aggregations, CTEs, and window functions.",
        badge: "Core Database Skill",
      },
      {
        title: "Power BI Interactive Dashboards & Business Analytics",
        channel: "Chandoo",
        url: "https://www.youtube.com/results?search_query=chandoo+power+bi+dashboard+tutorial",
        description: "Transform complex raw business datasets into executive KPI cards, charts, and interactive drill-downs.",
        badge: "Executive Dashboards",
      },
    ];
  }

  // 7. Mobile Development: Flutter, Android (Kotlin), React Native, iOS (Swift)
  if (
    text.includes("flutter") ||
    text.includes("android") ||
    text.includes("kotlin") ||
    text.includes("mobile") ||
    text.includes("react native") ||
    text.includes("ios") ||
    text.includes("swift")
  ) {
    return [
      {
        title: "Flutter & Dart Complete Guide (Cross-Platform Mobile Apps)",
        channel: "freeCodeCamp.org / Rivaan Ranawat",
        url: "https://www.youtube.com/results?search_query=flutter+full+course+for+beginners+playlist",
        description: "Build iOS and Android apps with widgets, state management (Bloc/Provider), Firebase backend, and animations.",
        badge: "Cross-Platform",
      },
      {
        title: "Modern Android App Development with Kotlin & Jetpack Compose",
        channel: "Philipp Lackner",
        url: "https://www.youtube.com/results?search_query=philipp+lackner+jetpack+compose+playlist",
        description: "Clean architecture, MVVM pattern, Retrofit network calls, Coroutines, and modern declarative UI.",
        badge: "Modern Android",
      },
      {
        title: "React Native Full Course for iOS & Android",
        channel: "freeCodeCamp / JavaScript Mastery",
        url: "https://www.youtube.com/results?search_query=javascript+mastery+react+native+full+course",
        description: "Build native mobile experiences using JavaScript, Expo, tailwind styling, and real-time backend services.",
        badge: "Industry Projects",
      },
    ];
  }

  // 8. Cybersecurity, Ethical Hacking & Networking
  if (
    text.includes("cyber") ||
    text.includes("security") ||
    text.includes("hacking") ||
    text.includes("network") ||
    text.includes("penetration") ||
    text.includes("soc")
  ) {
    return [
      {
        title: "Complete Ethical Hacking & Cybersecurity Course",
        channel: "NetworkChuck",
        url: "https://www.youtube.com/results?search_query=networkchuck+ethical+hacking+full+course",
        description: "Hands-on tutorials: Kali Linux, Wireshark packet analysis, port scanning, VPNs, and foundational networking.",
        badge: "Most Engaging",
      },
      {
        title: "CompTIA Security+ / Cyber Defense Training",
        channel: "Professor Messer",
        url: "https://www.youtube.com/results?search_query=professor+messer+security+plus+training+course",
        description: "Structured industry-standard certification prep covering threats, vulnerabilities, cryptography, and risk management.",
        badge: "Certification Standard",
      },
      {
        title: "Practical Bug Bounty & Web Security Walkthroughs",
        channel: "John Hammond",
        url: "https://www.youtube.com/results?search_query=john+hammond+cybersecurity+walkthroughs",
        description: "Capture the Flag (CTF) challenges, malware analysis, OSINT techniques, and real-world vulnerability testing.",
        badge: "Hands-on Labs",
      },
    ];
  }

  // 9. Finance, Investment Banking, Stock Market, CA & CFA
  if (
    text.includes("finance") ||
    text.includes("stock") ||
    text.includes("investment") ||
    text.includes("banking") ||
    text.includes("ca") ||
    text.includes("cfa") ||
    text.includes("accounting")
  ) {
    return [
      {
        title: "Basics of Stock Market & Fundamental Company Analysis",
        channel: "CA Rachana Ranade",
        url: "https://www.youtube.com/results?search_query=ca+rachana+ranade+basics+of+stock+market",
        description: "Learn how to read financial reports, calculate key financial ratios, and evaluate company business models.",
        badge: "Market Literacy",
      },
      {
        title: "Financial Modeling & Valuation Complete Course",
        channel: "Corporate Finance Institute (CFI)",
        url: "https://www.youtube.com/results?search_query=financial+modeling+valuation+full+course+youtube",
        description: "Three-statement financial models, discounted cash flow (DCF), LBO analysis, and merger models.",
        badge: "Investment Banking",
      },
      {
        title: "CFA Level 1 & Corporate Finance Lectures",
        channel: "Mark Meldrum / AnalystPrep",
        url: "https://www.youtube.com/results?search_query=cfa+level+1+finance+lectures+playlist",
        description: "Global finance principles: equity investments, portfolio management, quantitative methods, and fixed income.",
        badge: "Global Finance",
      },
    ];
  }

  // 10. UI/UX Design, Figma & Product Management
  if (
    text.includes("design") ||
    text.includes("ui/ux") ||
    text.includes("figma") ||
    text.includes("product management") ||
    text.includes("wireframing")
  ) {
    return [
      {
        title: "Figma UI/UX Design Complete Masterclass",
        channel: "Mizko (The Designership)",
        url: "https://www.youtube.com/results?search_query=mizko+figma+ui+ux+tutorial+course",
        description: "Master auto-layout, design tokens, responsive typography, component libraries, and interactive prototyping.",
        badge: "Design Masterclass",
      },
      {
        title: "UI/UX Design Process & Case Study Creation",
        channel: "DesignCourse (Gary Simon)",
        url: "https://www.youtube.com/results?search_query=designcourse+ui+ux+full+course",
        description: "User research, information architecture, visual hierarchy, micro-interactions, and portfolio presentation.",
        badge: "Portfolio Ready",
      },
      {
        title: "Product Management Frameworks & Mock Interviews",
        channel: "Exponent",
        url: "https://www.youtube.com/results?search_query=exponent+product+management+interview+prep",
        description: "Product execution, user problem framing, metrics definition, roadmap prioritization, and PRD writing.",
        badge: "PM Career",
      },
    ];
  }

  // 11. Competitive & Entrance Exams (JEE / NEET / GATE / CAT / UPSC)
  if (
    text.includes("jee") ||
    text.includes("neet") ||
    text.includes("gate") ||
    text.includes("cat") ||
    text.includes("upsc") ||
    text.includes("entrance") ||
    text.includes("exam")
  ) {
    return [
      {
        title: "Concept Revision & Speed Problem Solving",
        channel: "Physics Wallah / Unacademy",
        url: "https://www.youtube.com/results?search_query=physics+wallah+concept+revision+lectures",
        description: "Formula sheets, high-frequency exam questions, and previous year paper step-by-step solutions.",
        badge: "Exam Strategies",
      },
      {
        title: "Core Computer Science & Engineering for GATE",
        channel: "Gate Smashers",
        url: "https://www.youtube.com/results?search_query=gate+smashers+operating+systems+dbms+networks",
        description: "Crisp explanations for OS, DBMS, Computer Networks, and Theory of Computation.",
        badge: "GATE Top Rank",
      },
      {
        title: "Aptitude, Quantitative Analysis & Logical Reasoning",
        channel: "Rodha (Ravi Prakash)",
        url: "https://www.youtube.com/results?search_query=rodha+cat+quant+dilr+playlist",
        description: "Deep problem solving for analytical aptitude, number systems, algebra, and DILR sets.",
        badge: "Aptitude Prep",
      },
    ];
  }

  // 12. Dynamic Fallback: generates curated search link for exact skill topic
  const query = encodeURIComponent(`${skillName} tutorial course playlist`);
  return [
    {
      title: `${skillName} — Complete Video Tutorial Playlist`,
      channel: "Top Community Video Guides",
      url: `https://www.youtube.com/results?search_query=${query}`,
      description: `Watch high-ranking, community-rated YouTube course playlists covering ${skillName} from foundation to advanced.`,
      badge: "Targeted Series",
    },
    {
      title: `${skillName} Crash Course & Practical Walkthrough`,
      channel: "freeCodeCamp / Tech Tutorials",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skillName} full course for beginners`)}`,
      description: `Step-by-step masterclass to learn core concepts, practical syntax, and hands-on projects for ${skillName}.`,
      badge: "Full Course",
    },
    {
      title: `${skillName} Top Interview & Practice Questions`,
      channel: "Industry Mentors",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skillName} interview questions practice`)}`,
      description: `Common interview problems, real-world case studies, and practical tips to master ${skillName}.`,
      badge: "Job Ready",
    },
  ];
}

/**
 * Returns authentic, highly curated YouTube learning resources for any milestone,
 * skill, or interest area.
 */
export function getYoutubeResourcesForMilestone(
  milestoneTitle: string,
  milestoneCategory?: string,
  targetSkill?: string,
): YouTubeResource[] {
  const combinedText = `${milestoneTitle} ${milestoneCategory ?? ""} ${targetSkill ?? ""}`.trim();
  return getYoutubeResourcesForSkill(combinedText);
}
