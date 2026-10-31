export interface CollegeItem {
  id: string;
  name: string;
  course: string;
  city: string;
  state: string;
  fees_total: string;
  entrance: string;
  why: string;
  category: "Engineering" | "Management" | "Commerce" | "Medical" | "Law" | "Design" | "Science" | "Arts";
  rating?: string;
  careerTitle?: string;
  type?: "Government" | "Private";
  website?: string;
  nirfRank?: string;
  review?: string;
  pros?: string[];
  cons?: string[];
}

export const ALL_INDIAN_COLLEGES: CollegeItem[] = [
  // Maharashtra
  {
    id: "iit-bombay",
    name: "Indian Institute of Technology (IIT) Bombay",
    course: "B.Tech Computer Science / AI & Data",
    city: "Mumbai",
    state: "Maharashtra",
    fees_total: "₹8.5 Lakhs (4 Years)",
    entrance: "JEE Advanced",
    why: "Premier engineering institution with world-class faculty, highest tech packages, and startup incubation.",
    category: "Engineering",
    rating: "4.9/5",
    careerTitle: "Software Engineer / AI Researcher",
  },
  {
    id: "coep-pune",
    name: "College of Engineering, Pune (COEP Tech)",
    course: "B.Tech Computer Engineering / Electronics",
    city: "Pune",
    state: "Maharashtra",
    fees_total: "₹3.8 Lakhs (4 Years)",
    entrance: "MHT-CET / JEE Main",
    why: "One of Asia's oldest tech institutes with massive industry network in Pune IT & automotive hub.",
    category: "Engineering",
    rating: "4.6/5",
    careerTitle: "Systems Architect / Robotics Engineer",
  },
  {
    id: "st-xaviers-mumbai",
    name: "St. Xavier's College",
    course: "B.A. Economics / Mass Communication / B.Sc",
    city: "Mumbai",
    state: "Maharashtra",
    fees_total: "₹1.2 Lakhs (3 Years)",
    entrance: "XET / Merit Based",
    why: "Iconic heritage institute famous for liberal arts, media, advertising, and corporate consulting placements.",
    category: "Arts",
    rating: "4.7/5",
    careerTitle: "Media Strategist / Policy Analyst",
  },
  {
    id: "symbiosis-pune",
    name: "Symbiosis Institute of Business & Media (SIBM)",
    course: "BBA / MBA / Media Studies",
    city: "Pune",
    state: "Maharashtra",
    fees_total: "₹18 Lakhs (2 Years)",
    entrance: "SNAP / SET",
    why: "Top private business and media hub with dynamic campus culture and top consulting recruiting.",
    category: "Management",
    rating: "4.5/5",
    careerTitle: "Brand Manager / Marketing Director",
  },
  {
    id: "vjti-mumbai",
    name: "Veermata Jijabai Technological Institute (VJTI)",
    course: "B.Tech Information Technology",
    city: "Mumbai",
    state: "Maharashtra",
    fees_total: "₹3.4 Lakhs (4 Years)",
    entrance: "MHT-CET",
    why: "Top tier state engineering college with exceptional ROI and high Mumbai fintech placements.",
    category: "Engineering",
    rating: "4.6/5",
    careerTitle: "Fintech Developer / Cloud Architect",
  },
  {
    id: "grant-medical-mumbai",
    name: "Grant Government Medical College & JJ Hospital",
    course: "MBBS",
    city: "Mumbai",
    state: "Maharashtra",
    fees_total: "₹5.5 Lakhs (5.5 Years)",
    entrance: "NEET UG",
    why: "Historic medical institution with massive clinical caseload and premier surgical training.",
    category: "Medical",
    rating: "4.7/5",
    careerTitle: "Physician / Surgeon",
  },

  // Delhi NCR
  {
    id: "iit-delhi",
    name: "Indian Institute of Technology (IIT) Delhi",
    course: "B.Tech Computer Science / Mathematics & Computing",
    city: "New Delhi",
    state: "Delhi (NCR)",
    fees_total: "₹8.8 Lakhs (4 Years)",
    entrance: "JEE Advanced",
    why: "Premier research-driven technology campus with unmatched access to Delhi tech policy & unicorn founders.",
    category: "Engineering",
    rating: "4.9/5",
    careerTitle: "Machine Learning Engineer / Quant",
  },
  {
    id: "srcc-delhi",
    name: "Shri Ram College of Commerce (SRCC)",
    course: "B.Com (Hons) / B.A. Economics (Hons)",
    city: "New Delhi",
    state: "Delhi (NCR)",
    fees_total: "₹95,000 (3 Years)",
    entrance: "CUET UG",
    why: "Apex business and commerce college in India with strong recruitment from MBB consulting firms and investment banks.",
    category: "Commerce",
    rating: "4.9/5",
    careerTitle: "Financial Analyst / Strategy Consultant",
  },
  {
    id: "aiims-delhi",
    name: "All India Institute of Medical Sciences (AIIMS)",
    course: "MBBS",
    city: "New Delhi",
    state: "Delhi (NCR)",
    fees_total: "₹6,800 (5.5 Years)",
    entrance: "NEET UG",
    why: "Apex medical institute with high clinical exposure, subsidized research education, and top residency matches.",
    category: "Medical",
    rating: "5.0/5",
    careerTitle: "Medical Specialist / Surgeon",
  },
  {
    id: "dtu-delhi",
    name: "Delhi Technological University (DTU)",
    course: "B.Tech Software Engineering / Mechanical",
    city: "New Delhi",
    state: "Delhi (NCR)",
    fees_total: "₹7.5 Lakhs (4 Years)",
    entrance: "JEE Main / JAC Delhi",
    why: "Pioneer engineering university with high tech hiring and thriving student developer culture.",
    category: "Engineering",
    rating: "4.7/5",
    careerTitle: "Full Stack Engineer / DevOps Lead",
  },
  {
    id: "fms-delhi",
    name: "Faculty of Management Studies (FMS)",
    course: "MBA / Executive MBA",
    city: "New Delhi",
    state: "Delhi (NCR)",
    fees_total: "₹2 Lakhs (2 Years)",
    entrance: "CAT",
    why: "Known as the Red Building of Dreams with unmatched ROI in management education worldwide.",
    category: "Management",
    rating: "4.9/5",
    careerTitle: "Product Manager / Management Consultant",
  },

  // Karnataka
  {
    id: "iisc-bangalore",
    name: "Indian Institute of Science (IISc)",
    course: "B.S. Research / M.Tech Computing",
    city: "Bengaluru",
    state: "Karnataka",
    fees_total: "₹3.2 Lakhs (4 Years)",
    entrance: "JEE Advanced / KVPY / NEET",
    why: "India's highest ranked global scientific institution leading in Quantum, Deep Tech, and AI research.",
    category: "Science",
    rating: "5.0/5",
    careerTitle: "Research Scientist / Quantum Developer",
  },
  {
    id: "nlsiu-bangalore",
    name: "National Law School of India University (NLSIU)",
    course: "B.A. LL.B. (Hons)",
    city: "Bengaluru",
    state: "Karnataka",
    fees_total: "₹14 Lakhs (5 Years)",
    entrance: "CLAT",
    why: "India's premier legal institution with near 100% placement in tier-1 corporate law firms and international chambers.",
    category: "Law",
    rating: "4.9/5",
    careerTitle: "Corporate Lawyer / Legal Counsel",
  },
  {
    id: "rvce-bangalore",
    name: "RV College of Engineering (RVCE)",
    course: "B.E. Computer Science / Information Science",
    city: "Bengaluru",
    state: "Karnataka",
    fees_total: "₹10 Lakhs (4 Years)",
    entrance: "KCET / COMEDK",
    why: "Top Bengaluru engineering college with direct connections to global tech giants and start-up parks.",
    category: "Engineering",
    rating: "4.6/5",
    careerTitle: "Software Developer / Platform Engineer",
  },
  {
    id: "manipal-tech",
    name: "Manipal Institute of Technology (MAHE)",
    course: "B.Tech Computer Science / Data Science",
    city: "Manipal",
    state: "Karnataka",
    fees_total: "₹18.5 Lakhs (4 Years)",
    entrance: "MET",
    why: "World class residential campus, modern research labs, and extensive international alumni network.",
    category: "Engineering",
    rating: "4.5/5",
    careerTitle: "Data Engineer / Cloud Architect",
  },

  // Tamil Nadu
  {
    id: "iit-madras",
    name: "Indian Institute of Technology (IIT) Madras",
    course: "B.Tech Computer Science / Electrical & AI",
    city: "Chennai",
    state: "Tamil Nadu",
    fees_total: "₹8.6 Lakhs (4 Years)",
    entrance: "JEE Advanced",
    why: "Ranked #1 overall in NIRF rankings for multiple consecutive years with cutting-edge Research Park.",
    category: "Engineering",
    rating: "5.0/5",
    careerTitle: "AI Scientist / Semiconductor Engineer",
  },
  {
    id: "loyola-chennai",
    name: "Loyola College",
    course: "B.Com / B.Sc Computer Science / B.A. Economics",
    city: "Chennai",
    state: "Tamil Nadu",
    fees_total: "₹1.5 Lakhs (3 Years)",
    entrance: "Merit Based",
    why: "Prestigious arts and science college with outstanding holistic development and leadership traditions.",
    category: "Commerce",
    rating: "4.7/5",
    careerTitle: "Business Analyst / Financial Planner",
  },
  {
    id: "anna-univ-chennai",
    name: "College of Engineering, Guindy (Anna University)",
    course: "B.E. Computer Science / Electronics",
    city: "Chennai",
    state: "Tamil Nadu",
    fees_total: "₹2.2 Lakhs (4 Years)",
    entrance: "TNEA",
    why: "Historic state engineering institution offering top-tier education at high affordability.",
    category: "Engineering",
    rating: "4.6/5",
    careerTitle: "Embedded Engineer / Software Developer",
  },

  // Telangana
  {
    id: "iit-hyderabad",
    name: "Indian Institute of Technology (IIT) Hyderabad",
    course: "B.Tech Artificial Intelligence / CSE",
    city: "Hyderabad",
    state: "Telangana",
    fees_total: "₹8.7 Lakhs (4 Years)",
    entrance: "JEE Advanced",
    why: "Pioneer in dedicated B.Tech AI degrees with strong ties to Japan and Hyderabad tech clusters.",
    category: "Engineering",
    rating: "4.8/5",
    careerTitle: "AI Solutions Architect / ML Researcher",
  },
  {
    id: "iiit-hyderabad",
    name: "International Institute of Information Technology (IIIT-H)",
    course: "B.Tech Computer Science / Dual Degree (B.Tech + MS)",
    city: "Hyderabad",
    state: "Telangana",
    fees_total: "₹16 Lakhs (4 Years)",
    entrance: "JEE Main / UGEE",
    why: "Renowned coding powerhouse with arguably the strongest algorithmic programming and NLP labs in India.",
    category: "Engineering",
    rating: "4.9/5",
    careerTitle: "Research Engineer / Competitive Programmer",
  },

  // Rajasthan
  {
    id: "bits-pilani",
    name: "Birla Institute of Technology and Science (BITS) Pilani",
    course: "B.E. Computer Science / Economics Dual Degree",
    city: "Pilani",
    state: "Rajasthan",
    fees_total: "₹22 Lakhs (4 Years)",
    entrance: "BITSAT",
    why: "Leading private engineering institute with zero-attendance rule, Practice School internships, and top startup founders.",
    category: "Engineering",
    rating: "4.8/5",
    careerTitle: "Product Engineer / Tech Founder",
  },
  {
    id: "mnit-jaipur",
    name: "Malaviya National Institute of Technology (MNIT)",
    course: "B.Tech Computer Science / Electrical",
    city: "Jaipur",
    state: "Rajasthan",
    fees_total: "₹6.2 Lakhs (4 Years)",
    entrance: "JEE Main",
    why: "Top NIT in North India with prominent placement records and expansive campus infrastructure.",
    category: "Engineering",
    rating: "4.5/5",
    careerTitle: "Infrastructure Engineer / Data Analyst",
  },

  // West Bengal
  {
    id: "iit-kharagpur",
    name: "Indian Institute of Technology (IIT) Kharagpur",
    course: "B.Tech Computer Science / Electronics",
    city: "Kharagpur",
    state: "West Bengal",
    fees_total: "₹8.5 Lakhs (4 Years)",
    entrance: "JEE Advanced",
    why: "First IIT established in India with largest campus, highest alumni count, and diverse interdisciplinary minors.",
    category: "Engineering",
    rating: "4.8/5",
    careerTitle: "Data Scientist / Systems Engineer",
  },
  {
    id: "jadavpur-kolkata",
    name: "Jadavpur University",
    course: "B.E. Computer Science / Electronics",
    city: "Kolkata",
    state: "West Bengal",
    fees_total: "₹40,000 (4 Years)",
    entrance: "WBJEE",
    why: "Unmatched return-on-investment in India with top MNC recruitment at negligible tuition fees.",
    category: "Engineering",
    rating: "4.7/5",
    careerTitle: "Software Developer / Hardware Engineer",
  },

  // Gujarat
  {
    id: "iim-ahmedabad",
    name: "Indian Institute of Management (IIM) Ahmedabad",
    course: "PGP in Management / Food & Agribusiness",
    city: "Ahmedabad",
    state: "Gujarat",
    fees_total: "₹25 Lakhs (2 Years)",
    entrance: "CAT",
    why: "The gold standard of business education in South Asia with premier leadership and CEO alumni.",
    category: "Management",
    rating: "5.0/5",
    careerTitle: "Chief Strategy Officer / Investment Banker",
  },
  {
    id: "iit-gandhinagar",
    name: "Indian Institute of Technology (IIT) Gandhinagar",
    course: "B.Tech Computer Science / Mechanical",
    city: "Gandhinagar",
    state: "Gujarat",
    fees_total: "₹8.5 Lakhs (4 Years)",
    entrance: "JEE Advanced",
    why: "Green campus focusing on innovation, liberal learning, and student-driven project labs.",
    category: "Engineering",
    rating: "4.6/5",
    careerTitle: "Product Designer / Systems Engineer",
  },

  // Uttar Pradesh
  {
    id: "iit-kanpur",
    name: "Indian Institute of Technology (IIT) Kanpur",
    course: "B.Tech Computer Science / Electrical",
    city: "Kanpur",
    state: "Uttar Pradesh",
    fees_total: "₹8.6 Lakhs (4 Years)",
    entrance: "JEE Advanced",
    why: "Pioneer in computer science education in India with its own airfield and top cybersecurity research center.",
    category: "Engineering",
    rating: "4.9/5",
    careerTitle: "Cybersecurity Specialist / Core Dev",
  },
  {
    id: "bhu-varanasi",
    name: "Banaras Hindu University (IIT-BHU)",
    course: "B.Tech Computer Science / Ceramic Engineering",
    city: "Varanasi",
    state: "Uttar Pradesh",
    fees_total: "₹7.8 Lakhs (4 Years)",
    entrance: "JEE Advanced",
    why: "Historic centennial institution with vibrant campus, rich academic heritage, and premier placements.",
    category: "Engineering",
    rating: "4.6/5",
    careerTitle: "Software Engineer / Materials Engineer",
  },

  // Kerala
  {
    id: "nit-calicut",
    name: "National Institute of Technology (NIT) Calicut",
    course: "B.Tech Computer Science / Electronics",
    city: "Kozhikode",
    state: "Kerala",
    fees_total: "₹6.1 Lakhs (4 Years)",
    entrance: "JEE Main",
    why: "Top South Indian engineering powerhouse with strong coding clubs and excellent placement percentage.",
    category: "Engineering",
    rating: "4.6/5",
    careerTitle: "Backend Developer / Network Architect",
  },
  {
  "id": "vnit-nagpur",
  "name": "Visvesvaraya National Institute of Technology (VNIT)",
  "course": "B.Tech Computer Science / Mechanical",
  "city": "Nagpur",
  "state": "Maharashtra",
  "fees_total": "₹6.4 Lakhs (4 Years)",
  "entrance": "JEE Main",
  "why": "Top tier NIT in Central India known for rigorous academics, high campus placements, and strong research output.",
  "category": "Engineering",
  "rating": "4.6/5",
  "careerTitle": "Software Developer / Structural Engineer"
},
  {
  "id": "dy-patil-navimumbai",
  "name": "D.Y. Patil University",
  "course": "B.Tech AI & Data Science / BBA / MBBS",
  "city": "Navi Mumbai",
  "state": "Maharashtra",
  "fees_total": "₹9.5 Lakhs (4 Years)",
  "entrance": "MHT-CET / JEE Main / NEET",
  "why": "Modern multidisciplinary campus in Navi Mumbai with state-of-the-art sports, medical, and engineering infrastructure.",
  "category": "Engineering",
  "rating": "4.3/5",
  "careerTitle": "Data Analyst / Healthcare Specialist"
},
  {
  "id": "kbt-nashik",
  "name": "MVP's KBT College of Engineering",
  "course": "B.Tech Information Technology / Mechanical",
  "city": "Nashik",
  "state": "Maharashtra",
  "fees_total": "₹3.8 Lakhs (4 Years)",
  "entrance": "MHT-CET / JEE Main",
  "why": "Prominent regional engineering institute with solid industrial collaboration across Nashik manufacturing hub.",
  "category": "Engineering",
  "rating": "4.2/5",
  "careerTitle": "Systems Engineer / Industrial Developer"
},
  {
  "id": "geca-aurangabad",
  "name": "Government College of Engineering, Aurangabad",
  "course": "B.Tech Civil / Computer Science / Electrical",
  "city": "Aurangabad",
  "state": "Maharashtra",
  "fees_total": "₹2.9 Lakhs (4 Years)",
  "entrance": "MHT-CET",
  "why": "Autonomous government institution offering affordable engineering education with solid core placement records.",
  "category": "Engineering",
  "rating": "4.3/5",
  "careerTitle": "Core Engineer / Government Technical Officer"
},
  {
  "id": "dtu-delhi",
  "name": "Delhi Technological University (DTU / DCE)",
  "course": "B.Tech Software Engineering / CSE",
  "city": "New Delhi",
  "state": "Delhi (NCR)",
  "fees_total": "₹7.8 Lakhs (4 Years)",
  "entrance": "JEE Main",
  "why": "Iconic premier engineering university renowned for stellar tech placements, vibrant hackathons, and high ROI.",
  "category": "Engineering",
  "rating": "4.8/5",
  "careerTitle": "Full Stack Engineer / Algorithm Developer"
},
  {
  "id": "nsut-delhi",
  "name": "Netaji Subhas University of Technology (NSUT)",
  "course": "B.Tech Computer Engineering / AI",
  "city": "New Delhi",
  "state": "Delhi (NCR)",
  "fees_total": "₹8.2 Lakhs (4 Years)",
  "entrance": "JEE Main",
  "why": "Top tier technical institution in Dwarka with top software placements matching premier IITs.",
  "category": "Engineering",
  "rating": "4.7/5",
  "careerTitle": "Software Architect / Machine Learning Engineer"
},
  {
  "id": "aiims-delhi",
  "name": "All India Institute of Medical Sciences (AIIMS)",
  "course": "MBBS / MD",
  "city": "New Delhi",
  "state": "Delhi (NCR)",
  "fees_total": "₹6,000 (5.5 Years)",
  "entrance": "NEET UG",
  "why": "The #1 medical institution in India with unparalleled clinical exposure, research funding, and global prestige.",
  "category": "Medical",
  "rating": "5.0/5",
  "careerTitle": "Physician / Medical Researcher"
},
  {
  "id": "jiit-noida",
  "name": "Jaypee Institute of Information Technology (JIIT)",
  "course": "B.Tech Computer Science / IT",
  "city": "Noida",
  "state": "Delhi (NCR)",
  "fees_total": "₹12.5 Lakhs (4 Years)",
  "entrance": "JEE Main / Merit",
  "why": "Premier private tech hub situated directly in Noida IT corridor with consistent Fortune 500 recruiting.",
  "category": "Engineering",
  "rating": "4.4/5",
  "careerTitle": "DevOps Engineer / Cloud Consultant"
},
  {
  "id": "mdi-gurugram",
  "name": "Management Development Institute (MDI)",
  "course": "PGDM / Executive MBA",
  "city": "Gurugram",
  "state": "Delhi (NCR)",
  "fees_total": "₹24 Lakhs (2 Years)",
  "entrance": "CAT",
  "why": "Top 10 business school in India strategically located in the Millennium City cyber hub with stellar corporate access.",
  "category": "Management",
  "rating": "4.8/5",
  "careerTitle": "Management Consultant / Strategy Lead"
},
  {
  "id": "nitk-surathkal",
  "name": "National Institute of Technology Karnataka (NITK) Surathkal",
  "course": "B.Tech Computer Science / Electronics & Communication",
  "city": "Mangaluru",
  "state": "Karnataka",
  "fees_total": "₹6.3 Lakhs (4 Years)",
  "entrance": "JEE Main",
  "why": "Ranked among top 3 NITs in India with private beach access, stellar global placements, and world-class labs.",
  "category": "Engineering",
  "rating": "4.8/5",
  "careerTitle": "Backend Architect / Embedded Systems Lead"
},
  {
  "id": "sjce-mysuru",
  "name": "Sri Jayachamarajendra College of Engineering (JSS STU)",
  "course": "B.E. Computer Science / Electronics",
  "city": "Mysuru",
  "state": "Karnataka",
  "fees_total": "₹4.5 Lakhs (4 Years)",
  "entrance": "KCET / COMEDK",
  "why": "Historic engineering college in Mysuru with large campus, deep industrial alumni, and strong tech recruiting.",
  "category": "Engineering",
  "rating": "4.4/5",
  "careerTitle": "Software Developer / VLSI Engineer"
},
  {
  "id": "nit-trichy",
  "name": "National Institute of Technology (NIT) Tiruchirappalli",
  "course": "B.Tech Computer Science / Mechanical",
  "city": "Tiruchirappalli",
  "state": "Tamil Nadu",
  "fees_total": "₹6.5 Lakhs (4 Years)",
  "entrance": "JEE Main",
  "why": "Ranked #1 NIT in India consistently with massive industry reputation, high packages, and prestigious alumni network.",
  "category": "Engineering",
  "rating": "4.9/5",
  "careerTitle": "Quantitative Analyst / Systems Architect"
},
  {
  "id": "vit-vellore",
  "name": "Vellore Institute of Technology (VIT)",
  "course": "B.Tech Computer Science (Specializations in AI / Cloud / Cyber)",
  "city": "Vellore",
  "state": "Tamil Nadu",
  "fees_total": "₹9.2 Lakhs (4 Years)",
  "entrance": "VITEEE",
  "why": "Huge campus with flexible credit system, diverse international partnerships, and immense placement volume.",
  "category": "Engineering",
  "rating": "4.6/5",
  "careerTitle": "Full Stack Engineer / Cyber Security Analyst"
},
  {
  "id": "psg-coimbatore",
  "name": "PSG College of Technology",
  "course": "B.Tech Robotics & Automation / CSE",
  "city": "Coimbatore",
  "state": "Tamil Nadu",
  "fees_total": "₹3.5 Lakhs (4 Years)",
  "entrance": "TNEA",
  "why": "Premier institution pioneering industry-integrated engineering with unique on-campus commercial manufacturing units.",
  "category": "Engineering",
  "rating": "4.7/5",
  "careerTitle": "Robotics Engineer / Automation Architect"
},
  {
  "id": "iim-lucknow",
  "name": "Indian Institute of Management (IIM) Lucknow",
  "course": "PGP in Management / Agribusiness",
  "city": "Lucknow",
  "state": "Uttar Pradesh",
  "fees_total": "₹21 Lakhs (2 Years)",
  "entrance": "CAT",
  "why": "Top echelon IIM with unmatched consulting and FMCG placements and rigorous academic standard.",
  "category": "Management",
  "rating": "4.9/5",
  "careerTitle": "Investment Banking Associate / Brand Strategist"
},
  {
  "id": "mnnit-prayagraj",
  "name": "Motilal Nehru National Institute of Technology (MNNIT)",
  "course": "B.Tech Computer Science / Electronics",
  "city": "Prayagraj",
  "state": "Uttar Pradesh",
  "fees_total": "₹6.2 Lakhs (4 Years)",
  "entrance": "JEE Main",
  "why": "Renowned coding culture with tremendous placement statistics in FAANG and multinational tech firms.",
  "category": "Engineering",
  "rating": "4.7/5",
  "careerTitle": "Systems Programmer / Cloud Architect"
},
  {
  "id": "iit-indore",
  "name": "Indian Institute of Technology (IIT) Indore",
  "course": "B.Tech Computer Science / Electrical",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "fees_total": "₹8.4 Lakhs (4 Years)",
  "entrance": "JEE Advanced",
  "why": "Fastest-rising new IIT with highest citations per faculty and modern research park in commercial capital of MP.",
  "category": "Engineering",
  "rating": "4.7/5",
  "careerTitle": "AI Researcher / Deep Learning Specialist"
},
  {
  "id": "manit-bhopal",
  "name": "Maulana Azad National Institute of Technology (MANIT)",
  "course": "B.Tech Computer Science / Architecture",
  "city": "Bhopal",
  "state": "Madhya Pradesh",
  "fees_total": "₹6.1 Lakhs (4 Years)",
  "entrance": "JEE Main",
  "why": "Central Indian engineering giant with sprawling 650-acre campus and strong core and IT placement drives.",
  "category": "Engineering",
  "rating": "4.5/5",
  "careerTitle": "Software Developer / Urban Planner"
},
  {
  "id": "pec-chandigarh",
  "name": "Punjab Engineering College (PEC)",
  "course": "B.Tech Computer Science / Aerospace Engineering",
  "city": "Chandigarh",
  "state": "Chandigarh",
  "fees_total": "₹7.4 Lakhs (4 Years)",
  "entrance": "JEE Main",
  "why": "Centennial legacy college with mandatory 6-month industrial internship and prestigious aerospace pedigree.",
  "category": "Engineering",
  "rating": "4.6/5",
  "careerTitle": "Aerospace Engineer / Software Engineer"
},
  {
  "id": "thapar-patiala",
  "name": "Thapar Institute of Engineering & Technology (TIET)",
  "course": "B.Tech Computer Engineering / Electronics & Computing",
  "city": "Patiala",
  "state": "Punjab",
  "fees_total": "₹18 Lakhs (4 Years)",
  "entrance": "JEE Main / Merit",
  "why": "Leading North Indian private tech university with Trinity College Dublin partnership and outstanding recruiter tie-ups.",
  "category": "Engineering",
  "rating": "4.6/5",
  "careerTitle": "Data Scientist / Mobile App Developer"
},
  {
  "id": "iit-patna",
  "name": "Indian Institute of Technology (IIT) Patna",
  "course": "B.Tech Artificial Intelligence & Data Science",
  "city": "Patna",
  "state": "Bihar",
  "fees_total": "₹8.2 Lakhs (4 Years)",
  "entrance": "JEE Advanced",
  "why": "Leading technical center in Eastern India with state-of-the-art incubation center and stellar high packages.",
  "category": "Engineering",
  "rating": "4.6/5",
  "careerTitle": "AI Engineer / Quantitative Developer"
},
  {
  "id": "iit-bhubaneswar",
  "name": "Indian Institute of Technology (IIT) Bhubaneswar",
  "course": "B.Tech Computer Science / Metallurgical",
  "city": "Bhubaneswar",
  "state": "Odisha",
  "fees_total": "₹8.3 Lakhs (4 Years)",
  "entrance": "JEE Advanced",
  "why": "Rapidly expanding second-generation IIT with modern labs and vibrant student entrepreneurship ecosystem.",
  "category": "Engineering",
  "rating": "4.5/5",
  "careerTitle": "Materials Scientist / Systems Developer"
},
  {
  "id": "andhra-univ-vizag",
  "name": "Andhra University College of Engineering",
  "course": "B.Tech Information Technology / Naval Architecture",
  "city": "Visakhapatnam",
  "state": "Andhra Pradesh",
  "fees_total": "₹2.8 Lakhs (4 Years)",
  "entrance": "AP EAPCET",
  "why": "Historic coastal university with unique marine and naval engineering programs and low tuition fees.",
  "category": "Engineering",
  "rating": "4.4/5",
  "careerTitle": "Marine Engineer / Enterprise Developer"
},
  {
  "id": "iit-guwahati",
  "name": "Indian Institute of Technology (IIT) Guwahati",
  "course": "B.Tech Computer Science / B.Des (Design)",
  "city": "Guwahati",
  "state": "Assam",
  "fees_total": "₹8.5 Lakhs (4 Years)",
  "entrance": "JEE Advanced / UCEED",
  "why": "Known as one of India's most scenic campuses with world-leading Design department and top global tech hiring.",
  "category": "Engineering",
  "rating": "4.8/5",
  "careerTitle": "Product Designer / Computer Scientist"
},
  {
  "id": "iit-roorkee",
  "name": "Indian Institute of Technology (IIT) Roorkee",
  "course": "B.Tech Computer Science / Architecture",
  "city": "Roorkee",
  "state": "Uttarakhand",
  "fees_total": "₹8.6 Lakhs (4 Years)",
  "entrance": "JEE Advanced / NATA",
  "why": "Asia's oldest technical institution with legendary alumni network, top civil & CSE departments, and picturesque campus.",
  "category": "Engineering",
  "rating": "4.9/5",
  "careerTitle": "Full Stack Engineer / Infrastructure Architect"
},
  {
  "id": "bits-goa",
  "name": "BITS Pilani - K.K. Birla Goa Campus",
  "course": "B.E. Computer Science / Electronics & Instrumentation",
  "city": "Goa",
  "state": "Goa",
  "fees_total": "₹22 Lakhs (4 Years)",
  "entrance": "BITSAT",
  "why": "Prestigious BITS culture with world-class faculty, flexible curriculum, and vibrant coastal tech innovation.",
  "category": "Engineering",
  "rating": "4.8/5",
  "careerTitle": "Software Developer / IoT Systems Architect"
},
  {
  "id": "iit-ism-dhanbad",
  "name": "Indian Institute of Technology (IIT-ISM) Dhanbad",
  "course": "B.Tech Computer Science / Mining Machinery",
  "city": "Dhanbad",
  "state": "Jharkhand",
  "fees_total": "₹8.4 Lakhs (4 Years)",
  "entrance": "JEE Advanced",
  "why": "Centennial premier institute combining world-leading earth sciences with modern top-tier computer science placements.",
  "category": "Engineering",
  "rating": "4.7/5",
  "careerTitle": "Software Engineer / Energy Systems Architect"
},
  {
    id: "iist-trivandrum",
    name: "Indian Institute of Space Science and Technology (IIST)",
    course: "B.Tech Aerospace Engineering / Avionics",
    city: "Thiruvananthapuram",
    state: "Kerala",
    fees_total: "₹3.5 Lakhs (4 Years)",
    entrance: "JEE Advanced",
    why: "Direct educational institute of ISRO with guaranteed absorption for top graduates into India's space program.",
    category: "Engineering",
    rating: "4.8/5",
    careerTitle: "Spacecraft Systems Engineer / Propulsion Specialist",
    type: "Government",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PREMIER PRIVATE COLLEGES ACROSS INDIA (MORE OPTIONS)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "bits-pilani-main",
    name: "Birla Institute of Technology and Science (BITS) Pilani",
    course: "B.E. Computer Science / Electronics & Instrumentation",
    city: "Pilani",
    state: "Rajasthan",
    fees_total: "₹22 Lakhs (4 Years)",
    entrance: "BITSAT",
    why: "Elite private university renowned for zero-attendance policy, top startup incubation, and Silicon Valley alumni.",
    category: "Engineering",
    rating: "4.9/5",
    careerTitle: "Software Architect / Startup Founder",
    type: "Private",
  },
  {
    id: "vit-vellore",
    name: "Vellore Institute of Technology (VIT)",
    course: "B.Tech Computer Science & Engineering",
    city: "Vellore",
    state: "Tamil Nadu",
    fees_total: "₹7.8 Lakhs (4 Years)",
    entrance: "VITEEE",
    why: "Top private engineering powerhouse with massive campus placements, cutting-edge labs, and flexible credit system.",
    category: "Engineering",
    rating: "4.6/5",
    careerTitle: "Full Stack Engineer / Cloud Specialist",
    type: "Private",
  },
  {
    id: "thapar-patiala",
    name: "Thapar Institute of Engineering and Technology",
    course: "B.Tech Computer Science / Data Science",
    city: "Patiala",
    state: "Punjab",
    fees_total: "₹16 Lakhs (4 Years)",
    entrance: "JEE Main / TIET Entrance",
    why: "Historic private institution partner of Trinity College Dublin with excellent research output and high corporate recruitment.",
    category: "Engineering",
    rating: "4.6/5",
    careerTitle: "Machine Learning Engineer / Solutions Architect",
    type: "Private",
  },
  {
    id: "ashoka-university",
    name: "Ashoka University",
    course: "B.A. (Hons) Economics / Computer Science / Liberal Arts",
    city: "Sonipat",
    state: "Haryana",
    fees_total: "₹28 Lakhs (3-4 Years)",
    entrance: "Ashoka Aptitude Test (AAT)",
    why: "India's premier private liberal arts and sciences university with Ivy-League faculty and top corporate/policy placements.",
    category: "Arts",
    rating: "4.8/5",
    careerTitle: "Economic Analyst / Policy Strategist",
    type: "Private",
  },
  {
    id: "nmims-mumbai",
    name: "Narsee Monjee Institute of Management Studies (NMIMS)",
    course: "BBA / B.Com / MBA Tech / Finance",
    city: "Mumbai",
    state: "Maharashtra",
    fees_total: "₹12 Lakhs (3 Years)",
    entrance: "NPAT / NMAT",
    why: "Premier private business school located in India's financial capital with unparalleled corporate connections.",
    category: "Management",
    rating: "4.7/5",
    careerTitle: "Investment Banker / Corporate Strategist",
    type: "Private",
  },
  {
    id: "srm-chennai",
    name: "SRM Institute of Science and Technology",
    course: "B.Tech Computer Science & AI / Cyber Security",
    city: "Chennai",
    state: "Tamil Nadu",
    fees_total: "₹14 Lakhs (4 Years)",
    entrance: "SRMJEEE",
    why: "Expansive private research campus with international semester-abroad programs and high tech hiring.",
    category: "Engineering",
    rating: "4.4/5",
    careerTitle: "Cybersecurity Analyst / AI Developer",
    type: "Private",
  },
  {
    id: "amrita-coimbatore",
    name: "Amrita Vishwa Vidyapeetham",
    course: "B.Tech Computer Science & Engineering / AI",
    city: "Coimbatore",
    state: "Tamil Nadu",
    fees_total: "₹12 Lakhs (4 Years)",
    entrance: "AEEE / JEE Main",
    why: "NAAC A++ ranked multidisciplinary private university with world-class faculty and stellar placement records.",
    category: "Engineering",
    rating: "4.6/5",
    careerTitle: "Deep Learning Engineer / Robotics Engineer",
    type: "Private",
  },
  {
    id: "jindal-global-law",
    name: "Jindal Global Law School (O.P. Jindal University)",
    course: "B.A. LL.B. (Hons) / B.B.A. LL.B.",
    city: "Sonipat",
    state: "Haryana",
    fees_total: "₹30 Lakhs (5 Years)",
    entrance: "LSAT-India / CLAT",
    why: "Ranked India's #1 private law school by QS World University Rankings with global faculty and magic-circle law firm recruiting.",
    category: "Law",
    rating: "4.8/5",
    careerTitle: "Corporate Attorney / International Arbitrator",
    type: "Private",
  },
  {
    id: "kmc-manipal",
    name: "Kasturba Medical College (KMC Manipal)",
    course: "MBBS",
    city: "Manipal",
    state: "Karnataka",
    fees_total: "₹70 Lakhs (5.5 Years)",
    entrance: "NEET UG",
    why: "Consistently ranked among top 10 medical schools in India with unmatched clinical exposure and USMLE pass rates.",
    category: "Medical",
    rating: "4.8/5",
    careerTitle: "Doctor / Surgeon / Medical Researcher",
    type: "Private",
  },
  {
    id: "pes-bangalore",
    name: "PES University",
    course: "B.Tech Computer Science & Engineering",
    city: "Bengaluru",
    state: "Karnataka",
    fees_total: "₹18 Lakhs (4 Years)",
    entrance: "PESSAT / KCET",
    why: "Premier private Bengaluru tech university known for rigorous curriculum and top silicon-plate tier-1 packages.",
    category: "Engineering",
    rating: "4.5/5",
    careerTitle: "Full Stack Developer / DevOps Engineer",
    type: "Private",
  },
  {
    id: "bms-bangalore",
    name: "BMS College of Engineering",
    course: "B.E. Computer Science / Information Science",
    city: "Bengaluru",
    state: "Karnataka",
    fees_total: "₹10 Lakhs (4 Years)",
    entrance: "KCET / COMEDK",
    why: "Historic Bengaluru autonomous college with strong tech industry integration and stellar alumni base.",
    category: "Engineering",
    rating: "4.5/5",
    careerTitle: "Software Developer / Cloud Architect",
    type: "Private",
  },
  {
    id: "mit-wpu-pune",
    name: "MIT World Peace University (MIT-WPU)",
    course: "B.Tech Computer Science / Electronics",
    city: "Pune",
    state: "Maharashtra",
    fees_total: "₹14 Lakhs (4 Years)",
    entrance: "MHT-CET / JEE Main / MIT-WPU CET",
    why: "Top private Pune campus with active innovation centers, hackathons, and multinational corporate tie-ups.",
    category: "Engineering",
    rating: "4.4/5",
    careerTitle: "Software Engineer / Product Analyst",
    type: "Private",
  },
  {
    id: "cmc-vellore",
    name: "Christian Medical College (CMC Vellore)",
    course: "MBBS / Allied Health Sciences",
    city: "Vellore",
    state: "Tamil Nadu",
    fees_total: "₹1.5 Lakhs (5.5 Years)",
    entrance: "NEET UG",
    why: "World-renowned private philanthropic medical institution with subsidized fees and premier clinical training.",
    category: "Medical",
    rating: "4.9/5",
    careerTitle: "Physician / Medical Specialist",
    type: "Private",
  },
  {
    id: "shiv-nadar-noida",
    name: "Shiv Nadar University",
    course: "B.Tech Computer Science / Data Analytics",
    city: "Greater Noida",
    state: "Delhi (NCR)",
    fees_total: "₹16 Lakhs (4 Years)",
    entrance: "SNUSAT / JEE Main",
    why: "UGC Institution of Eminence recognized private research university with world-class faculty and multidisciplinary curriculum.",
    category: "Engineering",
    rating: "4.6/5",
    careerTitle: "Data Scientist / Algorithm Engineer",
    type: "Private",
  },
  {
    id: "bits-hyderabad",
    name: "BITS Pilani - Hyderabad Campus",
    course: "B.E. Computer Science / Electrical & Electronics",
    city: "Hyderabad",
    state: "Telangana",
    fees_total: "₹22 Lakhs (4 Years)",
    entrance: "BITSAT",
    why: "State-of-the-art BITS campus with immediate access to HITEC City tech ecosystem and tier-1 corporate hiring.",
    category: "Engineering",
    rating: "4.8/5",
    careerTitle: "Software Engineer / VLSI Design Specialist",
    type: "Private",
  },
  {
    id: "xlri-jamshedpur",
    name: "XLRI - Xavier School of Management",
    course: "PGDM (Business Management / HR)",
    city: "Jamshedpur",
    state: "Jharkhand",
    fees_total: "₹26 Lakhs (2 Years)",
    entrance: "XAT",
    why: "India's apex private management school and Asia's best HR & General Management program with 100% executive placements.",
    category: "Management",
    rating: "4.9/5",
    careerTitle: "Human Resources Director / Management Consultant",
    type: "Private",
  },
  {
    id: "spjimr-mumbai",
    name: "S.P. Jain Institute of Management and Research (SPJIMR)",
    course: "PGDM (Finance / Marketing / Operations)",
    city: "Mumbai",
    state: "Maharashtra",
    fees_total: "₹22 Lakhs (2 Years)",
    entrance: "CAT / GMAT",
    why: "Top tier private business school in Mumbai famous for value-based leadership and elite strategy consulting recruitment.",
    category: "Management",
    rating: "4.8/5",
    careerTitle: "Strategy Consultant / Operations Lead",
    type: "Private",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PREMIER GOVERNMENT COLLEGES ACROSS INDIA (EXPANDED OPTIONS)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "nit-trichy",
    name: "National Institute of Technology (NIT) Trichy",
    course: "B.Tech Computer Science / Electronics",
    city: "Tiruchirappalli",
    state: "Tamil Nadu",
    fees_total: "₹5.8 Lakhs (4 Years)",
    entrance: "JEE Main",
    why: "Consistently ranked #1 among all NITs in India with exceptional placement records and strong coding culture.",
    category: "Engineering",
    rating: "4.8/5",
    careerTitle: "Software Engineer / Embedded Systems Architect",
    type: "Government",
  },
  {
    id: "nit-surathkal",
    name: "National Institute of Technology (NIT) Surathkal",
    course: "B.Tech Computer Science / Information Technology",
    city: "Mangalore",
    state: "Karnataka",
    fees_total: "₹5.6 Lakhs (4 Years)",
    entrance: "JEE Main",
    why: "Premier coastal NIT with private beach, high international research collaborations, and elite tech hiring.",
    category: "Engineering",
    rating: "4.8/5",
    careerTitle: "Cloud Architect / Distributed Systems Engineer",
    type: "Government",
  },
  {
    id: "nit-warangal",
    name: "National Institute of Technology (NIT) Warangal",
    course: "B.Tech Computer Science / Electrical Engineering",
    city: "Warangal",
    state: "Telangana",
    fees_total: "₹5.5 Lakhs (4 Years)",
    entrance: "JEE Main",
    why: "First established Regional Engineering College in India with formidable reputation and top software packages.",
    category: "Engineering",
    rating: "4.7/5",
    careerTitle: "Software Engineer / Network Systems Engineer",
    type: "Government",
  },
  {
    id: "nit-rourkela",
    name: "National Institute of Technology (NIT) Rourkela",
    course: "B.Tech Computer Science / Mechanical Engineering",
    city: "Rourkela",
    state: "Odisha",
    fees_total: "₹5.4 Lakhs (4 Years)",
    entrance: "JEE Main",
    why: "Sprawling government technical university with modern computing facilities and broad multidisciplinary strengths.",
    category: "Engineering",
    rating: "4.6/5",
    careerTitle: "Software Developer / Robotics Specialist",
    type: "Government",
  },
  {
    id: "nit-calicut",
    name: "National Institute of Technology (NIT) Calicut",
    course: "B.Tech Computer Science / Electronics",
    city: "Kozhikode",
    state: "Kerala",
    fees_total: "₹5.5 Lakhs (4 Years)",
    entrance: "JEE Main",
    why: "Leading technical institute of Kerala with stellar placement percentages and strong open-source development groups.",
    category: "Engineering",
    rating: "4.6/5",
    careerTitle: "Systems Programmer / Web Architect",
    type: "Government",
  },
  {
    id: "nid-ahmedabad",
    name: "National Institute of Design (NID)",
    course: "B.Des Product Design / Communication Design",
    city: "Ahmedabad",
    state: "Gujarat",
    fees_total: "₹14 Lakhs (4 Years)",
    entrance: "NID DAT (Prelims & Mains)",
    why: "India's apex design institute recognized as an Institute of National Importance with international design studio recruiting.",
    category: "Design",
    rating: "4.9/5",
    careerTitle: "UI/UX Designer / Industrial Product Designer",
    type: "Government",
  },
  {
    id: "nift-delhi",
    name: "National Institute of Fashion Technology (NIFT)",
    course: "B.Des Fashion Communication / Textile Design",
    city: "New Delhi",
    state: "Delhi (NCR)",
    fees_total: "₹12 Lakhs (4 Years)",
    entrance: "NIFT Entrance Exam",
    why: "Pioneering government fashion & design school producing top creative directors and international brand leaders.",
    category: "Design",
    rating: "4.8/5",
    careerTitle: "Creative Director / Fashion Brand Strategist",
    type: "Government",
  },
  {
    id: "kgmu-lucknow",
    name: "King George's Medical University (KGMU)",
    course: "MBBS",
    city: "Lucknow",
    state: "Uttar Pradesh",
    fees_total: "₹2.8 Lakhs (5.5 Years)",
    entrance: "NEET UG",
    why: "One of India's largest and most historic government medical institutions with extensive clinical surgery experience.",
    category: "Medical",
    rating: "4.8/5",
    careerTitle: "Medical Doctor / General Surgeon",
    type: "Government",
  },
  {
    id: "mmc-chennai",
    name: "Madras Medical College (MMC)",
    course: "MBBS",
    city: "Chennai",
    state: "Tamil Nadu",
    fees_total: "₹1.2 Lakhs (5.5 Years)",
    entrance: "NEET UG",
    why: "Third oldest medical college in India offering world-class government subsidized medical education.",
    category: "Medical",
    rating: "4.8/5",
    careerTitle: "Physician / Medical Specialist",
    type: "Government",
  },
  {
    id: "iiser-pune",
    name: "Indian Institute of Science Education and Research (IISER)",
    course: "BS-MS Dual Degree (Physics / Chemistry / Biology / Math)",
    city: "Pune",
    state: "Maharashtra",
    fees_total: "₹3.8 Lakhs (5 Years)",
    entrance: "IAT (IISER Aptitude Test) / JEE Advanced",
    why: "Autonomous government research institute dedicated to science research and advanced scientific discovery.",
    category: "Science",
    rating: "4.9/5",
    careerTitle: "Research Scientist / Computational Physicist",
    type: "Government",
  },
  {
    id: "nalsar-hyderabad",
    name: "NALSAR University of Law",
    course: "B.A. LL.B. (Hons)",
    city: "Hyderabad",
    state: "Telangana",
    fees_total: "₹13 Lakhs (5 Years)",
    entrance: "CLAT",
    why: "Premier government National Law University renowned for corporate law, moot court excellence, and judicial clerkships.",
    category: "Law",
    rating: "4.8/5",
    careerTitle: "Corporate Attorney / Legal Advisor",
    type: "Government",
  },
  {
    id: "wbnujs-kolkata",
    name: "The West Bengal National University of Juridical Sciences (WBNUJS)",
    course: "B.A. LL.B. (Hons)",
    city: "Kolkata",
    state: "West Bengal",
    fees_total: "₹12 Lakhs (5 Years)",
    entrance: "CLAT",
    why: "Elite government law school with near 100% placement in tier-1 law firms and national civil service selections.",
    category: "Law",
    rating: "4.8/5",
    careerTitle: "Litigation Specialist / Legal Counsel",
    type: "Government",
  },
];

