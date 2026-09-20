import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { skillAPI } from '../../api/skillAPI';
import { categoryAPI } from '../../api/categoryAPI';
import { Icon } from '../../components/common/Icon';

const GUIDES = [
    { icon: 'applications', title: 'Resume Building Guide', body: 'Keep it to one page. Lead with skills and projects, quantify impact (e.g. "cut load time 30%"), and tailor keywords to each internship description.' },
    { icon: 'messages', title: 'Interview Preparation', body: 'Research the company, prepare STAR stories for teamwork and problem-solving, and keep 2–3 smart questions ready for the interviewer.' },
    { icon: 'resources', title: 'Writing Cover Letters', body: 'Three short paragraphs: why this role, why you (one concrete proof), and a clear closing ask. Never send a generic template.' },
    { icon: 'target', title: 'Cracking Applications', body: 'Apply early, complete your profile 100%, add at least 5 skills, and track every application status from your tracker page.' },
    { icon: 'users', title: 'Networking Basics', body: 'Maintain a clean LinkedIn/GitHub presence, engage with company posts, and follow up politely after interviews within 24 hours.' },
    { icon: 'analytics', title: 'Upskilling Roadmap', body: 'Pick one stack (e.g. Java + Spring Boot + React), build two portfolio projects, and earn visible proof before you apply widely.' },
];

const ResourcesPage = () => {
    const [skills, setSkills] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        skillAPI.getAll().then(r => setSkills(Array.isArray(r.data) ? r.data.slice(0, 15) : [])).catch(() => {});
        categoryAPI.getCategories().then(r => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    }, []);

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header">
                <h1>Resources</h1>
                <p>Career guides, resume tips, and in-demand skills — powered by live platform data.</p>
            </div>

            <div className="grid grid-cols-1" style={{gap: '1rem', marginBottom: '2rem'}}>
                {GUIDES.map(g => (
                    <div key={g.title} className="internship-card">
                        <div className="card-header"><div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}><Icon name={g.icon} size={18} /><h3 style={{margin: 0}}>{g.title}</h3></div></div>
                        <p className="text-secondary" style={{lineHeight: '1.7'}}>{g.body}</p>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Icon name="target" size={18} /> In-demand Skills (live)</h3>
                    <div className="skills-list">
                        {skills.length === 0 ? <span className="text-muted">No skills data yet.</span> :
                            skills.map(s => <Link key={s.skillId} to={`/internships?skill=${encodeURIComponent(s.skillName)}`} className="skill-chip">{s.skillName}</Link>)}
                    </div>
                </div>
                <div className="card">
                    <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Icon name="companies" size={18} /> Explore Categories (live)</h3>
                    <div className="skills-list">
                        {categories.length === 0 ? <span className="text-muted">No categories yet.</span> :
                            categories.map(c => <Link key={c.categoryId} to={`/internships?category=${encodeURIComponent(c.categoryName)}`} className="skill-chip">{c.categoryName}</Link>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourcesPage;
