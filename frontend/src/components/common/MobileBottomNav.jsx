import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Bookmark, FileText, User } from 'lucide-react';

const items = [
    { to: '/student/dashboard', label: 'Home', Icon: Home },
    { to: '/internships', label: 'Search', Icon: Search },
    { to: '/student/saved', label: 'Saved', Icon: Bookmark },
    { to: '/student/applications', label: 'Applications', Icon: FileText },
    { to: '/student/profile', label: 'Profile', Icon: User },
];

const MobileBottomNav = () => (
    <nav className="mobile-bottom-nav" aria-label="Mobile primary">
        {items.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
            </NavLink>
        ))}
    </nav>
);

export default MobileBottomNav;
