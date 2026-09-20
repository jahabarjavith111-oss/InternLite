export const RECRUITER_STATS = {
  activeInternships: 8,
  activeInternshipsChange: '+2 this month',
  totalApplicants: 342,
  totalApplicantsChange: '+18% this week',
  shortlisted: 48,
  shortlistedPercent: '14% of applicants',
  interviews: 21,
  interviewsScheduled: '5 scheduled this week',
  positionsFilled: 7,
  positionsFilledPeriod: 'This month'
};

export const RECRUITER_INTERNSHIPS = [
  {
    internshipId: 1,
    title: "Software Engineer Intern",
    department: "Engineering",
    location: "Chennai",
    workMode: "Hybrid",
    stipend: "₹20,000/month",
    applicants: 126,
    views: 1248,
    deadline: "2026-08-30",
    status: "ACTIVE"
  },
  {
    internshipId: 2,
    title: "Frontend Developer Intern",
    department: "Engineering",
    location: "Remote",
    workMode: "Remote",
    stipend: "₹18,000/month",
    applicants: 89,
    views: 956,
    deadline: "2026-09-15",
    status: "ACTIVE"
  },
  {
    internshipId: 3,
    title: "Data Science Intern",
    department: "Data",
    location: "Bangalore",
    workMode: "On-site",
    stipend: "₹25,000/month",
    applicants: 67,
    views: 743,
    deadline: "2026-09-01",
    status: "ACTIVE"
  },
  {
    internshipId: 4,
    title: "Product Design Intern",
    department: "Design",
    location: "Mumbai",
    workMode: "Hybrid",
    stipend: "₹15,000/month",
    applicants: 45,
    views: 521,
    deadline: "2026-08-25",
    status: "PAUSED"
  },
  {
    internshipId: 5,
    title: "Backend Developer Intern",
    department: "Engineering",
    location: "Hyderabad",
    workMode: "On-site",
    stipend: "₹22,000/month",
    applicants: 15,
    views: 234,
    deadline: "2026-10-01",
    status: "DRAFT"
  }
];

export const RECRUITER_APPLICATIONS = [
  {
    applicationId: 1,
    candidate: { name: "Rahul Kumar", email: "rahul@university.edu", phone: "+91 98765 43210", location: "Chennai", photo: null },
    internship: { title: "Software Engineer Intern", department: "Engineering" },
    skills: ["Java", "Spring Boot", "MySQL", "DSA"],
    education: "B.E CSE, Anna University",
    experience: "1 internship at TechStart",
    appliedAt: "2026-08-10T14:30:00",
    status: "NEW",
    coverLetter: "I am passionate about backend development..."
  },
  {
    applicationId: 2,
    candidate: { name: "Priya Sharma", email: "priya@university.edu", phone: "+91 87654 32109", location: "Bangalore", photo: null },
    internship: { title: "Frontend Developer Intern", department: "Engineering" },
    skills: ["React", "JavaScript", "CSS", "TypeScript"],
    education: "B.E IT, PES University",
    experience: "Freelance web projects",
    appliedAt: "2026-08-09T10:15:00",
    status: "SHORTLISTED",
    coverLetter: "I have built multiple React projects..."
  },
  {
    applicationId: 3,
    candidate: { name: "Arun Kumar", email: "arun@university.edu", phone: "+91 76543 21098", location: "Coimbatore", photo: null },
    internship: { title: "Java Developer Intern", department: "Engineering" },
    skills: ["Java", "Spring Boot", "Hibernate", "Microservices"],
    education: "B.Tech CSE, Coimbatore Institute",
    experience: "2 internships",
    appliedAt: "2026-08-08T16:45:00",
    status: "INTERVIEW",
    coverLetter: "Strong background in Java..."
  },
  {
    applicationId: 4,
    candidate: { name: "Sneha Patel", email: "sneha@university.edu", phone: "+91 65432 10987", location: "Mumbai", photo: null },
    internship: { title: "Data Science Intern", department: "Data" },
    skills: ["Python", "Machine Learning", "SQL", "Tableau"],
    education: "M.Sc Statistics, IIT Bombay",
    experience: "Research assistant",
    appliedAt: "2026-08-07T09:20:00",
    status: "SELECTED",
    coverLetter: "My research in ML aligns..."
  },
  {
    applicationId: 5,
    candidate: { name: "Vikram Singh", email: "vikram@university.edu", phone: "+91 54321 09876", location: "Delhi", photo: null },
    internship: { title: "Software Engineer Intern", department: "Engineering" },
    skills: ["C++", "Python", "Data Structures", "Algorithms"],
    education: "B.Tech IT, DTU",
    experience: "Competitive programming",
    appliedAt: "2026-08-06T11:00:00",
    status: "REJECTED",
    coverLetter: "I enjoy problem solving..."
  },
  {
    applicationId: 6,
    candidate: { name: "Kavya Reddy", email: "kavya@university.edu", phone: "+91 43210 98765", location: "Hyderabad", photo: null },
    internship: { title: "Product Design Intern", department: "Design" },
    skills: ["Figma", "UI/UX", "Prototyping", "User Research"],
    education: "B.Des NID",
    experience: "Design internship at StartupX",
    appliedAt: "2026-08-05T13:10:00",
    status: "NEW",
    coverLetter: "I love creating intuitive designs..."
  }
];