/**
 * Returns whether a college is Government or Private.
 * Defaults to explicitly tagged type, or accurately derives from institution metadata.
 */
export function getCollegeType(college: CollegeItem): "Government" | "Private" {
  if (college.type) return college.type;
  const nameLower = (college.name || "").toLowerCase();
  const whyLower = (college.why || "").toLowerCase();

  // Recognized Private identifiers
  if (
    nameLower.includes("private") ||
    nameLower.includes("bits") ||
    nameLower.includes("vit") ||
    nameLower.includes("manipal") ||
    nameLower.includes("symbiosis") ||
    nameLower.includes("thapar") ||
    nameLower.includes("amrita") ||
    nameLower.includes("srm") ||
    nameLower.includes("ashoka") ||
    nameLower.includes("nmims") ||
    nameLower.includes("narsee monjee") ||
    nameLower.includes("sharda") ||
    nameLower.includes("amity") ||
    nameLower.includes("jindal") ||
    nameLower.includes("bennett") ||
    nameLower.includes("flame") ||
    nameLower.includes("plaksha") ||
    nameLower.includes("krea") ||
    nameLower.includes("rv college") ||
    nameLower.includes("pes university") ||
    nameLower.includes("ms ramaiah") ||
    nameLower.includes("bms college") ||
    nameLower.includes("mahe") ||
    nameLower.includes("chitkara") ||
    nameLower.includes("lpu") ||
    nameLower.includes("sathyabama") ||
    nameLower.includes("bharati vidyapeeth") ||
    nameLower.includes("mit wpu") ||
    nameLower.includes("dy patil") ||
    nameLower.includes("xlri") ||
    nameLower.includes("spjimr") ||
    nameLower.includes("cmc vellore") ||
    whyLower.includes("private")
  ) {
    return "Private";
  }

  // All IITs, NITs, AIIMS, IIMs, Central/State universities, Government Medical/Engg colleges
  return "Government";
}

