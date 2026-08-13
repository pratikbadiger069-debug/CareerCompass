/**
 * CareerCompass — career-map domain data (India focused).
 *
 * Self-contained, dependency-free data used by the dashboard explorer.
 * Everything is plain typed data so it can be copied into another project
 * or extended without touching UI code.
 *
 * Model:
 *   StreamPath   — a stream / stage you can be at (e.g. MPC, B.Tech, Commerce)
 *     options[]  — the usual forward moves (exams, courses, careers)
 *     backups[]  — what to do if the main option does not work out
 *     whatIf[]   — common failure / switch scenarios with concrete answers
 *   EXAM_CONNECTIONS — how one exam's preparation carries over to others
 *
 * NOTE: nothing here guarantees admission or a job. It is guidance, not a promise.
 */

export type PathOption = {
  /** Short label, e.g. "JEE Main" or "B.Tech CSE" */
  title: string;
  /** What this option is, in one line */
  description: string;
  kind: "education" | "exam" | "career" | "skill";
  /** Concrete next things to do */
  nextSteps: string[];
};

export type BackupPath = {
  title: string;
  description: string;
  /** Why this is a reasonable fallback */
  whyItWorks: string;
};

export type WhatIfScenario = {
  /** The worry, phrased the way a student would say it */
  question: string;
  /** Honest, practical answer */
  answer: string;
  /** Concrete alternatives to pursue */
  alternatives: string[];
};

export type StreamPath = {
  id: string;
  name: string;
  /** Where in the journey this sits */
  stage: "After Class 10" | "After Class 12" | "During UG" | "After UG";
  summary: string;
  /** Example courses/degrees typically taken from here */
  courses: string[];
  /** Entrance / government exams commonly attempted from here */
  exams: string[];
  /** Careers this path commonly leads to */
  careers: string[];
  options: PathOption[];
  backups: BackupPath[];
  whatIf: WhatIfScenario[];
};

export type ExamConnection = {
  exam: string;
  /** Other exams whose syllabus/preparation overlaps meaningfully */
  connectedExams: string[];
  note: string;
};

/** Maps onboarding `stream` values to a path id (best-effort). */
export const STREAM_VALUE_TO_PATH: Record<string, string> = {
  science_pcm: "mpc",
  science_pcb: "bipc",
  commerce: "commerce",
  arts: "humanities",
  engineering: "btech",
  medical: "bipc",
  business: "commerce",
  design: "humanities",
  other: "mpc",
};

