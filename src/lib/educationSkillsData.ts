export type SkillPreset = {
  name: string;
  category: string;
  icon: string;
  prompt: string;
};

export type EducationLevelPreset = {
  stageId: string;
  shortLabel: string;
  label: string;
  subtext: string;
  skills: SkillPreset[];
};

export const EDUCATION_LEVEL_PRESETS: Record<string, EducationLevelPreset> = {
  class_10: {
    stageId: "class_10",
    shortLabel: "Class 10",
    label: "Class 10 (Secondary School)",
    subtext: "Choosing the right stream (Science, Commerce, Arts) & foundational skills",
    skills: [
      {
        name: "Science (PCM / MPC)",
        category: "Stream",
        icon: "📐",
        prompt: "Guide me on choosing Science with Physics, Chemistry & Math. What are the best engineering, architecture, and technology pathways, plus early entrance foundations?",
      },
      {
        name: "Science (PCB / BiPC)",
        category: "Stream",
        icon: "🩺",
        prompt: "Guide me on choosing Science with Biology, Physics & Chemistry. Detail medical (NEET-UG), pharmacy, biotechnology, and allied healthcare opportunities.",
      },
      {
        name: "Commerce with Maths",
        category: "Stream",
        icon: "📊",
        prompt: "Guide me on choosing Commerce with Mathematics. Outline roadmaps toward CA, Financial Analyst, Actuarial Science, and modern Fintech careers.",
      },
      {
        name: "Humanities & Arts",
        category: "Stream",
        icon: "⚖️",
        prompt: "Guide me on choosing Arts & Humanities. Detail Law (CLAT), Civil Services, Psychology, Journalism, and Design roadmaps.",
      },
      {
        name: "Foundational Coding & Python",
        category: "Skill",
        icon: "💻",
        prompt: "Foundational coding in Python and problem solving for a Class 10 student looking to get an early advantage in technology.",
      },
      {
        name: "Graphic Design & Digital Art",
        category: "Skill",
        icon: "🎨",
        prompt: "Starting with digital art, graphic design, and UI concepts alongside high school curriculum.",
      },
      {
        name: "Robotics & STEM Basics",
        category: "Skill",
        icon: "🤖",
        prompt: "Hands-on robotics, IoT, and microcontroller projects suitable for school students.",
      },
      {
        name: "Polytechnic / Technical Diploma",
        category: "Vocational",
        icon: "🛠️",
        prompt: "Exploring 3-year Polytechnic engineering diplomas for hands-on technical jobs and direct 2nd-year B.Tech lateral entry.",
      },
    ],
  },
  class_12: {
    stageId: "class_12",
    shortLabel: "Class 12",
    label: "Class 12 (Junior College / High School)",
    subtext: "College admissions, entrance exams (JEE/NEET/CUET/CLAT) & branch specialization",
    skills: [
      {
        name: "Computer Science & Artificial Intelligence",
        category: "Tech",
        icon: "💻",
        prompt: "Roadmap to target B.Tech in Computer Science & AI: top entrance exams, college selection criteria, and beginning modern programming.",
      },
      {
        name: "Data Science & Machine Learning",
        category: "Tech",
        icon: "🧠",
        prompt: "Roadmap to become a Data Scientist after 12th: undergraduate programs (B.Tech / B.Sc Data Science), math prerequisites, and programming stack.",
      },
      {
        name: "Medical / MBBS & Healthcare",
        category: "Medical",
        icon: "🩺",
        prompt: "MBBS career roadmap: NEET UG strategy, top government and private medical colleges, and backup biological science degrees.",
      },
      {
        name: "Chartered Accountancy (CA) & Finance",
        category: "Commerce",
        icon: "📈",
        prompt: "Roadmap to clear CA Foundation alongside B.Com / BBA, articleship planning, and high-paying corporate finance roles.",
      },
      {
        name: "Corporate Law (CLAT / NLUs)",
        category: "Law",
        icon: "⚖️",
        prompt: "Roadmap for 5-year Integrated B.A. LL.B / B.B.A. LL.B via CLAT, National Law Universities, and corporate legal practice.",
      },
      {
        name: "Product Design & UI/UX (B.Des)",
        category: "Design",
        icon: "🎨",
        prompt: "Roadmap to study B.Des through UCEED/NID/NIFT and start building a design portfolio in UI/UX and product interaction.",
      },
      {
        name: "Cybersecurity & Ethical Hacking",
        category: "Tech",
        icon: "🛡️",
        prompt: "Starting a career in Cybersecurity after 12th: networking fundamentals, industry certifications (CompTIA Security+), and college degrees.",
      },
      {
        name: "Investment Banking & Corporate Finance",
        category: "Finance",
        icon: "💰",
        prompt: "Roadmap to break into Investment Banking: top undergraduate colleges (SRCC, DU, St. Xavier's, IIM IPM), financial modeling, and internships.",
      },
    ],
  },
  ug_1: {
    stageId: "ug_1",
    shortLabel: "College UG (1st–2nd Yr)",
    label: "College Undergraduate (1st & 2nd Year)",
    subtext: "Building core skills, open-source projects, and landing first technical internships",
    skills: [
      {
        name: "Full Stack Web Development (MERN/Next.js)",
        category: "Dev",
        icon: "🌐",
        prompt: "Complete roadmap for Full Stack Web Development (React, Next.js, Node.js, databases) tailored for college students targeting competitive software internships.",
      },
      {
        name: "Data Structures & Algorithms (DSA)",
        category: "Interviews",
        icon: "⚡",
        prompt: "Systematic DSA problem-solving roadmap on LeetCode and Codeforces to clear product-based company coding rounds and online assessments.",
      },
      {
        name: "Generative AI & LLM Applications",
        category: "AI",
        icon: "🤖",
        prompt: "Practical GenAI engineering roadmap: Python, Hugging Face, LangChain, RAG architecture, and fine-tuning open-source models for real projects.",
      },
      {
        name: "Cloud Computing & AWS/GCP Foundations",
        category: "DevOps",
        icon: "☁️",
        prompt: "Cloud infrastructure roadmap: Linux commands, Docker containers, Kubernetes basics, and AWS Certified Cloud Practitioner / Solutions Architect Associate.",
      },
      {
        name: "Mobile App Development (Flutter/React Native)",
        category: "Dev",
        icon: "📱",
        prompt: "Cross-platform mobile app development roadmap, building full-scale portfolio applications, and landing app development internships.",
      },
      {
        name: "Quantitative Finance & Algorithmic Trading",
        category: "Finance",
        icon: "📊",
        prompt: "Quantitative finance roadmap: Python for financial data analysis, statistical modeling, backtesting trading strategies, and math foundations.",
      },
      {
        name: "VLSI & Semiconductor Chip Design",
        category: "Hardware",
        icon: "🔌",
        prompt: "Roadmap for Electronics / Electrical students to enter the semiconductor industry: Verilog, FPGA prototyping, CMOS design, and EDA tools.",
      },
      {
        name: "UPSC Civil Services Early Foundation",
        category: "Govt",
        icon: "🏛️",
        prompt: "Strategic preparation roadmap for UPSC Civil Services alongside undergraduate degree: NCERTs, newspaper reading, optional subject selection.",
      },
    ],
  },
  ug_mid: {
    stageId: "ug_mid",
    shortLabel: "College UG (2nd–3rd Yr)",
    label: "College Undergraduate (2nd & 3rd Year)",
    subtext: "Advanced internships, portfolio building, hackathons, and placement preparation",
    skills: [
      {
        name: "Full Stack Web Development (MERN/Next.js)",
        category: "Dev",
        icon: "🌐",
        prompt: "Complete roadmap for Full Stack Web Development (React, Next.js, Node.js, databases) tailored for college students targeting competitive software internships.",
      },
      {
        name: "Data Structures & Algorithms (DSA)",
        category: "Interviews",
        icon: "⚡",
        prompt: "Systematic DSA problem-solving roadmap on LeetCode and Codeforces to clear product-based company coding rounds and online assessments.",
      },
      {
        name: "Generative AI & LLM Applications",
        category: "AI",
        icon: "🤖",
        prompt: "Practical GenAI engineering roadmap: Python, Hugging Face, LangChain, RAG architecture, and fine-tuning open-source models for real projects.",
      },
      {
        name: "DevOps, CI/CD & Kubernetes",
        category: "DevOps",
        icon: "⚙️",
        prompt: "DevOps engineering roadmap: Docker, Kubernetes, GitHub Actions CI/CD pipelines, Terraform infrastructure as code, and cloud deployments.",
      },
      {
        name: "Data Engineering (SQL, Spark, Kafka)",
        category: "Data",
        icon: "🗄️",
        prompt: "Data Engineering roadmap: modern data stack, SQL mastery, pipeline orchestration with Airflow, Apache Spark, and distributed streaming.",
      },
      {
        name: "Product Management (APM Internships)",
        category: "Product",
        icon: "🎯",
        prompt: "Roadmap to land Associate Product Manager (APM) campus roles: product sense, user journey mapping, metrics frameworks, and PRD writing.",
      },
      {
        name: "GATE / CAT Structured Preparation",
        category: "Higher Ed",
        icon: "📚",
        prompt: "Structured preparation roadmap for GATE (M.Tech/PSUs) or CAT (IIM MBA) alongside 3rd year engineering and college academics.",
      },
      {
        name: "Blockchain & Smart Contract Dev",
        category: "Tech",
        icon: "⛓️",
        prompt: "Web3 engineering roadmap: Solidity, Ethereum smart contracts, security auditing, and building decentralized applications.",
      },
    ],
  },
  ug_final: {
    stageId: "ug_final",
    shortLabel: "UG Final Year",
    label: "College UG Final Year (Graduating Soon)",
    subtext: "Campus placement offers, off-campus hiring, job-ready portfolios, or MS/MBA abroad",
    skills: [
      {
        name: "System Design & Senior Coding Rounds",
        category: "Tech",
        icon: "🏗️",
        prompt: "Low-level (LLD) and high-level (HLD) system design roadmap for cracking Tier-1 and top multinational placement interviews.",
      },
      {
        name: "Full Stack Software Engineer (Job Ready)",
        category: "Tech",
        icon: "💻",
        prompt: "Rapid job-ready software engineer roadmap: 2 production-grade capstone projects, resume optimization, and mock technical interview rounds.",
      },
      {
        name: "MS Abroad in US/Europe (GRE/TOEFL/SOP)",
        category: "Study Abroad",
        icon: "✈️",
        prompt: "Roadmap for Master's degrees abroad in Computer Science / Engineering: university shortlisting, SOP drafting, and funding scholarships.",
      },
      {
        name: "Data Analyst & Business Intelligence",
        category: "Data",
        icon: "📊",
        prompt: "Fast-track Data Analyst roadmap: advanced SQL queries, Power BI / Tableau dashboards, business metrics, and portfolio case studies.",
      },
      {
        name: "Management Consulting & Case Frameworks",
        category: "Consulting",
        icon: "💼",
        prompt: "Roadmap to crack consulting campus placements: profitability cases, market entry frameworks, guesstimates, and partner round prep.",
      },
      {
        name: "Off-Campus Placement & Referral Strategy",
        category: "Careers",
        icon: "🚀",
        prompt: "Comprehensive off-campus placement strategy: cold outreach on LinkedIn, GitHub portfolio presentation, and targeted recruiter referrals.",
      },
    ],
  },
  working: {
    stageId: "working",
    shortLabel: "Working Professional",
    label: "Working Professional / Career Switcher",
    subtext: "Upskilling, promotion to senior roles, career pivot to high-growth tech or leadership",
    skills: [
      {
        name: "Career Pivot to AI & ML Engineer",
        category: "Switch",
        icon: "🧠",
        prompt: "Step-by-step career transition roadmap from non-AI or legacy tech into Machine Learning and GenAI engineering roles.",
      },
      {
        name: "Transition to Product Management",
        category: "Product",
        icon: "🎯",
        prompt: "Roadmap for software engineers, consultants, or business analysts to transition into Product Management (PM) roles.",
      },
      {
        name: "Cloud Solutions Architect (AWS / Azure)",
        category: "Cloud",
        icon: "☁️",
        prompt: "Solutions Architect roadmap: enterprise cloud migration, cost optimization, multi-cloud architectures, and certification.",
      },
      {
        name: "System Architect & Tech Lead",
        category: "Leadership",
        icon: "👔",
        prompt: "Roadmap to advance from Individual Contributor (SDE II) to Tech Lead / Engineering Manager with architectural ownership.",
      },
      {
        name: "Executive MBA / 1-Year MBA (ISB / IIM)",
        category: "MBA",
        icon: "🎓",
        prompt: "Roadmap for working professionals targeting 1-year Executive MBA programs (ISB PGP, IIM PGPX) via GMAT/GRE.",
      },
      {
        name: "High-Paying Remote Global Engineering",
        category: "Remote",
        icon: "🌍",
        prompt: "Roadmap to land USD remote software roles: asynchronous communication, open-source proof-of-work, and international contract consulting.",
      },
    ],
  },
  pg: {
    stageId: "pg",
    shortLabel: "Postgraduate / Master's",
    label: "Postgraduate / Master's Student",
    subtext: "Research publications, specialized corporate labs, R&D roles, or PhD opportunities",
    skills: [
      {
        name: "Applied AI Researcher / Scientist",
        category: "Research",
        icon: "🔬",
        prompt: "Roadmap for postgraduate students targeting industry R&D labs (Google Research, Microsoft, Meta FAIR) and academic research.",
      },
      {
        name: "Quantitative Research & Modeling",
        category: "Quant",
        icon: "📈",
        prompt: "Roadmap for mathematics, physics, and CS postgraduates targeting high-frequency quant funds and systematic trading.",
      },
      {
        name: "PhD Admissions & Academic Fellowship",
        category: "Academia",
        icon: "🎓",
        prompt: "Roadmap for research proposals, finding PhD advisors globally, and securing fully-funded fellowships.",
      },
      {
        name: "R&D Deep Tech Commercialization",
        category: "Tech",
        icon: "⚡",
        prompt: "Roadmap to transition academic thesis work into production-grade deep tech commercial products or startup ventures.",
      },
    ],
  },
  gap_year: {
    stageId: "gap_year",
    shortLabel: "Gap Year / Retake",
    label: "Gap Year / Career Break",
    subtext: "Targeted exam retake (JEE/NEET/GATE/CAT), skill bootcamps, and disciplined recovery",
    skills: [
      {
        name: "Exam Retake & Score Maximization",
        category: "Exams",
        icon: "🎯",
        prompt: "Disciplined gap year roadmap to maximize entrance exam score (JEE/NEET/CAT) with weekly revision and test-taking strategy.",
      },
      {
        name: "Intensive 6-Month Full Stack Bootcamp",
        category: "Skills",
        icon: "💻",
        prompt: "Intensive self-driven coding roadmap to go from scratch to hireable Full Stack Developer within 6 months.",
      },
      {
        name: "Data Science Project Portfolio",
        category: "Skills",
        icon: "📊",
        prompt: "Building 3 production-grade data science end-to-end projects to overcome gap year in resume screening.",
      },
      {
        name: "Freelancing & Startup Apprenticeship",
        category: "Real World",
        icon: "🚀",
        prompt: "Gaining real-world experience during gap year through freelance contracts and early-stage startup apprenticeships.",
      },
    ],
  },
};

export function getEduStageDetails(stageId?: string | null): EducationLevelPreset {
  if (!stageId) return EDUCATION_LEVEL_PRESETS["class_12"];
  return EDUCATION_LEVEL_PRESETS[stageId] || EDUCATION_LEVEL_PRESETS["class_12"];
}