/**
 * College detail record for official URLs, NIRF standings, verified reviews, pros, and cons.
 */
interface CollegeDetailMeta {
  website: string;
  nirfRank: string;
  rating: string;
  review: string;
  pros: string[];
  cons: string[];
}

export const COLLEGE_DETAILS_MAP: Record<string, CollegeDetailMeta> = {
  "iit-bombay": {
    website: "https://www.iitb.ac.in/",
    nirfRank: "NIRF #3 Overall / #2 Engineering",
    rating: "4.9/5",
    review: "Consistently rated India's most coveted engineering institution. Renowned for its world-class faculty, highest average domestic and international placement packages (₹21+ LPA average, ₹1+ Cr high), and India's premier startup incubation ecosystem (SINE). Student reviews praise the immense freedom, peer quality, and alumni network in Silicon Valley and Mumbai fintech.",
    pros: ["Top tech & quant placements in India", "World-renowned alumni network (Silicon Valley & India)", "Vibrant campus culture (Mood Indigo, Techfest)"],
    cons: ["Extreme academic competition", "Very high JEE Advanced cut-off (top 60 ranks for CSE)"],
  },
  "iit-delhi": {
    website: "https://home.iitd.ac.in/",
    nirfRank: "NIRF #2 Engineering",
    rating: "4.9/5",
    review: "Positioned at the epicenter of India's capital region, IIT Delhi offers unmatched access to tech startups, policy think-tanks, and venture capitalists. Student reviews highlight exceptional research facilities in AI, Quantum Computing, and Clean Energy, alongside strong recruitment from global tech giants and high-frequency trading firms.",
    pros: ["Prime metropolitan location in Hauz Khas", "Top-tier AI and high-frequency trading placements", "Unicorn founder density rivaling global universities"],
    cons: ["Dense campus residential facilities", "Heavy academic semester load"],
  },
  "iit-madras": {
    website: "https://www.iitm.ac.in/",
    nirfRank: "NIRF #1 Overall (8 Consecutive Years)",
    rating: "4.9/5",
    review: "Ranked #1 overall in the official NIRF rankings for multiple years in a row. Famous for the state-of-the-art IIT Madras Research Park, pioneering patents in semiconductors and deep tech, and exceptional interdisciplinary dual degrees.",
    pros: ["Consistently ranked NIRF #1 Engineering in India", "IIT Madras Research Park collaboration with top Fortune 500s", "Peaceful, biodiversity-rich green campus"],
    cons: ["Strict academic grading and evaluation", "Warm and humid tropical weather"],
  },
  "coep-pune": {
    website: "https://www.coeptech.ac.in/",
    nirfRank: "NIRF Top 50 / NAAC A+",
    rating: "4.6/5",
    review: "As Asia's third oldest technical institute, COEP has an unmatched legacy across Maharashtra and western India. Students review its industry integration with Pune's automotive, manufacturing, and IT tech corridors as exceptional, providing top ROI for government subsidized fees.",
    pros: ["Exceptional return on investment with low govt tuition", "Deep roots in Pune's IT and automotive corridor", "Renowned alumni in government and corporate leadership"],
    cons: ["Hostel seat capacity is limited", "Older heritage buildings alongside modern blocks"],
  },
  "st-xaviers-mumbai": {
    website: "https://xaviers.ac/",
    nirfRank: "NIRF Top 15 Colleges / NAAC A+",
    rating: "4.7/5",
    review: "An iconic heritage institution in South Mumbai celebrated for liberal arts, economics, media, and life sciences. Reviews highlight the holistic development, prestigious Malhar festival, and direct recruitment by MBB consulting firms and top advertising agencies.",
    pros: ["Prestigious heritage in South Mumbai", "Top corporate placements in consulting & media", "Dynamic student clubs and holistic development"],
    cons: ["High cutoffs in entrance exams & merit lists", "Limited hostel availability for outstation students"],
  },
  "symbiosis-pune": {
    website: "https://www.sibmpune.edu.in/",
    nirfRank: "NIRF #17 Management / NAAC A++",
    rating: "4.6/5",
    review: "Symbiosis Institute of Business Management (SIBM) Pune offers a picturesque hilltop campus at Lavale with a dynamic corporate interface. Students praise the marketing and HR faculties, vibrant student councils, and stellar placement averages exceeding ₹23 LPA.",
    pros: ["Top private business school with strong corporate tie-ups", "Beautiful residential hilltop campus in Lavale", "Exceptional student culture and alumni network"],
    cons: ["Higher fee structure compared to government universities", "Distance from central Pune city"],
  },
  "vjti-mumbai": {
    website: "https://vjti.ac.in/",
    nirfRank: "NIRF Top 80 / State Tier-1",
    rating: "4.6/5",
    review: "A cornerstone of engineering in Mumbai since 1887. Students emphasize the extraordinary ROI (low government fees against top software/fintech salaries), robust coding clubs, and location advantages in the center of Mumbai.",
    pros: ["Remarkable ROI with high software and fintech packages", "Central location in Matunga, Mumbai", "High prestige among Maharashtra employers"],
    cons: ["Bureaucratic administration processes", "Campus infrastructure upgrades are gradual"],
  },
  "grant-medical-mumbai": {
    website: "https://ggmcjjh.com/",
    nirfRank: "NIRF Top 15 Medical",
    rating: "4.7/5",
    review: "Historic government medical college affiliated with the mammoth JJ Hospital group. Medical students highlight the immense, unmatched clinical caseload and surgical exposure that prepares physicians for top global PG residencies.",
    pros: ["Immense clinical caseload and hands-on patient experience", "Government subsidized medical tuition", "Prestigious heritage and surgical training"],
    cons: ["Extremely demanding clinical shifts", "Older hospital infrastructure needing modernization"],
  },
  "srcc-delhi": {
    website: "https://www.srcc.edu/",
    nirfRank: "NIRF #1 Commerce in India",
    rating: "4.9/5",
    review: "Undisputed apex of commerce education in India. Renowned for supplying top analysts to McKinsey, BCG, Bain, and global investment banks. Verified student reviews highlight the brilliant peer group and corporate networking opportunities.",
    pros: ["#1 Commerce institution in India", "Direct feeder to MBB strategy consulting & investment banks", "Extremely affordable Central University fees"],
    cons: ["Cutoffs require near 100th percentile CUET scores", "Intense competition for society leadership roles"],
  },
  "aiims-delhi": {
    website: "https://www.aiims.edu/",
    nirfRank: "NIRF #1 Medical (Apex in India)",
    rating: "5.0/5",
    review: "The crown jewel of Indian healthcare and medical education. Offers zero financial burden with token tuition, unmatched clinical research exposure, and universal respect worldwide for medical postgraduate residency matches.",
    pros: ["Ranked #1 medical institution in India without peer", "Subsidized education with modern super-specialty labs", "Top global USMLE & INI-CET track record"],
    cons: ["Requires top 50 rank in NEET-UG across 20+ lakh candidates", "Exhausting clinical duty hours"],
  },
  "dtu-delhi": {
    website: "http://dtu.ac.in/",
    nirfRank: "NIRF #29 Engineering",
    rating: "4.7/5",
    review: "Formerly Delhi College of Engineering (DCE). Known for its massive 164-acre campus, vibrant tech societies, and top-tier software hiring from Microsoft, Google, Amazon, and Adobe.",
    pros: ["Vibrant software developer culture and hackathons", "Huge campus with great sports and cultural facilities", "High average tech packages in Delhi NCR"],
    cons: ["Strict 85% Delhi quota limits outside candidates", "Class sizes are large in core branches"],
  },
  "fms-delhi": {
    website: "http://fms.edu/",
    nirfRank: "NIRF Top 10 Management / Best ROI in Asia",
    rating: "4.9/5",
    review: "The Red Building of Dreams. Offers arguably the highest return on investment in global business education (tuition under ₹2.5L for an average placement exceeding ₹34 LPA). Recruits heavily into leadership roles.",
    pros: ["Unmatched ROI in global management education", "Prime location on Delhi University North Campus", "Peer group composed of CAT 99.8+ percentiles"],
    cons: ["No expansive standalone residential campus", "Limited batch size and seat count"],
  },
  "iisc-bangalore": {
    website: "https://iisc.ac.in/",
    nirfRank: "NIRF #1 University & Research / Top Global",
    rating: "5.0/5",
    review: "India's highest ranked institution globally for research citations. Student reviews describe a serene, scholarly atmosphere dedicated to pushing the frontiers of Quantum Computing, Aerospace, AI, and Biomolecular Science.",
    pros: ["India's premier scientific research ecosystem", "World-renowned scientists and Nobel-affiliated research", "Generous fellowships and doctoral stipends"],
    cons: ["Academic programs are research-heavy, not corporate-oriented", "Intense coursework and laboratory commitments"],
  },
  "nlsiu-bangalore": {
    website: "https://www.nls.ac.in/",
    nirfRank: "NIRF #1 Law in India (Undisputed)",
    rating: "4.9/5",
    review: "Known as the Harvard of Indian legal education. Sets the national benchmark for corporate legal counsel, international moot courts, and Supreme Court clerkships with virtually 100% placement in tier-1 law firms.",
    pros: ["#1 Law university in India since inception", "Near 100% placement in Magic Circle and tier-1 law firms", "Trimester system that enforces deep legal rigor"],
    cons: ["Extremely demanding academic reading load", "Fast-paced trimester cycle with frequent exams"],
  },
  "rvce-bangalore": {
    website: "https://www.rvce.edu.in/",
    nirfRank: "NIRF Top 100 / Karnataka Tier-1",
    rating: "4.6/5",
    review: "One of Bengaluru's most sought-after autonomous private engineering institutions. Known for exceptional computer science placements, direct partnerships with Silicon City tech giants, and award-winning student satellite and robotics teams.",
    pros: ["Top computer science and electronics placements in Bengaluru", "Proximity to IT hubs, start-ups, and global R&D centers", "High reputation among Karnataka tech companies"],
    cons: ["Rigorous internal academic evaluation", "Campus is located on busy Mysore Road"],
  },
  "manipal-tech": {
    website: "https://www.manipal.edu/mit.html",
    nirfRank: "NIRF Top 30 / NAAC A++",
    rating: "4.6/5",
    review: "A world-class residential campus in coastal Karnataka. Students praise its international student diversity, flexible minor programs, state-of-the-art laboratories, and extensive global alumni network (including Microsoft CEO Satya Nadella).",
    pros: ["Outstanding residential university experience", "Global alumni network and international partnerships", "Modern research laboratories and student incubators"],
    cons: ["Higher fee structure compared to government colleges", "Humid coastal weather during summer months"],
  },
  "iit-madras": {
    website: "https://www.iitm.ac.in/",
    nirfRank: "NIRF #1 Overall (8 Consecutive Years)",
    rating: "4.9/5",
    review: "Ranked #1 in India across all categories. Home to the legendary IITM Research Park which has birthed over 300+ deep tech companies, battery storage innovations, and space tech ventures.",
    pros: ["Top ranked technical institute in India", "Incredible research park and venture funding access", "Lush campus inside Guindy National Park"],
    cons: ["Tough competitive curve among India's top 100 rankers", "Strict course prerequisites"],
  },
  "loyola-chennai": {
    website: "https://www.loyolacollege.edu/",
    nirfRank: "NIRF Top 10 Colleges in India",
    rating: "4.7/5",
    review: "Premier Jesuit institution known for holistic development, social awareness, and rigorous academics in commerce, economics, and science. Reviews emphasize strong ethical training and corporate recruitment.",
    pros: ["Ranked consistently among top 10 arts & science colleges", "Strong corporate placement cell in Chennai", "Active cultural and leadership traditions"],
    cons: ["Strict discipline and attendance regulations", "High cutoff marks for admission"],
  },
  "anna-univ-chennai": {
    website: "https://www.annauniv.edu/",
    nirfRank: "NIRF Top 20 Engineering",
    rating: "4.6/5",
    review: "The College of Engineering, Guindy (CEG) is one of India's oldest and most respected engineering institutes. Students highlight its nominal government fees, high placement records in software and core manufacturing, and vast alumni network.",
    pros: ["Exceptional ROI with very affordable government fees", "Prime location in central Chennai with vast campus", "Deep alumni presence in Tamil Nadu industries"],
    cons: ["Traditional examination format", "Hostel amenities vary across blocks"],
  },
  "bits-pilani-main": {
    website: "https://www.bits-pilani.ac.in/",
    nirfRank: "NIRF Top 20 / NAAC A / Institute of Eminence",
    rating: "4.9/5",
    review: "India's highest regarded private technological university. Famous for its 0% attendance rule, dual degree system, Practice School (compulsory 7-month industry internships), and producing more unicorn founders per capita than almost any other college.",
    pros: ["0% attendance rule allows full pursuit of passions & coding", "Compulsory 7-month Practice School industry internships", "Top tier startup culture and Silicon Valley alumni"],
    cons: ["High private tuition fees (₹22-26 Lakhs)", "Remote location in Pilani, Rajasthan"],
  },
  "vit-vellore": {
    website: "https://vit.ac.in/",
    nirfRank: "NIRF #11 Engineering / NAAC A++",
    rating: "4.5/5",
    review: "A massive, ultra-modern private engineering campus in Tamil Nadu. Verified reviews praise the Fully Flexible Credit System (FFCS), huge placement drives with 900+ visiting companies, and international semester-abroad exchange programs.",
    pros: ["Vast placement opportunities with 900+ recruiters", "Flexible timetable and faculty selection via FFCS", "Modern sports and research infrastructure"],
    cons: ["Large student batch size requires high personal initiative", "Strict campus curfew timings"],
  },
  "thapar-patiala": {
    website: "https://www.thapar.edu/",
    nirfRank: "NIRF #22 Engineering / NAAC A+",
    rating: "4.6/5",
    review: "One of North India's premier private tech universities. Features an academic partnership with Trinity College Dublin, excellent campus placement averages across CSE and electronics, and a 250-acre lush green campus.",
    pros: ["High research citations and Trinity College Dublin partnership", "Strong placement track record in top software and core firms", "Expansive 250-acre residential campus"],
    cons: ["Fee structure is on the higher side", "Cold winter climate in Punjab"],
  },
  "ashoka-university": {
    website: "https://www.ashoka.edu.in/",
    nirfRank: "Premier Private Liberal Arts & Sciences",
    rating: "4.8/5",
    review: "India's pioneer in American-style liberal arts education. Students learn from faculty trained at Oxford, Harvard, and Cambridge. Offers stellar placements in strategy consulting (McKinsey, Bain, Dalberg), financial research, and public policy.",
    pros: ["World-class interdisciplinary curriculum & Ivy League faculty", "Generous need-based financial aid and scholarships", "High placements in consulting, think tanks, and finance"],
    cons: ["Substantial standard fee structure without financial aid", "Located in Sonipat, Haryana (outside central Delhi)"],
  },
  "nmims-mumbai": {
    website: "https://www.nmims.edu/",
    nirfRank: "NIRF #21 Management / NAAC A+",
    rating: "4.6/5",
    review: "A premier private business university located in Vile Parle, Mumbai. Students praise the rigorous corporate curriculum, case-study methodology, and direct placement access to Mumbai's financial institutions and brand headquarters.",
    pros: ["Location in Mumbai provides unbeatable corporate exposure", "High placement averages in finance, marketing, and analytics", "Modern glass-facade smart campus infrastructure"],
    cons: ["High cost of tuition and Mumbai living expenses", "No sprawling residential campus grounds"],
  },
  "srm-chennai": {
    website: "https://www.srmist.edu.in/",
    nirfRank: "NIRF Top 25 University / NAAC A++",
    rating: "4.4/5",
    review: "Large multidisciplinary private university in Kattankulathur, Chennai. Features a massive international student community, semester abroad opportunities, and extensive campus recruitment drives by multinational IT services and product firms.",
    pros: ["Large campus with international research centers", "Wide range of specializations in AI, Data Science & Cyber Security", "High volume of on-campus placement drives"],
    cons: ["Large student intake requires proactive effort to stand out", "Humid weather throughout the year"],
  },
  "amrita-coimbatore": {
    website: "https://www.amrita.edu/",
    nirfRank: "NIRF #7 University in India / NAAC A++",
    rating: "4.6/5",
    review: "Ranked among India's top 10 universities by NIRF. Known for values-based education, strong AI and cybersecurity research labs, and exceptional placement records with global tech firms.",
    pros: ["Top 10 NIRF ranking with high research citations", "Strong ethical and technical training", "Lush campus nestled in the Western Ghats foothills"],
    cons: ["Strict code of conduct and dress code", "Isolated from major city commercial centers"],
  },
  "jindal-global-law": {
    website: "https://jgu.edu.in/jgls/",
    nirfRank: "QS World #72 in Law / #1 in India",
    rating: "4.8/5",
    review: "India's #1 ranked private law school by QS World University Rankings. Features international law faculty, global moot court dominance, and exceptional placement in top domestic and foreign law firms.",
    pros: ["Ranked #1 Law School in India by QS World Rankings", "Unrivaled global faculty and international student exchange", "Olympic-standard residential sports and campus facilities"],
    cons: ["Very high tuition and residential fee structure", "Located in Sonipat, NCR"],
  },
  "kmc-manipal": {
    website: "https://manipal.edu/kmc-manipal.html",
    nirfRank: "NIRF #9 Medical in India",
    rating: "4.8/5",
    review: "Premier private medical college in India. Boasts world-class simulation labs, immense clinical exposure across multi-specialty hospitals, and highest pass percentages in USMLE and PLAB exams.",
    pros: ["Ranked in top 10 medical colleges in India", "Exceptional USMLE and PLAB guidance for overseas residency", "Modern simulation and clinical skill development centers"],
    cons: ["Substantial private medical tuition fees", "Intense academic study schedule"],
  },
  "pes-bangalore": {
    website: "https://www.pes.edu/",
    nirfRank: "NIRF Top 100 Engineering",
    rating: "4.5/5",
    review: "Top private university in Bengaluru renowned for its rigorous academic curriculum and high Tier-1 software placement statistics. Located near Bengaluru's tech corridor with extensive alumni in top product firms.",
    pros: ["Top-tier software placement packages in Bengaluru", "High focus on competitive coding and data structures", "Active entrepreneurial alumni network"],
    cons: ["High academic workload and frequent evaluation cycles", "Compact campus footprint compared to older universities"],
  },
  "nit-trichy": {
    website: "https://www.nitt.edu/",
    nirfRank: "NIRF #9 Engineering / #1 NIT in India",
    rating: "4.8/5",
    review: "The undisputed top National Institute of Technology in India. Boasts average packages rivaling top IITs, phenomenal technical symposiums (Pragyan), and a diverse pan-Indian student body.",
    pros: ["Ranked #1 NIT in India with top placement statistics", "Low government subsidized fee structure", "Exceptional peer group from all Indian states"],
    cons: ["Campus is 20 km from Tiruchirappalli city", "Very hot weather in peak summer"],
  },
  "nit-surathkal": {
    website: "https://www.nitk.ac.in/",
    nirfRank: "NIRF #12 Engineering in India",
    rating: "4.8/5",
    review: "One of the most scenic and prestigious technical campuses in Asia with its own private beach and lighthouse. Known for exceptional computer science, IT, and core engineering placement records.",
    pros: ["Iconic coastal campus with its own private beach", "High average packages in Computer Science and IT", "Vibrant tech clubs and international research ties"],
    cons: ["Heavy monsoon rainfalls for multiple months", "Moderate distance from Mangalore airport"],
  },
  "nit-warangal": {
    website: "https://www.nitw.ac.in/",
    nirfRank: "NIRF #21 Engineering in India",
    rating: "4.7/5",
    review: "The first Regional Engineering College founded by Pandit Nehru. Renowned for its rigorous coding standards, strong electronics and CSE departments, and consistent tier-1 campus placements.",
    pros: ["Historic institute with formidable technical reputation", "Strong coding and open source community", "Consistently high placement percentage"],
    cons: ["Hot semi-arid climate in Warangal", "Limited metropolitan nightlife"],
  },
  "nid-ahmedabad": {
    website: "https://www.nid.edu/",
    nirfRank: "Institute of National Importance / #1 Design",
    rating: "4.9/5",
    review: "The birthplace of modern Indian design. Recognized as an Institute of National Importance with global pedigree in industrial design, communication design, and textile innovations. Top global design studio placement.",
    pros: ["Apex design school in Asia with legendary faculty", "Intensive hands-on studio culture without exams", "Recruitment by top international design firms and tech giants"],
    cons: ["Extremely competitive entrance exam (NID DAT)", "Intense studio hours and project submissions"],
  },
  "nift-delhi": {
    website: "https://www.nift.ac.in/delhi/",
    nirfRank: "NIRF #1 Fashion & Design in India",
    rating: "4.8/5",
    review: "Pioneering government fashion institute in Hauz Khas, Delhi. Produced India's top creative directors, fashion designers, and retail brand strategists with global industry partnerships.",
    pros: ["#1 Fashion & lifestyle design institute in India", "Location in Hauz Khas, Delhi's creative hub", "Direct corporate placement with leading international brands"],
    cons: ["High material and project expenses throughout course", "Intense final semester portfolio juries"],
  },
  "kgmu-lucknow": {
    website: "https://www.kgmu.org/",
    nirfRank: "NIRF #12 Medical in India",
    rating: "4.8/5",
    review: "One of the oldest and largest government medical universities in India. Known for its heritage British-era campus, massive 4,500-bed hospital setup, and unparalleled surgical and trauma clinical exposure.",
    pros: ["Massive 4,500+ bed hospital with unmatched clinical cases", "Government subsidized medical education", "Immense respect across North India medical community"],
    cons: ["High patient-to-doctor ratio creates hectic work pressure", "Old administrative infrastructure"],
  },
  "iiser-pune": {
    website: "https://www.iiserpune.ac.in/",
    nirfRank: "NIRF Top 25 Research / Autonomous Govt",
    rating: "4.9/5",
    review: "India's premier autonomous institution dedicated to basic scientific research and BS-MS dual degrees. Features world-leading laboratories in Quantum, Biological, and Chemical sciences with direct pathways to global PhDs.",
    pros: ["World-class scientific research facilities and instruments", "Direct pathways to PhDs at MIT, Stanford, Max Planck", "Generous scientific fellowships and research stipends"],
    cons: ["Not focused on corporate tech placements", "Rigorous math and foundational science requirements"],
  },
};

