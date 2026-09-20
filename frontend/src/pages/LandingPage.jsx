import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { skillAPI } from '../api/skillAPI';
import api from '../api/api';
import Logo from '../components/common/Logo';
import { Icon } from '../components/common/Icon';

const LandingPage = () => {
    const [skills, setSkills] = useState([]);
    const [stats, setStats] = useState({ internships: null, companies: null, jobs: null });
    const [featured, setFeatured] = useState([]);
    const [q, setQ] = useState('');
    const [loc, setLoc] = useState('');
    const navigate = useNavigate();

    const heroSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (q) params.set('keyword', q);
        if (loc) params.set('location', loc);
        navigate(`/internships?${params.toString()}`);
    };

    useEffect(() => {
        skillAPI.getAll().then(r => setSkills(Array.isArray(r.data) ? r.data.slice(0, 15) : [])).catch(() => {});
        // Public live counts (all GET endpoints below are permitAll)
        Promise.allSettled([
            api.get('/internships'),
            api.get('/companies'),
            api.get('/jobs'),
        ]).then(([i, c, j]) => {
            setStats({
                internships: i.status === 'fulfilled' && Array.isArray(i.value.data) ? i.value.data.length : null,
                companies: c.status === 'fulfilled' && Array.isArray(c.value.data) ? c.value.data.length : null,
                jobs: j.status === 'fulfilled' && Array.isArray(j.value.data) ? j.value.data.length : null,
            });
            if (i.status === 'fulfilled' && Array.isArray(i.value.data)) setFeatured(i.value.data.slice(0, 3));
        });
    }, []);
    return (
        <div className="landing-page">
            <nav className="navbar">
                <Link to="/" className="navbar-brand" style={{display: 'inline-flex'}}><Logo /></Link>
                <div className="nav-links">
                    <Link to="/internships" className="nav-link">Internships</Link>
                    <Link to="/jobs" className="nav-link">Jobs</Link>
                    <Link to="/companies" className="nav-link">Companies</Link>
                    <Link to="/students" className="nav-link">Students</Link>
                    <Link to="/resources" className="nav-link">Resources</Link>
                </div>
                <div className="nav-divider"></div>
                <div className="nav-cta d-flex" style={{gap: '0.75rem'}}>
                    <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                    <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                </div>
            </nav>

            <section className="landing-hero">
                <div className="hero-inner" style={{maxWidth: '860px', margin: '0 auto'}}>
                    <h1>Find internships.<br />Build your career.</h1>
                    <p className="hero-desc" style={{color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '1rem'}}>
                        Discover opportunities matched to your skills, interests and career goals.
                    </p>
                    <form onSubmit={heroSearch} className="landing-search">
                        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Job title, skill or company" />
                        <input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="Location" style={{maxWidth: '200px'}} />
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                    <div className="landing-stats">
                        <div className="landing-stat">
                            <div className="num">{stats.internships ?? '—'}</div>
                            <div className="lbl">Internships</div>
                        </div>
                        <div className="landing-stat">
                            <div className="num">{stats.companies ?? '—'}</div>
                            <div className="lbl">Companies</div>
                        </div>
                        <div className="landing-stat">
                            <div className="num">{stats.jobs ?? '—'}</div>
                            <div className="lbl">Jobs</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="skills-section">
                <div className="section-header">
                    <h2>Popular Skills</h2>
                    <p>Explore internships by your most in-demand skills</p>
                </div>
                <div className="skills-list">
                    {skills.length === 0 ? <span className="text-muted">Loading skills...</span> :
                        skills.map(s => (
                            <Link key={s.skillId} to={`/internships?skill=${encodeURIComponent(s.skillName)}`} className="skill-chip">
                                {s.skillName}
                            </Link>
                        ))}
                </div>
            </section>

            {featured.length > 0 && (
            <section className="section">
                <div className="section-header" style={{textAlign: 'center', marginBottom: '2rem'}}>
                    <h2>Recommended Internships</h2>
                    <p className="text-secondary">Fresh openings live on the platform right now</p>
                </div>
                <div className="cards-3" style={{maxWidth: '1100px', margin: '0 auto'}}>
                    {featured.map(int => (
                        <div key={int.internshipId} className="job-card">
                            <div className="company-mark">{int.company?.companyName?.charAt(0)}</div>
                            <h3 style={{fontSize: '1.1rem'}}>{int.title}</h3>
                            <div className="text-secondary" style={{fontSize: '0.9rem'}}>{int.location} • {int.workType}</div>
                            <div style={{fontWeight: 700}}><Icon name="stipend" size={14} /> {int.stipend ?? '—'}</div>
                            <Link to={`/internships/${int.internshipId}`} className="btn btn-outline btn-sm" style={{marginTop: '0.5rem'}}>View Details</Link>
                        </div>
                    ))}
                </div>
            </section>
            )}

            <section className="section">
                <div className="section-header">
                    <h2>Why InternLite?</h2>
                    <p>The modern way to discover internships and launch your career</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><Icon name="search" size={14} /></div>
                        <h3>Smart Search</h3>
                        <p>Find internships by role, skills, location, and company. Filter exactly what you need.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📝</div>
                        <h3>Easy Applications</h3>
                        <p>Apply to multiple internships with a single click. Track all your applications in one place.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>Personalized Matches</h3>
                        <p>Get internship recommendations based on your skills, interests, and career goals.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Icon name="companies" size={14} /></div>
                        <h3>Top Companies</h3>
                        <p>Connect with startups and established companies actively hiring interns.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Icon name="analytics" size={14} /></div>
                        <h3>Application Tracking</h3>
                        <p>Track your application status from Applied to Selected. Never miss an update.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Icon name="notifications" size={14} /></div>
                        <h3>Real-time Updates</h3>
                        <p>Get notified about new internships, application status changes, and interview invites.</p>
                    </div>
                </div>
            </section>

            <section className="section" style={{background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', textAlign: 'center'}}>
                <div style={{maxWidth: '700px', margin: '0 auto'}}>
                    <h2 style={{marginBottom: '1rem'}}>Ready to find your internship?</h2>
                    <p style={{color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem'}}>
                        Join thousands of students who have already found their dream internships through InternLite.
                    </p>
                    <div className="d-flex justify-center" style={{gap: '1rem', flexWrap: 'wrap'}}>
                        <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
                        <Link to="/internships" className="btn btn-outline btn-lg">Browse Internships</Link>
                    </div>
                </div>
            </section>

            <footer style={{background: 'var(--text-primary)', color: '#fff', padding: '3rem 1.5rem', textAlign: 'center'}}>
                <div style={{maxWidth: '1200px', margin: '0 auto'}}>
                    <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}><Logo size="lg" /></div>
                    <p style={{color: '#94A3B8', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem'}}>
                        Discover Internships. Build Experience. Launch Your Career.
                    </p>
                    <div className="d-flex justify-center" style={{gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem'}}>
                        <Link to="/internships" style={{color: '#CBD5E1'}}>Internships</Link>
                        <Link to="/jobs" style={{color: '#CBD5E1'}}>Jobs</Link>
                        <Link to="/companies" style={{color: '#CBD5E1'}}>Companies</Link>
                        <Link to="/resources" style={{color: '#CBD5E1'}}>Resources</Link>
                    </div>
                    <p style={{color: '#64748B', fontSize: '0.875rem'}}>© 2026 InternLite. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