export const CAREER_PATHS: StreamPath[] = [
  {
    id: "mpc",
    name: "MPC / Science (PCM)",
    stage: "After Class 10",
    summary:
      "Maths, Physics, Chemistry — the standard route into engineering, architecture, defence and pure sciences.",
    courses: [
      "B.Tech / B.E.",
      "B.Arch",
      "B.Sc (Maths / Physics / Statistics)",
      "Integrated M.Sc (IISER)",
      "B.Des",
    ],
    exams: [
      "JEE Main",
      "JEE Advanced",
      "BITSAT",
      "State CET (EAMCET / MHT-CET / KCET)",
      "VITEEE / SRMJEEE",
      "NDA",
      "NATA",
    ],
    careers: [
      "Software engineer",
      "Core engineer (mech / civil / electrical)",
      "Architect",
      "Data analyst",
      "Defence officer",
    ],
    options: [
      {
        title: "JEE Main",
        description:
          "National entrance for NITs, IIITs, GFTIs and the gateway to JEE Advanced (IITs).",
        kind: "exam",
        nextSteps: [
          "Finish NCERT Class 11 and 12 Physics, Chemistry, Maths thoroughly",
          "Attempt previous 10 years' papers under timed conditions",
          "Register for both the January and April sessions",
        ],
      },
      {
        title: "BITSAT",
        description:
          "Separate entrance for BITS Pilani / Goa / Hyderabad — speed-focused, adds English and logical reasoning.",
        kind: "exam",
        nextSteps: [
          "Add English and logical reasoning practice on top of JEE prep",
          "Practise high-speed mock tests (accuracy plus pace)",
        ],
      },
      {
        title: "State CET",
        description:
          "State-level engineering entrances with home-state quota — usually less competition than JEE.",
        kind: "exam",
        nextSteps: [
          "Check your state's eligibility and domicile rules",
          "Reuse the same PCM syllabus base",
        ],
      },
      {
        title: "B.Sc and research route",
        description:
          "Pure sciences via IISER / NISER / central universities, leading to M.Sc, research and teaching.",
        kind: "education",
        nextSteps: [
          "Look at IAT (IISER) and CUET",
          "Explore research fellowships and summer internships",
        ],
      },
    ],
    backups: [
      {
        title: "Private / state engineering colleges",
        description:
          "Admission via state CET or institute entrances such as VITEEE, SRMJEEE, COMEDK.",
        whyItWorks:
          "Same B.Tech degree; outcomes depend far more on your skills than on the college tier.",
      },
      {
        title: "B.Sc then M.Sc / MCA",
        description:
          "Start with a science degree and move into computing or research at postgraduate level.",
        whyItWorks: "MCA and M.Sc CS reach the same software roles without an engineering seat.",
      },
      {
        title: "Design or architecture",
        description: "B.Des via UCEED / NID, or B.Arch via NATA.",
        whyItWorks:
          "Uses your existing stream eligibility while switching to a portfolio-driven career.",
      },
      {
        title: "Defence / government track",
        description: "NDA after Class 12, or SSC / Railways / Banking exams after graduation.",
        whyItWorks: "Merit-based entry that does not depend on engineering ranks at all.",
      },
    ],
    whatIf: [
      {
        question: "What if I don't clear JEE Main?",
        answer:
          "It is a common outcome and not the end of engineering. State CETs, BITSAT and private entrances run on the same syllabus, and a drop year is only worth it if you can honestly commit a full year.",
        alternatives: [
          "Attempt BITSAT and your state CET",
          "Join a good state / private college and focus on skills",
          "Consider B.Sc followed by MCA",
          "Take one focused drop year",
        ],
      },
      {
        question: "What if I lose interest in Maths?",
        answer:
          "Move early rather than late. Commerce-side and design-side entries are still open right after Class 12 through CUET, IPMAT, UCEED and NID.",
        alternatives: [
          "BBA / B.Com via CUET or IPMAT",
          "B.Des via UCEED / NID",
          "BCA (lighter on maths than B.Tech)",
        ],
      },
      {
        question: "What if my family can't afford a private college?",
        answer:
          "Prioritise government seats: NITs / IIITs, state universities and CUET-based central universities cost far less, and scholarships plus education loans are widely available.",
        alternatives: [
          "State government colleges via CET",
          "CUET-based central universities",
          "Merit and state scholarships",
          "Open / distance B.Sc plus certifications",
        ],
      },
    ],
  },
  {
    id: "bipc",
    name: "BiPC / Science (PCB)",
    stage: "After Class 10",
    summary:
      "Biology, Physics, Chemistry — medicine, allied health, life sciences, agriculture and pharmacy.",
    courses: [
      "MBBS / BDS",
      "BAMS / BHMS",
      "B.Sc Nursing",
      "B.Pharm",
      "B.Sc Agriculture",
      "BPT / allied health",
      "B.Sc Biotechnology",
    ],
    exams: ["NEET-UG", "ICAR AIEEA", "CUET", "Nursing entrances", "GPAT (after B.Pharm)"],
    careers: [
      "Doctor",
      "Dentist",
      "Pharmacist",
      "Nurse",
      "Physiotherapist",
      "Biotech researcher",
      "Agriculture officer",
    ],
    options: [
      {
        title: "NEET-UG",
        description:
          "The single entrance for MBBS, BDS, AYUSH, veterinary and most nursing seats in India.",
        kind: "exam",
        nextSteps: [
          "Master NCERT Biology line by line",
          "Take time-bound full-syllabus mocks",
          "Track state vs all-India quota counselling",
        ],
      },
      {
        title: "Allied health degrees",
        description:
          "Nursing, physiotherapy, radiology, lab technology — clinical careers without MBBS.",
        kind: "education",
        nextSteps: [
          "Shortlist government colleges and their entrances",
          "Check clinical internship requirements",
        ],
      },
      {
        title: "Pharmacy and biotech",
        description:
          "B.Pharm / B.Sc Biotech leading to industry, research or higher study via GPAT / GATE-BT.",
        kind: "education",
        nextSteps: [
          "Compare B.Pharm vs B.Sc Biotech outcomes",
          "Look for lab internships from year 1",
        ],
      },
    ],
    backups: [
      {
        title: "B.Sc Life Sciences then M.Sc",
        description: "Research and academia route via central universities (CUET) and CSIR-NET.",
        whyItWorks: "Keeps you in science and opens research, teaching and pharma-industry roles.",
      },
      {
        title: "Agriculture and veterinary",
        description: "B.Sc Agriculture or B.V.Sc via ICAR AIEEA, with government job pathways.",
        whyItWorks: "Less crowded than NEET, with clear public-sector recruitment afterwards.",
      },
      {
        title: "Healthcare management / public health",
        description: "BBA-Healthcare, or an MPH later, for non-clinical hospital and NGO roles.",
        whyItWorks: "Stays in the health sector without needing a medical seat.",
      },
    ],
    whatIf: [
      {
        question: "What if I don't clear NEET?",
        answer:
          "Only a small fraction of NEET aspirants get government MBBS seats, so plan a parallel track from the start. Allied health, pharmacy, biotech and agriculture all keep you in the field.",
        alternatives: [
          "B.Sc Nursing or BPT",
          "B.Pharm / Pharm.D",
          "B.Sc Agriculture via ICAR",
          "One planned drop year with a mock-test target",
        ],
      },
      {
        question: "What if I can't afford a private medical seat?",
        answer:
          "Private MBBS fees are very high. Government allied-health and nursing seats cost a fraction and lead to employable clinical careers.",
        alternatives: [
          "Government nursing / paramedical colleges",
          "AYUSH government seats",
          "B.Sc plus M.Sc research route with fellowships",
        ],
      },
    ],
  },
  {
    id: "btech",
    name: "B.Tech / Engineering (during UG)",
    stage: "During UG",
    summary:
      "You are inside an engineering degree. The goal now is employability: skills, internships and a clear post-degree route.",
    courses: [
      "M.Tech / MS",
      "MBA",
      "Specialisations (data, cloud, embedded)",
      "Professional certifications",
    ],
    exams: [
      "GATE",
      "CAT / XAT",
      "GRE / IELTS / TOEFL",
      "UPSC CSE / ESE",
      "SSC CGL",
      "IBPS PO",
      "RRB JE",
    ],
    careers: [
      "Software engineer",
      "Data analyst / ML engineer",
      "Core / design engineer",
      "PSU engineer",
      "Product or project manager",
      "Photographer",
      "Musician / dancer",
      "Civil servant",
    ],
    options: [
      {
        title: "Software and IT roles",
        description: "Placement or off-campus hiring into development, data, testing or cloud roles.",
        kind: "career",
        nextSteps: [
          "Build 2-3 real projects and publish them on GitHub",
          "Practise DSA consistently rather than in bursts",
          "Do at least one internship before final year",
        ],
      },
      {
        title: "Core engineering / PSU via GATE",
        description:
          "A GATE score opens M.Tech admission and PSU recruitment (BHEL, IOCL, ONGC and similar).",
        kind: "exam",
        nextSteps: [
          "Start GATE prep in 3rd year",
          "Pick your GATE paper early",
          "Track PSU notifications that accept GATE scores",
        ],
      },
      {
        title: "Government exams",
        description:
          "UPSC CSE / ESE, SSC CGL, banking and railway exams are all open to engineering graduates.",
        kind: "exam",
        nextSteps: [
          "Pick one exam family and stay with it for a full cycle",
          "Build a daily current-affairs habit",
        ],
      },
      {
        title: "Creative careers — photography, dance, music",
        description:
          "A serious alternative, not a hobby fallback: freelance, content, teaching, events and studio work.",
        kind: "skill",
        nextSteps: [
          "Build a public portfolio or channel with consistent output",
          "Take paid work early, even small gigs, to test demand",
          "Consider a formal short course to speed up credibility",
        ],
      },
      {
        title: "Higher study — MBA or MS",
        description: "CAT for an Indian MBA; GRE / IELTS for an MS abroad.",
        kind: "education",
        nextSteps: [
          "Decide by 3rd year — the prep timelines differ a lot",
          "Budget realistically, including loans",
        ],
      },
    ],
    backups: [
      {
        title: "Skill-first job switch",
        description: "Certifications in cloud, data analytics, testing or cybersecurity.",
        whyItWorks: "These roles hire on demonstrable skill and projects rather than college brand.",
      },
      {
        title: "M.Tech via GATE",
        description: "An academic step that also unlocks PSU jobs and research assistantships.",
        whyItWorks: "Uses the year productively while adding a credential and often a stipend.",
      },
      {
        title: "Government exam track",
        description: "SSC CGL, banking, RRB JE and state PSC roles.",
        whyItWorks: "Clear selection criteria that ignore your branch or CGPA.",
      },
      {
        title: "Creative / self-employed track",
        description: "Photography, music, dance, design or content as primary income.",
        whyItWorks: "Portfolio-driven fields reward consistent output; your degree still stays on your CV.",
      },
    ],
    whatIf: [
      {
        question: "What if I don't get placed on campus?",
        answer:
          "Off-campus hiring continues all year. Convert the gap into a skill sprint plus internships — most first jobs after a missed placement come from projects, referrals and steady applications.",
        alternatives: [
          "Off-campus applications and referrals",
          "An internship to build real experience",
          "GATE and M.Tech",
          "Government exam preparation",
        ],
      },
      {
        question: "What if I don't enjoy software at all?",
        answer:
          "Engineering degrees are accepted almost everywhere. You can move to core engineering, management, government service or a creative field without wasting the degree.",
        alternatives: [
          "Core engineering via GATE",
          "MBA via CAT",
          "UPSC / SSC track",
          "Photography, dance or music as a professional path",
        ],
      },
      {
        question: "What if I have backlogs or a low CGPA?",
        answer:
          "Clear backlogs first — many recruiters and exams have hard cutoffs. After that, projects, internships and exam scores matter more than CGPA.",
        alternatives: [
          "Clear backlogs at the next attempt",
          "Target employers without CGPA filters",
          "GATE and government exams (CGPA-agnostic)",
          "Freelance work to build proof",
        ],
      },
      {
        question: "What if I want to switch to a creative career?",
        answer:
          "Test it before you commit. Run it alongside your degree for two or three semesters — if you can earn from it consistently, scaling up becomes a reasonable decision.",
        alternatives: [
          "Build a portfolio and take paid gigs",
          "Assist an established professional",
          "A formal short course in photography, music or dance",
          "Keep a part-time technical income while you build",
        ],
      },
    ],
  },
  {
    id: "commerce",
    name: "Commerce",
    stage: "After Class 10",
    summary:
      "Accounts, business studies and economics — finance, professional courses, management and government roles.",
    courses: ["B.Com / B.Com (Hons)", "BBA", "CA / CS / CMA", "BMS", "Integrated BBA-MBA (IPM)"],
    exams: [
      "CUET",
      "CA Foundation",
      "CS Executive Entrance",
      "CMA Foundation",
      "IPMAT",
      "CAT (after graduation)",
      "SSC CGL",
      "IBPS PO",
    ],
    careers: [
      "Chartered accountant",
      "Financial analyst",
      "Banker",
      "Company secretary",
      "Business analyst",
      "Entrepreneur",
      "Government officer",
    ],
    options: [
      {
        title: "CA / CMA / CS",
        description: "Professional qualifications you can start right after Class 12, alongside B.Com.",
        kind: "education",
        nextSteps: [
          "Register for the foundation level early",
          "Plan articleship timelines",
          "Keep B.Com running as a parallel degree",
        ],
      },
      {
        title: "BBA / IPM then MBA",
        description: "Management route via CUET, IPMAT and later CAT.",
        kind: "education",
        nextSteps: [
          "Practise quant and logical reasoning for IPMAT / CAT",
          "Look for internships from year 1",
        ],
      },
      {
        title: "Banking and government exams",
        description: "IBPS PO / Clerk, SBI, RBI Grade B and SSC CGL are all commerce-friendly.",
        kind: "exam",
        nextSteps: [
          "Pick one exam family",
          "Build daily quant, English and current-affairs practice",
        ],
      },
    ],
    backups: [
      {
        title: "B.Com plus certifications",
        description: "Tally, GST, advanced Excel or financial modelling.",
        whyItWorks: "Employable finance-operations roles that do not require clearing CA.",
      },
      {
        title: "Data / business analytics",
        description: "Analytics roles built on Excel, SQL and a BI tool.",
        whyItWorks: "Commerce students already have business context; the tools are learnable in months.",
      },
      {
        title: "Government and banking",
        description: "Public-sector selection through written exams.",
        whyItWorks: "Independent of CA attempts and college brand.",
      },
    ],
    whatIf: [
      {
        question: "What if I can't clear CA?",
        answer:
          "CA has low pass rates at every level and many candidates take several attempts. Your B.Com plus articleship experience is already valuable in accounting, audit-support and finance-operations roles.",
        alternatives: [
          "Finish B.Com and take finance-operations roles",
          "Switch to CMA or CS",
          "Analytics and financial-modelling certifications",
          "MBA via CAT",
        ],
      },
      {
        question: "What if I want a non-finance career?",
        answer:
          "Commerce is not a lock-in. Management, marketing, HR, law (via CLAT after Class 12) and government service are all open.",
        alternatives: [
          "BBA / MBA in marketing or HR",
          "Integrated law via CLAT",
          "Digital marketing certifications",
          "SSC and state PSC exams",
        ],
      },
    ],
  },
  {
    id: "humanities",
    name: "Humanities / Arts",
    stage: "After Class 10",
    summary:
      "History, political science, psychology, literature, economics and design — civil services, law, media, psychology and social sciences.",
    courses: ["BA / BA (Hons)", "BA LLB", "B.Des", "BJMC (journalism)", "Psychology degrees", "B.Ed"],
    exams: [
      "CUET",
      "CLAT / AILET",
      "UCEED / NID DAT",
      "UPSC CSE (after graduation)",
      "State PSC",
      "UGC-NET",
    ],
    careers: [
      "Civil servant",
      "Lawyer",
      "Psychologist / counsellor",
      "Journalist",
      "Designer",
      "Teacher / academic",
      "Policy researcher",
      "Content professional",
    ],
    options: [
      {
        title: "Law via CLAT",
        description: "Five-year integrated BA LLB at NLUs and other law schools.",
        kind: "exam",
        nextSteps: [
          "Build reading speed and comprehension",
          "Practise legal reasoning sets",
          "Follow current affairs daily",
        ],
      },
      {
        title: "UPSC / State PSC",
        description: "Humanities subjects overlap heavily with the civil-services syllabus.",
        kind: "exam",
        nextSteps: [
          "Choose an optional subject aligned with your degree",
          "Start answer-writing practice in final year",
        ],
      },
      {
        title: "Design and media",
        description: "B.Des via UCEED / NID, or journalism and mass communication.",
        kind: "education",
        nextSteps: ["Build a portfolio of real work", "Prepare for design aptitude tests"],
      },
      {
        title: "Psychology and counselling",
        description:
          "BA / B.Sc Psychology then a masters and RCI-recognised training for clinical practice.",
        kind: "education",
        nextSteps: [
          "Check licensing requirements early",
          "Look for internships at clinics or NGOs",
        ],
      },
    ],
    backups: [
      {
        title: "Teaching and academia",
        description: "B.Ed plus CTET, or UGC-NET for college-level teaching and research.",
        whyItWorks: "A structured route that values subject depth.",
      },
      {
        title: "Content, communications and PR",
        description: "Writing, social media, brand communications and content strategy.",
        whyItWorks: "Hires on portfolio and writing quality rather than entrance ranks.",
      },
      {
        title: "Government and state exams",
        description: "SSC CGL / CHSL, state PSC and railway exams.",
        whyItWorks: "Open to any graduate and independent of stream.",
      },
    ],
    whatIf: [
      {
        question: "What if I don't clear UPSC?",
        answer:
          "Most aspirants don't, and the attempt window is limited. Cap your attempts in advance and keep a parallel qualification or job so those years still count for something.",
        alternatives: [
          "State PSC (larger intake)",
          "SSC CGL and similar exams",
          "UGC-NET and teaching",
          "Policy research or NGO roles",
        ],
      },
      {
        question: "What if people say arts has no scope?",
        answer:
          "Law, civil services, psychology, design, media and academia all start from humanities. Scope depends on the specific skill you build, not the stream label.",
        alternatives: [
          "Law via CLAT",
          "Design via UCEED / NID",
          "Psychology and counselling",
          "Journalism and content",
        ],
      },
    ],
  },
];