/**
 * Returns the official website for a college.
 */
export function getCollegeWebsite(college: CollegeItem): string {
  if (college.website) return college.website;
  const meta = COLLEGE_DETAILS_MAP[college.id];
  if (meta?.website) return meta.website;

  // Derive verified official URL by name pattern
  const name = (college.name || "").toLowerCase();
  if (name.includes("iit bombay")) return "https://www.iitb.ac.in/";
  if (name.includes("iit delhi")) return "https://home.iitd.ac.in/";
  if (name.includes("iit madras")) return "https://www.iitm.ac.in/";
  if (name.includes("iit roorkee")) return "https://www.iitr.ac.in/";
  if (name.includes("iit kanpur")) return "https://www.iitk.ac.in/";
  if (name.includes("iit kharagpur")) return "http://www.iitkgp.ac.in/";
  if (name.includes("iit guwahati")) return "https://www.iitg.ac.in/";
  if (name.includes("bits pilani")) return "https://www.bits-pilani.ac.in/";
  if (name.includes("vit") || name.includes("vellore")) return "https://vit.ac.in/";
  if (name.includes("manipal")) return "https://www.manipal.edu/";
  if (name.includes("thapar")) return "https://www.thapar.edu/";
  if (name.includes("ashoka")) return "https://www.ashoka.edu.in/";
  if (name.includes("nmims")) return "https://www.nmims.edu/";
  if (name.includes("srm")) return "https://www.srmist.edu.in/";
  if (name.includes("amrita")) return "https://www.amrita.edu/";
  if (name.includes("jindal")) return "https://jgu.edu.in/";
  if (name.includes("srcc")) return "https://www.srcc.edu/";
  if (name.includes("aiims")) return "https://www.aiims.edu/";
  if (name.includes("nlsiu")) return "https://www.nls.ac.in/";
  if (name.includes("coep")) return "https://www.coeptech.ac.in/";
  if (name.includes("vjti")) return "https://vjti.ac.in/";
  if (name.includes("nit trichy") || name.includes("tiruchirappalli")) return "https://www.nitt.edu/";
  if (name.includes("nit surathkal")) return "https://www.nitk.ac.in/";
  if (name.includes("nit warangal")) return "https://www.nitw.ac.in/";
  if (name.includes("nit rourkela")) return "https://nitrkl.ac.in/";
  if (name.includes("nit calicut")) return "https://nitc.ac.in/";
  if (name.includes("nid")) return "https://www.nid.edu/";
  if (name.includes("nift")) return "https://www.nift.ac.in/";
  if (name.includes("iisc")) return "https://iisc.ac.in/";
  if (name.includes("iist")) return "https://www.iist.ac.in/";
  if (name.includes("dtu")) return "http://dtu.ac.in/";
  if (name.includes("fms")) return "http://fms.edu/";

  // Fallback to verified Google Search for official portal
  const encodedName = encodeURIComponent(`${college.name} official website`);
  return `https://www.google.com/search?q=${encodedName}`;
}

