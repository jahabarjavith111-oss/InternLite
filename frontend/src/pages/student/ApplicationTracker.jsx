import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { internshipAPI } from '../../api/internshipAPI';
import { timeAgo } from '../../utils/format';

const TABS = ['All', 'Applied', 'Shortlisted', 'Interview', 'Selected'];
const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Result'];

const toneFor = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'SELECTED') return 'success';
    if (s === 'REJECTED' || s === 'WITHDRAWN') return 'danger';
    if (s === 'SHORTLISTED' || s === 'INTERVIEW') return 'primary';
    return 'gray';
};

const stageIndex = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'APPLIED') return 0;
    if (s === 'SHORTLISTED') return 1;
    if (s === 'INTERVIEW') return 2;
    if (s === 'SELECTED' || s === 'REJECTED') return 3;
    return 0;
};

const ApplicationTracker = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('All');

    useEffect(() => {
        internshipAPI
            .getMyApplications()
            .then((res) => setApplications(Array.isArray(res.data) ? res.data : []))
            .catch(() => setApplications([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        if (tab === 'All') return applications;
        return applications.filter((a) => String(a.status).toUpperCase() === tab.toUpperCase());
    }, [applications, tab]);

    if (loading) return <div className="loading-spinner">Loading applications...</div>;

    return (
        <div>
            <div className="dashboard-header">
                <h1>Applications</h1>
                <p>Track every application from applied to selected.</p>
            </div>

            <div className="tabs" role="tablist" aria-label="Filter by status" style={{ marginBottom: '1.25rem' }}>
                {TABS.map((t) => (
                    <button key={t} role="tab" aria-selected={tab === t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                        {t}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="card empty-state">
                    <h3>{applications.length === 0 ? 'No applications yet' : `No ${tab.toLowerCase()} applications`}</h3>
                    <p className="text-secondary">Start applying to internships and track your progress here.</p>
                    <Link to="/internships" className="btn btn-primary">
                        Browse Internships
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filtered.map((app) => {
                        const idx = stageIndex(app.status);
                        return (
                            <article key={app.applicationId} className="card" style={{ padding: '1.4rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.05rem' }}>{app.internship?.title}</h3>
                                        <div className="text-secondary" style={{ fontSize: '0.9rem' }}>
                                            {app.internship?.company?.companyName}
                                        </div>
                                        <div className="caption" style={{ marginTop: '0.3rem' }}>
                                            Applied: {app.appliedAt ? timeAgo(app.appliedAt) || new Date(app.appliedAt).toLocaleDateString() : '—'}
                                        </div>
                                    </div>
                                    <span className={`badge badge-${toneFor(app.status)}`}>Status: {app.status}</span>
                                </div>
                                <div className="app-timeline" aria-label="Application progress">
                                    {STAGES.map((s, i) => (
                                        <React.Fragment key={s}>
                                            <span className={`dot${i < idx ? ' done' : ''}${i === idx ? ' current' : ''}`} />
                                            <span>{s}</span>
                                            {i < STAGES.length - 1 && <span aria-hidden="true">───</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Link to={`/internships/${app.internship?.internshipId}`} className="btn btn-outline btn-sm">
                                        View Application
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ApplicationTracker;
