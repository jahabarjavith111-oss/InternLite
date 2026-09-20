import { useState, useEffect } from 'react';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import { recruiterAPI } from '../../api/recruiterAPI';
import api from '../../api/api';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';

const RecruiterDashboard = () => {
    const [stats, setStats] = useState(null);
    const [internships, setInternships] = useState([]);
    const [apps, setApps] = useState([]);
    const [allApps, setAllApps] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [sRes, iRes] = await Promise.allSettled([
                    recruiterAPI.getRecruiterStats(),
                    recruiterAPI.getMyInternships(),
                ]);
                if (!mounted) return;
                if (sRes.status === 'fulfilled') setStats(sRes.value.data);
                const list = iRes.status === 'fulfilled' && Array.isArray(iRes.value.data) ? iRes.value.data : [];
                setInternships(list);
                // Aggregate recent applications across internships
                const all = [];
                for (const i of list.slice(0, 10)) {
                    try {
                        const r = await recruiterAPI.getInternshipApplications(i.internshipId);
                        (Array.isArray(r.data) ? r.data : []).forEach(a => all.push(a));
                    } catch { /* skip */ }
                }
                if (!mounted) return;
                all.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
                setAllApps(all);
                setApps(all.slice(0, 5));
                // Interviews for recent INTERVIEW applications
                const withIv = all.filter(a => a.status === 'INTERVIEW').slice(0, 3);
                const ivDetails = await Promise.allSettled(withIv.map(a => api.get(`/interviews/application/${a.applicationId}`)));
                setInterviews(ivDetails.map((d, idx) => ({ raw: d.status === 'fulfilled' ? d.value.data : null, app: withIv[idx] })).filter(x => x.raw));
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const cards = [
        { label: 'Internships', value: stats?.activeInternships ?? internships.filter(i => i.status === 'OPEN').length, icon: 'internships' },
        { label: 'Applicants', value: stats?.totalApplicants ?? allApps.length, icon: 'users' },
        { label: 'Shortlisted', value: stats?.shortlisted ?? allApps.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length, icon: 'shortlisted' },
        { label: 'Interviews', value: stats?.interviews ?? interviews.length, icon: 'interviews' },
    ];

    const countFor = (id) => allApps.filter(a => (a.internship?.internshipId ?? a.internship) === id || String(a.internship?.internshipId) === String(id));
    const maxApps = Math.max(1, ...internships.map(i => countFor(i.internshipId).length));

    const pipeline = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'].map(s => ({
        stage: s, count: apps.filter(a => a.status === s).length || (s === 'APPLIED' ? apps.length : 0),
    }));
    const maxPipe = Math.max(1, ...pipeline.map(p => p.count));

    if (loading) return <div className="recruiter-layout"><RecruiterSidebar /><main className="recruiter-main"><div className="loading-spinner">Loading dashboard...</div></main></div>;

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <RecruiterHeader
                    title="Dashboard"
                    subtitle="Manage your hiring pipeline and discover talented students."
                    primaryAction={true}
                />

                <div className="recruiter-content">
                    <div className="stats-grid">
                        {cards.map((stat) => (
                            <div key={stat.label} className="stat-card">
                                <div className="stat-icon" style={{display: 'inline-flex'}}><Icon name={stat.icon} size={22} /></div>
                                <div className="num">{stat.value}</div>
                                <div className="label">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="d-flex justify-between items-center" style={{margin: '1.5rem 0 1rem'}}>
                        <h3 style={{fontSize: '1.25rem'}}>Your Internships</h3>
                        <Link to="/recruiter/post-internship" className="btn btn-primary btn-sm">+ Post Internship</Link>
                    </div>

                    <div className="dashboard-grid">
                        <div className="dashboard-left">
                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <div className="card-header" style={{marginBottom: '1.5rem'}}>
                                    <h3 style={{fontSize: '1.15rem'}}>Recent Applicants</h3>
                                    <Link to="/recruiter/applicants" className="btn btn-outline btn-sm">View All</Link>
                                </div>
                                {apps.length === 0 ? <p className="text-muted">No applicants yet.</p> : (
                                <div className="application-list">
                                    {apps.map(app => (
                                        <div key={app.applicationId} className="application-row">
                                            <div className="application-row-main">
                                                <div className="candidate-avatar">{(app.student?.user?.name || 'S').charAt(0)}</div>
                                                <div className="application-row-info">
                                                    <div className="app-title">{app.student?.user?.name || 'Student'}</div>
                                                    <div className="app-company">{app.internship?.title}</div>
                                                </div>
                                            </div>
                                            <div className="application-row-meta">
                                                <div className="app-time">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}</div>
                                                <span className={`badge status-${app.status}`}>{app.status}</span>
                                            </div>
                                            <div className="application-row-actions">
                                                <Link to={`/recruiter/candidate/${app.applicationId}`} className="btn btn-outline btn-sm">View</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                )}
                            </div>
                        </div>

                        <div className="dashboard-right">
                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <div className="card-header" style={{marginBottom: '1.5rem'}}>
                                    <h3 style={{fontSize: '1.15rem'}}>Recruitment Pipeline</h3>
                                </div>
                                <div className="pipeline-vertical">
                                    {pipeline.map((p) => (
                                        <div key={p.stage} className="pipeline-stage-row">
                                            <div className="pipeline-stage-info">
                                                <span className="pipeline-stage-name">{p.stage}</span>
                                            </div>
                                            <div className="pipeline-stage-count">{p.count}</div>
                                            <div className="pipeline-bar-bg">
                                                <div className="pipeline-bar-fill" style={{ width: `${(p.count / maxPipe) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <div className="card-header" style={{marginBottom: '1.5rem'}}>
                                    <h3 style={{fontSize: '1.15rem'}}>Upcoming Interviews</h3>
                                    <Link to="/recruiter/interviews" className="btn btn-outline btn-sm">View All</Link>
                                </div>
                                {interviews.length === 0 ? <p className="text-muted">No interviews scheduled.</p> : (
                                <div className="interview-list">
                                    {interviews.map(({ raw, app }) => (
                                        <div key={raw.interviewId} className="interview-row">
                                            <div className="interview-row-main">
                                                <div className="interview-avatar">{(app.student?.user?.name || 'S').charAt(0)}</div>
                                                <div className="interview-info">
                                                    <div className="interview-candidate">{app.student?.user?.name}</div>
                                                    <div className="interview-position">{app.internship?.title}</div>
                                                </div>
                                            </div>
                                            <div className="interview-meta">
                                                <div className="interview-date">📅 {raw.scheduledAt ? new Date(raw.scheduledAt).toLocaleString() : ''}</div>
                                                <div className="interview-type">{raw.interviewType}</div>
                                                <span className="badge badge-success">{raw.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="section" style={{padding: '2rem 0'}}>
                        <div className="card-header" style={{marginBottom: '1.5rem'}}>
                            <h3 style={{fontSize: '1.25rem'}}>Active Internships</h3>
                            <div className="d-flex" style={{gap: '0.5rem'}}>
                                <Link to="/recruiter/post-internship" className="btn btn-primary btn-sm">+ Post Internship</Link>
                                <Link to="/recruiter/internships" className="btn btn-outline btn-sm">View All</Link>
                            </div>
                        </div>
                        {internships.filter(i => i.status === 'OPEN').length === 0 ? <p className="text-muted">No active internships. <Link to="/recruiter/post-internship">Post one</Link>.</p> : (
                        <div className="internship-grid">
                            {internships.filter(i => i.status === 'OPEN').slice(0, 6).map(int => {
                                const list = countFor(int.internshipId);
                                const shorted = list.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length;
                                return (
                                <div key={int.internshipId} className="internship-card">
                                    <div className="card-header" style={{marginBottom: '0.75rem'}}>
                                        <div>
                                            <h3 style={{fontSize: '1.05rem', marginBottom: '0.25rem'}}>{int.title}</h3>
                                            <div className="company-meta">{int.category?.categoryName || ''} • {int.location} • {int.workType}</div>
                                        </div>
                                        <span className="badge badge-success">{int.status}</span>
                                    </div>
                                    <div className="text-secondary" style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>{list.length} Applications • {shorted} Shortlisted</div>
                                    <div className="progress-track" style={{marginBottom: '1rem'}}><div className="progress-fill" style={{width: `${(list.length / maxApps) * 100}%`}}></div></div>
                                    <div className="card-footer d-flex" style={{justifyContent: 'space-between'}}>
                                        <div className="d-flex" style={{gap: '0.5rem'}}>
                                            <Link to={`/recruiter/applicants?internshipId=${int.internshipId}`} className="btn btn-outline btn-sm">Applicants</Link>
                                            <Link to={`/recruiter/internships/${int.internshipId}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                                            <Link to={`/recruiter/analytics?internshipId=${int.internshipId}`} className="btn btn-outline btn-sm">Analytics</Link>
                                        </div>
                                        <span className="text-muted" style={{fontSize: '0.8rem'}}>Deadline: {int.applicationDeadline || '—'}</span>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RecruiterDashboard;
