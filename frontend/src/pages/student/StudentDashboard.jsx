import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { internshipAPI } from '../../api/internshipAPI';
import { recommendationAPI } from '../../api/recommendationAPI';
import { notificationAPI } from '../../api/notificationAPI';
import { studentAPI } from '../../api/studentAPI';
import { savedAPI } from '../../api/savedAPI';
import SearchBar from '../../components/common/SearchBar';
import InternshipCard from '../../components/internships/InternshipCard';
import { Icon } from '../../components/common/Icon';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [internships, setInternships] = useState([]);
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [apps, setApps] = useState([]);
    const [notifs, setNotifs] = useState([]);
    const [recs, setRecs] = useState([]);
    const [mySkills, setMySkills] = useState([]);
    const [saved, setSaved] = useState([]);
    const [savedIds, setSavedIds] = useState(new Set());
    const [interviews, setInterviews] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const [intRes, appRes, notifRes, recRes, mySkillRes, savedRes, profRes] = await Promise.allSettled([
                    internshipAPI.getInternships({}),
                    internshipAPI.getMyApplications(),
                    notificationAPI.getMyNotifications(),
                    recommendationAPI.getRecommendations(),
                    studentAPI.getSkills(),
                    savedAPI.getSaved(),
                    studentAPI.getProfile(),
                ]);
                if (!mounted) return;
                if (intRes.status === 'fulfilled' && Array.isArray(intRes.value.data)) setInternships(intRes.value.data);
                if (appRes.status === 'fulfilled' && Array.isArray(appRes.value.data)) {
                    const list = appRes.value.data;
                    setApps(list);
                    const withInterview = list.filter((a) => a.status === 'INTERVIEW');
                    const details = await Promise.allSettled(withInterview.map((a) => api.get(`/interviews/application/${a.applicationId}`)));
                    setInterviews(
                        details.filter((d) => d.status === 'fulfilled' && d.value.data).map((d, i) => ({ ...d.value.data, application: withInterview[i] }))
                    );
                }
                if (notifRes.status === 'fulfilled' && Array.isArray(notifRes.value.data)) {
                    setNotifs(
                        notifRes.value.data.map((n) => ({
                            id: n.notificationId,
                            message: n.message,
                            time: n.createdAt ? new Date(n.createdAt).toLocaleString() : '',
                            read: n.read,
                            raw: n,
                        }))
                    );
                }
                if (recRes.status === 'fulfilled' && Array.isArray(recRes.value.data)) {
                    setRecs(recRes.value.data.map((x) => ({ ...(x.internship || x), matchScore: x.matchScore })));
                }
                if (mySkillRes.status === 'fulfilled' && Array.isArray(mySkillRes.value.data)) {
                    setMySkills(mySkillRes.value.data.map((s) => s.skill).filter(Boolean));
                }
                if (savedRes.status === 'fulfilled' && Array.isArray(savedRes.value.data)) {
                    setSaved(savedRes.value.data);
                    setSavedIds(new Set(savedRes.value.data.map((s) => s.internship?.internshipId).filter(Boolean)));
                }
                if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
            } catch {
                setError('Failed to load dashboard. Check backend connection.');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (search) params.set('keyword', search);
        if (location) params.set('location', location);
        navigate(`/internships?${params.toString()}`);
    };

    const toggleSave = async (job) => {
        const id = job.internshipId;
        try {
            if (savedIds.has(id)) {
                await savedAPI.unsaveInternship(id);
                setSavedIds((prev) => {
                    const n = new Set(prev);
                    n.delete(id);
                    return n;
                });
            } else {
                await savedAPI.saveInternship(id);
                setSavedIds((prev) => new Set(prev).add(id));
            }
        } catch {
            /* ignore */
        }
    };

    const recommended = recs.length ? recs.slice(0, 3) : internships.slice(0, 3);
    const completion = (() => {
        if (!profile) return 0;
        const fields = [profile.college, profile.degree, profile.branch, profile.location, profile.bio];
        const filled = fields.filter(Boolean).length;
        const skillsPct = mySkills.length ? 1 : 0;
        return Math.round(((filled + skillsPct) / (fields.length + 1)) * 100);
    })();

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    if (loading) return <div className="loading-spinner">Loading dashboard...</div>;

    return (
        <div>
            <div className="dashboard-header">
                <h1>
                    {greeting}, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p>Find your next opportunity.</p>
            </div>

            {error && (
                <div className="card" style={{ borderLeft: '4px solid #F04438', marginBottom: '1.5rem' }}>
                    <p style={{ color: '#F04438' }}>{error}</p>
                </div>
            )}

            <div style={{ maxWidth: 860, margin: '0 auto 1.5rem' }}>
                <SearchBar keyword={search} location={location} onKeyword={setSearch} onLocation={setLocation} onSubmit={handleSearch} />
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Icon name="applications" size={20} />
                    </div>
                    <div className="num">{apps.length}</div>
                    <div className="label">Applied</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Icon name="saved" size={20} />
                    </div>
                    <div className="num">{saved.length}</div>
                    <div className="label">Saved</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Icon name="interviews" size={20} />
                    </div>
                    <div className="num">{interviews.length}</div>
                    <div className="label">Interviews</div>
                </div>
            </div>

            <div className="profile-completion" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong>Profile completion</strong>
                    <span className="text-secondary">{completion}%</span>
                </div>
                <div className="progress">
                    <div className="progress-fill" style={{ width: `${completion}%` }} />
                </div>
                {completion < 100 && (
                    <Link to="/student/profile" className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem' }}>
                        Complete your profile →
                    </Link>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Recommended for you</h2>
                <Link to="/internships" className="btn btn-outline btn-sm">
                    Browse All
                </Link>
            </div>
            {recommended.length === 0 ? (
                <div className="card empty-state">
                    <h3>No recommendations yet</h3>
                    <p className="text-secondary">Add skills to your profile to get personalized matches.</p>
                    <Link to="/student/profile" className="btn btn-primary">
                        Update Profile
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {recommended.map((int) => (
                        <InternshipCard key={int.internshipId || int.id} job={int} saved={savedIds.has(int.internshipId)} onToggleSave={toggleSave} />
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Recent applications</h2>
                <Link to="/student/applications" className="btn btn-outline btn-sm">
                    View All
                </Link>
            </div>
            {apps.length === 0 ? (
                <div className="card empty-state">
                    <h3>No applications yet</h3>
                    <p className="text-secondary">Start applying to internships and track your progress here.</p>
                    <Link to="/internships" className="btn btn-primary">
                        Browse Internships
                    </Link>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
                    {apps.slice(0, 4).map((app) => (
                        <div key={app.applicationId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.25rem', borderBottom: '1px solid #F3F4F6' }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{app.internship?.title}</div>
                                <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                                    {app.internship?.company?.companyName}
                                </div>
                            </div>
                            <span className="badge badge-info">{app.status}</span>
                        </div>
                    ))}
                </div>
            )}

            {notifs.length > 0 && (
                <>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Latest updates</h2>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        {notifs.slice(0, 3).map((n) => (
                            <div key={n.id} style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid #F3F4F6' }}>
                                <div style={{ fontSize: '0.92rem' }}>{n.message}</div>
                                <div className="caption">{n.time}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            {null}
        </div>
    );
};

export default StudentDashboard;
