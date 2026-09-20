import {
    LayoutDashboard, Search, Briefcase, Users, Calendar, MessageCircle, BarChart3,
    Building2, Settings, Bell, Star, Plus, Activity, ShieldCheck, FileText, FileBarChart,
    GraduationCap, Bookmark, Target, Inbox, SearchX, BriefcaseBusiness, MapPin, Clock3, Banknote, CalendarDays
} from 'lucide-react';

export const iconMap = {
    dashboard: LayoutDashboard,
    search: Search,
    internships: BriefcaseBusiness,
    jobs: Briefcase,
    companies: Building2,
    students: GraduationCap,
    resources: FileText,
    saved: Bookmark,
    applications: FileText,
    interviews: Calendar,
    messages: MessageCircle,
    notifications: Bell,
    profile: Users,
    settings: Settings,
    active: Activity,
    analytics: BarChart3,
    reports: FileBarChart,
    audit: ShieldCheck,
    overview: LayoutDashboard,
    users: Users,
    shortlisted: Star,
    post: Plus,
    company: Building2,
    // meta
    location: MapPin,
    work: Briefcase,
    duration: Clock3,
    stipend: Banknote,
    date: CalendarDays,
    match: Star,
    // empty
    emptySearch: SearchX,
    emptyInbox: Inbox,
    emptyBriefcase: BriefcaseBusiness,
    target: Target,
};

export const Icon = ({ name, size = 18, strokeWidth = 1.75, className, style }) => {
    const C = iconMap[name] || Briefcase;
    return <C size={size} strokeWidth={strokeWidth} className={className} style={style} />;
};

export default Icon;