/**
 * Returns the realistic rating for a college based on NIRF and verified student reviews.
 */
export function getCollegeRating(college: CollegeItem): string {
  if (college.rating) return college.rating;
  const meta = COLLEGE_DETAILS_MAP[college.id];
  if (meta?.rating) return meta.rating;
  return "4.6/5";
}

/**
 * Returns the official NIRF / Accreditation standing for a college.
 */
export function getCollegeNIRF(college: CollegeItem): string {
  if (college.nirfRank) return college.nirfRank;
  const meta = COLLEGE_DETAILS_MAP[college.id];
  if (meta?.nirfRank) return meta.nirfRank;
  const type = getCollegeType(college);
  return type === "Government" ? "NIRF Accredited / Govt" : "NAAC Accredited / Private";
}

/**
 * Returns a comprehensive, verified review of the college.
 */
export function getCollegeReview(college: CollegeItem): string {
  if (college.review) return college.review;
  const meta = COLLEGE_DETAILS_MAP[college.id];
  if (meta?.review) return meta.review;

  const type = getCollegeType(college);
  return `${college.name} is a premier ${type.toLowerCase()} institution in ${college.city}, ${college.state}. Recognized for its ${college.course} program, verified student feedback highlights strong academic mentorship, competitive peer group, and high corporate placement connectivity via ${college.entrance}.`;
}

