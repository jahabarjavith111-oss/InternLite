import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import { recruiterAPI } from '../../api/recruiterAPI';
import { Icon } from '../../components/common/Icon';

const AnalyticsPage = () => {
    const [searchParams] = useSearchParams();
    const focusId = searchParams.get('internshipId');
    const [period, setPeriod] = useState('30 Days');
    const [stats, setStats] = useState(null);
    const [internships, setInternships] = useState([]);
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [sRes, iRes] = await Promise.allSettled([recruiterAPI.getRecruiterStats(), recruiterAPI.getMyInternships()]);
                if (sRes.status === 'fulfilled') setStats(sRes.value.data);
                const list = iRes.status === 'fulfilled' && Array.isArray(iRes.value.data) ? iRes.value.data : [];
                setInternships(list);
                const all = [];
                for (const i of list) {
                    try {
                        const r = await recruiterAPI.getInternshipApplications(i.internshipId);
                        (Array.isArray(r.data) ? r.data : []).forEach(a => all.push({ ...a, internshipTitle: a.internship?.title || i.title }));
                    } catch { /* skip */ }
                }
                setApps(all);
            } finally { setLoading(false); }
        })();
    }, []);

    const filteredApps = focusId ? apps.filter(a => String(a.internship?.internshipId) === String(focusId) || String(a.internshipTitle) === String(focusId)) : apps;
    const total = filteredApps.length || 1;
    const shortlisted = filteredApps.filter(a => ['SHORTLISTED', 'INTERVIEW', 'SELECTED'].includes(a.status)).length;
    const interviews = filteredApps.filter(a => ['INTERVIEW', 'SELECTED'].includes(a.status)).length;
    const selected = filteredApps.filter(a => a.status === 'SELECTED').length;
    const byInternship = focusId ? [] : internships.map(i => ({ name: i.title, count: apps.filter(a => (a.internship?.internshipId ?? a.internshipTitle) === i.internshipId || a.internshipTitle === i.title).length })).slice(0, 8);
    const funnel = [
        { stage: 'APPLIED', count: filteredApps.length },
        { stage: 'SHORTLISTED', count: shortlisted },
        { stage: 'INTERVIEW', count: interviews },
        { stage: 'SELECTED', count: selected },
    ];

    if (loading) return <div className="recruiter-layout"><RecruiterSidebar /><main className="recruiter-main"><div className="loading-spinner">Loading analytics...</div></main></div>;

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <RecruiterHeader title="Analytics" subtitle={focusId ? `Focus: internship #${focusId}` : 'Live recruitment performance from backend.'} />
                <div className="recruiter-content">
                    <div className="card" style={{marginBottom: '1.5rem'}}>
                        <div className="d-flex" style={{gap: '0.5rem', flexWrap: 'wrap'}}>
                            {['7 Days', '30 Days', '90 Days', 'This Year'].map(p => (
                                <button key={p} onClick={() => setPeriod(p)} className={`btn ${period === p ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{p}</button>
                            ))}
                            <span className="text-muted" style={{marginLeft: 'auto'}}>Period: {period} • Active: {stats?.activeInternships ?? internships.length}</span>
                        </div>
                    </div>
                    <div className="stats-grid" style={{marginBottom: '2rem'}}>
                        <div className="stat-card"><div className="stat-icon" style={{display: 'inline-flex'}}><Icon name="users" size={22} /></div><div className="num">{stats?.totalApplicants ?? apps.length}</div><div className="label">Total Applications</div></div>
                        <div className="stat-card"><div className="stat-icon" style={{display: 'inline-flex'}}><Icon name="shortlisted" size={22} /></div><div className="num">{stats?.shortlisted ?? shortlisted}</div><div className="label">Shortlisted</div></div>
                        <div className="stat-card"><div className="stat-icon" style={{display: 'inline-flex'}}><Icon name="interviews" size={22} /></div><div className="num">{stats?.interviews ?? interviews}</div><div className="label">Interviews</div></div>
                        <div className="stat-card"><div className="stat-icon" style={{display: 'inline-flex'}}><Icon name="applications" size={22} /></div><div className="num">{selected}</div><div className="label">Selected ({Math.round(selected/total*100)}%)</div></div>
                    </div>
                    <div className="dashboard-grid">
                        <div className="dashboard-left">
                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <h3 style={{marginBottom: '1.5rem', fontSize: '1.15rem'}}>Applications By Internship (live)</h3>
                                {byInternship.length === 0 ? <p className="text-muted">No data yet.</p> : (
                                <div className="chart-placeholder"><div className="chart-bars-horizontal">
                                    {byInternship.map((item, i) => (
                                        <div key={i} className="chart-bar-horizontal-row">
                                            <div className="chart-bar-horizontal-label">{item.name}</div>
                                            <div className="chart-bar-horizontal-bg"><div className="chart-bar-horizontal-fill" style={{width: `${(item.count / Math.max(1, ...byInternship.map(x => x.count))) * 100}%`}}></div></div>
                                            <div className="chart-bar-horizontal-value">{item.count}</div>
                                        </div>
                                    ))}
                                </div></div>)}
                            </div>
                        </div>
                        <div className="dashboard-right">
                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <h3 style={{marginBottom: '1.5rem', fontSize: '1.15rem'}}>Conversion Funnel (live)</h3>
                                <div className="conversion-funnel">
                                    {funnel.map((s) => (
                                        <div key={s.stage} className="funnel-step">
                                            <div className="funnel-bar" style={{width: `${(s.count / Math.max(1, funnel[0].count)) * 100}%`}}><span className="funnel-count">{s.count}</span></div>
                                            <div className="funnel-label">{s.stage}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AnalyticsPage;
