import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, BrainCircuit, BarChart3 } from 'lucide-react';
import { skillAPI } from '../api/skillAPI';
import api from '../api/api';
import { savedAPI } from '../api/savedAPI';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import SearchBar from '../components/common/SearchBar';
import InternshipCard from '../components/internships/InternshipCard';
import { Icon } from '../components/common/Icon';

const POPULAR = ['Software Engineer', 'AI', 'Data Science', 'UI/UX'];

const LandingPage = () => {
    const [skills, setSkills] = useState([]);
    const [stats, setStats] = useState({ internships: null, companies: null, jobs: null });
    const [featured, setFeatured] = useState([]);
    const [savedIds, setSavedIds] = useState(new Set());
    const [categoryCounts, setCategoryCounts] = useState({ software: null, ai: null, data: null });
    const [q, setQ] = useState('');
    const [loc, setLoc] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        skillAPI
            .getAll()
            .then((r) => setSkills(Array.isArray(r.data) ? r.data.slice(0, 12) : []))
            .catch(() => {});
        Promise.allSettled([api.get('/internships'), api.get('/companies'), api.get('/jobs')]).then(([i, c, j]) => {
            const list = i.status === 'fulfilled' && Array.isArray(i.value.data) ? i.value.data : [];
            setStats({
                internships: i.status === 'fulfilled' && Array.isArray(i.value.data) ? i.value.data.length : null,
                companies: c.status === 'fulfilled' && Array.isArray(c.value.data) ? c.value.data.length : null,
                jobs: j.status === 'fulfilled' && Array.isArray(j.value.data) ? j.value.data.length : null,
            });
            if (list.length) {
                setFeatured(list.slice(0, 3));
                const has = (t, ...keys) => keys.some((k) => String(t || '').toLowerCase().includes(k));
                setCategoryCounts({
                    software: list.filter((x) => has(x.title + ' ' + (x.category?.categoryName || ''), 'software', 'web', 'frontend', 'backend', 'full stack')).length,
                    ai: list.filter((x) => has(x.title + ' ' + (x.category?.categoryName || ''), 'ai', 'ml', 'machine', 'artificial')).length,
                    data: list.filter((x) => has(x.title + ' ' + (x.category?.categoryName || ''), 'data', 'analy', 'science')).length,
                });
            }
        });
        if (user) {
            savedAPI
                .getSaved()
                .then((r) => {
                    const ids = new Set((Array.isArray(r.data) ? r.data : []).map((s) => s.internship?.internshipId).filter(Boolean));
                    setSavedIds(ids);
                })
                .catch(() => {});
        }
    }, [user]);

    const heroSearch = () => {
        const params = new URLSearchParams();
        if (q) params.set('keyword', q);
        if (loc) params.set('location', loc);
        navigate(`/internships?${params.toString()}`);
    };

    const toggleSave = async (job) => {
        if (!user) {
            navigate('/login');
            return;
        }
        const id = job.internshipId;
        try {
            if (savedIds.has(id)) {
                await savedAPI.unsaveInternship(id);
                setSavedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            } else {
                await savedAPI.saveInternship(id);
                setSavedIds((prev) => new Set(prev).add(id));
            }
        } catch {
            navigate('/login');
        }
    };

    const categories = [
        { name: 'Software', roles: categoryCounts.software ?? 340, Icon: Code2, query: 'software' },
        { name: 'AI & ML', roles: categoryCounts.ai ?? 180, Icon: BrainCircuit, query: 'AI' },
        { name: 'Data', roles: categoryCounts.data ?? 120, Icon: BarChart3, query: 'data' },
    ];

    return (
        <div className="landing-page">
            <main id="main" role="main">
                <section className="hero" aria-labelledby="hero-title">
                    <div className="container hero-inner">
                        <h1 id="hero-title">
                            Find internships.
                            <br />
                            Build your career.
                        </h1>
                        <p className="hero-desc">Discover opportunities matched to your skills, interests and career goals.</p>

                        <SearchBar keyword={q} location={loc} onKeyword={setQ} onLocation={setLoc} onSubmit={heroSearch} />

                        <div className="popular-row" aria-label="Popular searches">
                            <span>Popular:</span>
                            {POPULAR.map((p) => (
                                <button key={p} type="button" onClick={() => navigate(`/internships?keyword=${encodeURIComponent(p)}`)}>
                                    {p}
                                </button>
                            ))}
                        </div>

                        <div className="hero-stats" aria-label="Platform statistics" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                            <div className="hero-stat">
                                <div className="hero-stat-num">{stats.internships ?? '—'}</div>
                                <div className="hero-stat-label">Internships</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-num">{stats.companies ?? '—'}</div>
                                <div className="hero-stat-label">Companies</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-num">{stats.jobs ?? '—'}</div>
                                <div className="hero-stat-label">Jobs</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section" aria-labelledby="categories-title">
                    <div className="container">
                        <header className="section-header">
                            <h2 id="categories-title">Discover opportunities built for your future</h2>
                            <p>Explore internships by category</p>
                        </header>
                        <div className="grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
                            {categories.map(({ name, roles, Icon: CIcon, query }) => (
                                <button key={name} type="button" className="card category-card" onClick={() => navigate(`/internships?keyword=${encodeURIComponent(query)}`)}>
                                    <span className="feature-icon" aria-hidden="true">
                                        <CIcon size={22} />
                                    </span>
                                    <strong style={{ fontSize: '1.05rem' }}>{name}</strong>
                                    <span className="count">{roles} roles</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {featured.length > 0 && (
                    <section className="section" aria-labelledby="featured-title">
                        <div className="container">
                            <header className="section-header">
                                <h2 id="featured-title">Featured Internships</h2>
                                <p>Fresh openings live on the platform right now</p>
                            </header>
                            <div className="grid-3" style={{ maxWidth: 1100, margin: '0 auto' }}>
                                {featured.map((int) => (
                                    <InternshipCard key={int.internshipId} job={int} saved={savedIds.has(int.internshipId)} onToggleSave={toggleSave} />
                                ))}
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                <Link to="/internships" className="btn btn-outline">
                                    Browse all internships
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                <section className="section skills-section" aria-labelledby="skills-title">
                    <div className="container">
                        <header className="section-header">
                            <h2 id="skills-title">Popular Skills</h2>
                            <p>Explore internships by the most in-demand skills</p>
                        </header>
                        <div className="skills-list" role="list" style={{ justifyContent: 'center' }}>
                            {skills.length === 0 ? (
                                <span className="text-muted">Loading skills…</span>
                            ) : (
                                skills.map((s) => (
                                    <Link key={s.skillId} to={`/internships?skill=${encodeURIComponent(s.skillName)}`} className="skill-chip">
                                        {s.skillName}
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <section className="section" aria-labelledby="features-title">
                    <div className="container">
                        <header className="section-header">
                            <h2 id="features-title">Why InternLite?</h2>
                            <p>The modern way to discover internships and launch your career</p>
                        </header>
                        <div className="grid-3 features-grid">
                            <article className="feature-card card">
                                <div className="feature-icon" aria-hidden="true">
                                    <Icon name="search" size={20} />
                                </div>
                                <h3>Smart Search</h3>
                                <p className="text-secondary">Find internships by role, skills, location, and company.</p>
                            </article>
                            <article className="feature-card card">
                                <div className="feature-icon" aria-hidden="true">
                                    <Icon name="applications" size={20} />
                                </div>
                                <h3>Easy Applications</h3>
                                <p className="text-secondary">Apply in one click and track every application in one place.</p>
                            </article>
                            <article className="feature-card card">
                                <div className="feature-icon" aria-hidden="true">
                                    <Icon name="match" size={20} />
                                </div>
                                <h3>Personalized Matches</h3>
                                <p className="text-secondary">Get recommendations based on your skills and career goals.</p>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="section cta-section" aria-labelledby="cta-title">
                    <div className="container cta-inner">
                        <h2 id="cta-title">Ready to find your internship?</h2>
                        <p>Join thousands of students who found their internships through InternLite.</p>
                        <div className="cta-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Create Free Account
                            </Link>
                            <Link to="/internships" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
                                Browse Internships
                            </Link>
                        </div>
                    </div>
                </section>

                <footer className="site-footer" role="contentinfo">
                    <div className="container footer-inner">
                        <div className="footer-brand">
                            <Link to="/" className="footer-logo" aria-label="InternLite home">
                                <Logo size="lg" />
                            </Link>
                            <p className="footer-tagline text-secondary">Discover Internships. Build Experience. Launch Your Career.</p>
                        </div>
                        <nav className="footer-nav" aria-label="Footer navigation">
                            <ul role="list" className="footer-links">
                                <li>
                                    <Link to="/internships">Internships</Link>
                                </li>
                                <li>
                                    <Link to="/jobs">Jobs</Link>
                                </li>
                                <li>
                                    <Link to="/companies">Companies</Link>
                                </li>
                                <li>
                                    <Link to="/resources">Resources</Link>
                                </li>
                            </ul>
                        </nav>
                        <p className="footer-copyright text-muted">© 2026 InternLite. All rights reserved.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default LandingPage;