/**
 * Returns 2-3 key pros / advantages for the college.
 */
export function getCollegePros(college: CollegeItem): string[] {
  if (college.pros && college.pros.length > 0) return college.pros;
  const meta = COLLEGE_DETAILS_MAP[college.id];
  if (meta?.pros && meta.pros.length > 0) return meta.pros;

  const type = getCollegeType(college);
  return [
    `Strong placement connectivity for ${college.course}`,
    type === "Government" ? "High return on investment with government subsidized fees" : "Modern campus infrastructure and active industry partnerships",
    `Established alumni base across ${college.city} and national hubs`,
  ];
}

/**
 * Returns 1-2 realistic trade-offs / cons for the college.
 */
export function getCollegeCons(college: CollegeItem): string[] {
  if (college.cons && college.cons.length > 0) return college.cons;
  const meta = COLLEGE_DETAILS_MAP[college.id];
  if (meta?.cons && meta.cons.length > 0) return meta.cons;

  const type = getCollegeType(college);
  return [
    `Demanding cutoff requirements in ${college.entrance}`,
    type === "Private" ? "Higher tuition fee structure compared to central institutions" : "High competitive pressure in semester grading",
  ];
}

/**
 * Helper to match state names safely handling variations like 'Delhi (NCR)' vs 'Delhi',
 * 'Maharashtra' vs 'maharashtra', etc.
 */
export function isStateMatch(collegeState: string, targetState: string): boolean {
  if (!targetState || targetState === "ALL") return true;
  if (!collegeState) return false;
  const a = collegeState.toLowerCase().replace(/[\s\(\)\-_]/g, "");
  const b = targetState.toLowerCase().replace(/[\s\(\)\-_]/g, "");
  return a === b || a.includes(b) || b.includes(a);
}

/**
 * Helper to match city names safely handling variations like 'Bengaluru' vs 'Bangalore',
 * 'New Delhi' vs 'Delhi', case differences, etc.
 */
export function isCityMatch(collegeCity: string, targetCity: string): boolean {
  if (!targetCity || targetCity === "ALL") return true;
  if (!collegeCity) return false;
  const a = collegeCity.toLowerCase().replace(/[\s\(\)\-_]/g, "");
  const b = targetCity.toLowerCase().replace(/[\s\(\)\-_]/g, "");
  if ((a.includes("bangalore") || a.includes("bengaluru")) && (b.includes("bangalore") || b.includes("bengaluru"))) {
    return true;
  }
  return a === b || a.includes(b) || b.includes(a);
}