export const RECRUITER_INTERVIEWS = [
  {
    interviewId: 1,
    candidateName: "Arun Kumar",
    position: "Java Developer Intern",
    date: "2026-08-13",
    time: "14:30",
    interviewer: "Ramesh Iyer",
    type: "Google Meet",
    status: "SCHEDULED"
  },
  {
    interviewId: 2,
    candidateName: "Priya Sharma",
    position: "Frontend Developer Intern",
    date: "2026-08-13",
    time: "16:00",
    interviewer: "Sneha Kapoor",
    type: "In-person",
    status: "SCHEDULED"
  },
  {
    interviewId: 3,
    candidateName: "Rahul Kumar",
    position: "Software Engineer Intern",
    date: "2026-08-14",
    time: "10:00",
    interviewer: "Vijay Menon",
    type: "Microsoft Teams",
    status: "PENDING"
  }
];

export const RECRUITER_MESSAGES = [
  {
    id: 1,
    candidateName: "Rahul Kumar",
    position: "Software Engineer Intern",
    lastMessage: "Thank you for the opportunity. I have submitted my assignment.",
    time: "2 hours ago",
    unread: true,
    online: true
  },
  {
    id: 2,
    candidateName: "Priya Sharma",
    position: "Frontend Developer Intern",
    lastMessage: "Could you please share the interview schedule?",
    time: "5 hours ago",
    unread: true,
    online: false
  },
  {
    id: 3,
    candidateName: "Arun Kumar",
    position: "Java Developer Intern",
    lastMessage: "Interview rescheduled to 3 PM.",
    time: "1 day ago",
    unread: false,
    online: false
  }
];

export const RECRUITER_NOTIFICATIONS = [
  { id: 1, message: "New application received for Software Engineer Intern", time: "10 minutes ago", read: false, type: "application" },
  { id: 2, message: "Rahul Kumar submitted assignment for Software Engineer Intern", time: "1 hour ago", read: false, type: "message" },
  { id: 3, message: "Interview scheduled with Arun Kumar - Today at 2:30 PM", time: "2 hours ago", read: false, type: "interview" },
  { id: 4, message: "Priya Sharma accepted interview invitation", time: "3 hours ago", read: true, type: "interview" },
  { id: 5, message: "Data Science Intern deadline approaching in 3 days", time: "5 hours ago", read: true, type: "deadline" },
  { id: 6, message: "Weekly hiring report is ready", time: "1 day ago", read: true, type: "report" }
];

export const RECRUITER_ANALYTICS = {
  applicationsOverTime: [
    { date: "Aug 1", count: 12 }, { date: "Aug 2", count: 19 }, { date: "Aug 3", count: 15 },
    { date: "Aug 4", count: 25 }, { date: "Aug 5", count: 22 }, { date: "Aug 6", count: 30 },
    { date: "Aug 7", count: 28 }, { date: "Aug 8", count: 35 }, { date: "Aug 9", count: 32 },
    { date: "Aug 10", count: 40 }, { date: "Aug 11", count: 38 }, { date: "Aug 12", count: 45 },
    { date: "Aug 13", count: 42 }
  ],
  applicationsByInternship: [
    { name: "Software Engineer Intern", count: 126 },
    { name: "Frontend Developer Intern", count: 89 },
    { name: "Data Science Intern", count: 67 },
    { name: "Product Design Intern", count: 45 },
    { name: "Backend Developer Intern", count: 15 }
  ],
  conversionFunnel: [
    { stage: "Applied", count: 342 },
    { stage: "Screening", count: 186 },
    { stage: "Shortlisted", count: 48 },
    { stage: "Interview", count: 21 },
    { stage: "Selected", count: 7 }
  ],
  metrics: {
    applicationRate: "342",
    shortlistRate: "14%",
    interviewRate: "6.1%",
    selectionRate: "2.0%",
    avgTimeToHire: "12 days"
  },
  topSkills: [
    { skill: "Java", count: 89 }, { skill: "React", count: 76 }, { skill: "Python", count: 65 },
    { skill: "SQL", count: 54 }, { skill: "JavaScript", count: 48 }, { skill: "Spring Boot", count: 42 },
    { skill: "Data Science", count: 38 }, { skill: "Machine Learning", count: 35 }
  ],
  topUniversities: [
    { name: "Anna University", count: 45 }, { name: "PES University", count: 38 },
    { name: "IIT Bombay", count: 32 }, { name: "DTU", count: 28 }, { name: "NIT Trichy", count: 24 }
  ]
};

export const COMPANY_PROFILE = {
  name: "TechNova Inc.",
  industry: "Software Development",
  size: "50-200 employees",
  location: "Chennai, India",
  website: "https://technova.example.com",
  about: "TechNova is a fast-growing software company building next-generation cloud solutions for enterprises worldwide.",
  culture: "We believe in innovation, collaboration, and continuous learning. Our team enjoys flexible work hours, mentorship programs, and a supportive environment.",
  benefits: ["Health Insurance", "Flexible Hours", "Remote Work", "Learning Budget", "Team Outings"],
  mission: "To empower businesses with intelligent technology solutions.",
  socialLinks: { linkedin: "https://linkedin.com/company/technova", twitter: "https://twitter.com/technova" }
};
