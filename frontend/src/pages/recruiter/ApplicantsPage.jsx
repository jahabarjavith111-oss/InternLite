import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import { recruiterAPI } from '../../api/recruiterAPI';

const ApplicantsPage = () => {
    const [searchParams] = useSearchParams();
    const focusId = searchParams.get('internshipId');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedIds, setSelectedIds] = useState([]);
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const my = await recruiterAPI.getMyInternships();
                const list = Array.isArray(my.data) ? my.data : [];
                const all = [];
                for (const i of list) {
                    if (focusId && String(i.internshipId) !== String(focusId)) continue;
                    try {
                        const r = await recruiterAPI.getInternshipApplications(i.internshipId);
                        (Array.isArray(r.data) ? r.data : []).forEach(a => all.push({
                            applicationId: a.applicationId,
                            candidate: { name: a.student?.user?.name || 'Student', email: a.student?.user?.email || '', location: a.student?.location || '', phone: a.student?.user?.phone || '' },
                            internship: { title: a.internship?.title || i.title },
                            skills: (a.internship?.requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean),
                            education: [a.student?.degree, a.student?.college].filter(Boolean).join(', '),
                            appliedAt: a.appliedAt,
                            status: a.status,
                            coverLetter: a.coverLetter,
                            _raw: a
                        }));
                    } catch { /* skip */ }
                }
                setApps(all);
            } finally { setLoading(false); }
        })();
    }, []);

    const setStatus = async (id, status) => {
        try {
            await recruiterAPI.updateApplicationStatus(id, status);
            setApps(prev => prev.map(a => a.applicationId === id ? { ...a, status } : a));
        } catch { alert('Failed to update'); }
    };

    const bulkStatus = async (status) => {
        for (const id of selectedIds) await setStatus(id, status);
        setSelectedIds([]);
    };

    const filtered = apps.filter(app => {
        const name = (app.candidate?.name || '').toLowerCase();
        const skillHit = (app.skills || []).some(s => s.toLowerCase().includes(search.toLowerCase()));
        const matchesSearch = name.includes(search.toLowerCase()) || skillHit;
        const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filtered.length) setSelectedIds([]);
        else setSelectedIds(filtered.map(a => a.applicationId));
    };

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <RecruiterHeader
                    title={focusId ? `Applicants — #${focusId}` : 'Applicants'}
                    subtitle={focusId ? 'Filtered to one internship. Clear via URL to see all.' : 'Review and manage candidate applications.'}
                />

                <div className="recruiter-content">
                    {loading ? <div className="loading-spinner">Loading applicants...</div> : (
                    <div className="card" style={{marginBottom: '1.5rem'}}>
                        <div className="search-bar" style={{marginBottom: '1rem'}}>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by candidate name or skill..."
                                className="form-control"
                                style={{flex: 1}}
                            />
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-control" style={{width: '180px'}}>
                                <option value="ALL">All Status</option>
                                <option value="APPLIED">Applied</option>
                                <option value="SHORTLISTED">Shortlisted</option>
                                <option value="INTERVIEW">Interview</option>
                                <option value="SELECTED">Selected</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="WITHDRAWN">Withdrawn</option>
                            </select>
                        </div>

                        {selectedIds.length > 0 && (
                            <div className="bulk-actions" style={{marginBottom: '1rem', padding: '0.75rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap'}}>
                                <span className="text-secondary" style={{fontSize: '0.9rem'}}>{selectedIds.length} selected</span>
                                <button className="btn btn-primary btn-sm" onClick={() => bulkStatus('SHORTLISTED')}>Shortlist Selected</button>
                                <button className="btn btn-danger btn-sm" onClick={() => bulkStatus('REJECTED')}>Reject Selected</button>
                                <button className="btn btn-outline btn-sm">Download Resumes</button>
                                <button className="btn btn-outline btn-sm" onClick={() => setSelectedIds([])}>Clear</button>
                            </div>
                        )}

                        <div style={{overflowX: 'auto'}}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{width: '40px'}}>
                                            <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                                        </th>
                                        <th>Candidate</th>
                                        <th>Position</th>
                                        <th>Skills</th>
                                        <th>Education</th>
                                        <th>Applied</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(app => (
                                        <tr key={app.applicationId}>
                                            <td>
                                                <input type="checkbox" checked={selectedIds.includes(app.applicationId)} onChange={() => toggleSelect(app.applicationId)} />
                                            </td>
                                            <td>
                                                <div className="d-flex" style={{gap: '0.75rem'}}>
                                                    <div className="candidate-avatar-sm">{app.candidate.name.charAt(0)}</div>
                                                    <div>
                                                        <div style={{fontWeight: '600'}}>{app.candidate.name}</div>
                                                        <div className="text-muted" style={{fontSize: '0.8rem'}}>{app.candidate.location}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{app.internship?.title}</td>
                                            <td>
                                                <div className="skills-list" style={{gap: '0.25rem'}}>
                                                    {app.skills.slice(0, 3).map(s => <span key={s} className="skill-chip" style={{padding: '0.2rem 0.5rem', fontSize: '0.75rem'}}>{s}</span>)}
                                                </div>
                                            </td>
                                            <td><span className="text-secondary" style={{fontSize: '0.85rem'}}>{app.education}</span></td>
                                            <td><span className="text-muted" style={{fontSize: '0.85rem'}}>{new Date(app.appliedAt).toLocaleDateString()}</span></td>
                                            <td><span className={`badge status-${app.status}`}>{app.status}</span></td>
                                            <td>
                                                <div className="d-flex" style={{gap: '0.4rem'}}>
                                                    <Link to={`/recruiter/candidates/${app.applicationId}`} className="btn btn-outline btn-sm">View</Link>
                                                    <button className="btn btn-primary btn-sm" onClick={() => setStatus(app.applicationId, 'SHORTLISTED')}>Shortlist</button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => setStatus(app.applicationId, 'REJECTED')}>Reject</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filtered.length === 0 && !loading && <p className="text-muted" style={{marginTop: '1rem'}}>No applicants found.</p>}
                    </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ApplicantsPage;
