export const MOCK_INTERNSHIPS = [
  {
    internshipId: 1,
    title: "Software Engineering Intern",
    company: { companyName: "TechNova Inc." },
    location: "San Francisco, CA",
    workType: "Hybrid",
    duration: "3 months",
    stipend: "$2,500/month",
    applicationDeadline: "2026-09-15",
    category: { categoryName: "Engineering" },
    description: "Join our engineering team to build scalable backend services and frontend experiences used by millions.",
    requiredSkills: "Java,Spring Boot,React,SQL",
    isSaved: false,
    status: "APPLIED"
  },
  {
    internshipId: 2,
    title: "Data Science Intern",
    company: { companyName: "Insight Analytics" },
    location: "New York, NY",
    workType: "Remote",
    duration: "4 months",
    stipend: "$2,200/month",
    applicationDeadline: "2026-09-20",
    category: { categoryName: "Data Science" },
    description: "Work with our data team to build ML pipelines and analytics dashboards for enterprise clients.",
    requiredSkills: "Python,Machine Learning,SQL,Tableau",
    isSaved: true,
    status: "SHORTLISTED"
  },
  {
    internshipId: 3,
    title: "Product Design Intern",
    company: { companyName: "Creative Studio Co." },
    location: "Austin, TX",
    workType: "On-site",
    duration: "3 months",
    stipend: "$2,000/month",
    applicationDeadline: "2026-10-01",
    category: { categoryName: "Design" },
    description: "Design intuitive user experiences for SaaS products. Collaborate with PMs and engineers.",
    requiredSkills: "Figma,UI/UX,User Research,Prototyping",
    isSaved: false,
    status: "APPLIED"
  },
  {
    internshipId: 4,
    title: "Full Stack Developer Intern",
    company: { companyName: "CloudBase Systems" },
    location: "Seattle, WA",
    workType: "Hybrid",
    duration: "6 months",
    stipend: "$3,000/month",
    applicationDeadline: "2026-09-30",
    category: { categoryName: "Engineering" },
    description: "Build full-stack features across our cloud platform using modern web technologies.",
    requiredSkills: "React,Node.js,TypeScript,AWS",
    isSaved: false,
    status: null
  },
  {
    internshipId: 5,
    title: "AI/ML Research Intern",
    company: { companyName: "DeepMind Labs" },
    location: "Remote",
    workType: "Remote",
    duration: "4 months",
    stipend: "$3,500/month",
    applicationDeadline: "2026-10-15",
    category: { categoryName: "AI/ML" },
    description: "Research and implement cutting-edge ML models. Contribute to papers and internal tools.",
    requiredSkills: "Python,PyTorch,Deep Learning,NLP",
    isSaved: true,
    status: "INTERVIEW"
  }
];

export const MOCK_APPLICATIONS = [
  {
    applicationId: 101,
    internship: { title: "Software Engineering Intern", company: { companyName: "TechNova Inc." } },
    status: "APPLIED",
    appliedAt: "2026-08-01",
    coverLetter: "Excited to contribute..."
  },
  {
    applicationId: 102,
    internship: { title: "Data Science Intern", company: { companyName: "Insight Analytics" } },
    status: "SHORTLISTED",
    appliedAt: "2026-08-05",
    coverLetter: "My ML experience aligns..."
  },
  {
    applicationId: 103,
    internship: { title: "Product Design Intern", company: { companyName: "Creative Studio Co." } },
    status: "INTERVIEW",
    appliedAt: "2026-08-10",
    coverLetter: "I have led design sprints..."
  }
];

export const MOCK_INTERVIEWS = [
  {
    interviewId: 201,
    application: { internship: { title: "Product Design Intern" } },
    type: "Technical",
    status: "SCHEDULED",
    scheduledAt: "2026-08-20T14:00:00"
  }
];

export const MOCK_NOTIFICATIONS = [
  { id: 1, message: "Your application for Data Science Intern was shortlisted", time: "2 hours ago", read: false },
  { id: 2, message: "Interview scheduled for Product Design Intern", time: "1 day ago", read: false },
  { id: 3, message: "New internships matching your profile: Full Stack Developer Intern", time: "2 days ago", read: true }
];

export const POPULAR_SKILLS = [
  "Java", "Python", "React", "Full Stack", "AI/ML", "Data Science", "UI/UX", "Cloud",
  "Node.js", "TypeScript", "AWS", "DevOps", "Cybersecurity", "Mobile", "Blockchain"
];

export const RECOMMENDED_INTERNSHIPS = [
  {
    internshipId: 6,
    title: "Backend Engineer Intern",
    company: { companyName: "FinCore" },
    location: "Chicago, IL",
    workType: "Hybrid",
    duration: "4 months",
    stipend: "$2,800/month",
    requiredSkills: "Java,Spring Boot,Microservices,Kafka",
    postedAt: "2026-08-10"
  },
  {
    internshipId: 7,
    title: "Frontend Developer Intern",
    company: { companyName: "PixelCraft" },
    location: "Remote",
    workType: "Remote",
    duration: "3 months",
    stipend: "$2,400/month",
    requiredSkills: "React,TypeScript,Tailwind CSS,Jest",
    postedAt: "2026-08-12"
  },
  {
    internshipId: 8,
    title: "Cloud Engineering Intern",
    company: { companyName: "SkyBridge" },
    location: "Denver, CO",
    workType: "On-site",
    duration: "6 months",
    stipend: "$3,200/month",
    requiredSkills: "AWS,Terraform,Docker,Kubernetes",
    postedAt: "2026-08-14"
  }
];