/**
 * Exam preparation overlaps — preparing for one exam materially helps
 * with the connected ones.
 */
export const EXAM_CONNECTIONS: ExamConnection[] = [
  {
    exam: "JEE Main",
    connectedExams: [
      "JEE Advanced",
      "BITSAT",
      "State CET (EAMCET / MHT-CET / KCET)",
      "VITEEE / SRMJEEE",
      "NDA (maths and physics)",
    ],
    note: "One PCM syllabus covers all of them; only the pattern, speed and extra sections differ.",
  },
  {
    exam: "GATE",
    connectedExams: [
      "M.Tech admissions (IITs / NITs)",
      "PSU recruitment (BHEL, IOCL, ONGC, PGCIL)",
      "UPSC ESE",
      "ISRO / BARC scientist exams",
      "JAM (for science graduates)",
    ],
    note: "Core-subject depth built for GATE transfers directly to ESE and PSU technical papers.",
  },
  {
    exam: "NEET-UG",
    connectedExams: [
      "Institutional medical entrances",
      "ICAR AIEEA (biology overlap)",
      "B.Sc Nursing entrances",
      "AYUSH counselling",
    ],
    note: "NCERT Biology is the shared base across nearly every life-science entrance.",
  },
  {
    exam: "CAT",
    connectedExams: ["XAT", "NMAT", "SNAP", "CMAT", "IIFT", "Bank PO quant sections"],
    note: "Quant, DILR and verbal preparation is reusable; each exam only re-weights the sections.",
  },
  {
    exam: "UPSC CSE",
    connectedExams: ["State PSC", "UPSC CAPF", "SSC CGL (GS overlap)", "UGC-NET (optional subject)"],
    note: "General studies and current affairs are the common core across all of these.",
  },
  {
    exam: "SSC CGL",
    connectedExams: ["SSC CHSL", "IBPS PO / Clerk", "RRB NTPC", "State subordinate services"],
    note: "Quant, reasoning, English and GK follow near-identical patterns across these exams.",
  },
  {
    exam: "CUET",
    connectedExams: ["IPMAT", "CLAT (English and GK overlap)", "Central university PG entrances"],
    note: "Domain plus general-aptitude prep opens several central-university routes at once.",
  },
];

/** Convenience lookup used by the dashboard explorer. */
export function getPathById(id: string): StreamPath | undefined {
  return CAREER_PATHS.find((p) => p.id === id);
}

/** Resolve an onboarding `stream` value (or undefined) to a path, with a safe default. */
export function resolvePathForStream(stream?: string | null): StreamPath {
  const id = (stream && STREAM_VALUE_TO_PATH[stream]) || "mpc";
  return getPathById(id) ?? CAREER_PATHS[0];
}
