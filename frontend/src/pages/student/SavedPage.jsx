import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { savedAPI } from '../../api/savedAPI';
import { Icon } from '../../components/common/Icon';

const formatWorkMode = (v) => {
    if (!v) return '—';
    const s = String(v).toLowerCase();
    if (s.includes('remote')) return 'Remote';
    if (s.includes('hybrid')) return 'Hybrid';
    if (s.includes('onsite') || s.includes('on-site')) return 'On-site';
    return v;
};
const formatStipend = (v) => {
    if (v == null || String(v).trim() === '') return null;
    if (/[₹$]/.test(String(v))) return String(v);
    const n = Number(String(v).replace(/[^0-9.]/g, ''));
    if (!n) return String(v);
    return `₹${n.toLocaleString('en-IN')}`;
};
const shortDesc = (t, n = 130) => {
    if (!t) return 'No description provided.';
    const s = String(t).replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n).trim() + '…' : s;
};

const SavedPage = () => {
    const [saved, setSaved] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSaved = async () => {
        setLoading(true);
        try {
            const res = await savedAPI.getSaved();
            setSaved(Array.isArray(res.data) ? res.data : []);
        } catch { setSaved([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSaved(); }, []);

    const unsave = async (internshipId) => {
        try {
            await savedAPI.unsaveInternship(internshipId);
            setSaved(prev => prev.filter(s => s.internship?.internshipId !== internshipId));
        } catch { alert('Failed to remove'); }
    };

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header">
                <h1>Saved Internships</h1>
                <p>Your bookmarked opportunities — apply when ready.</p>
            </div>

            {loading ? <div className="loading-spinner">Loading saved...</div> : saved.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon"><Icon name="match" size={14} /></span>
                    <h3>No saved internships</h3>
                    <p>Tap ☆ on any internship to save it here.</p>
                    <Link to="/internships" className="btn btn-primary">Browse Internships</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1" style={{gap: '1rem'}}>
                    {saved.map(s => {
                        const int = s.internship;
                        if (!int) return null;
                        return (
                            <div key={s.savedId} className="internship-card">
                                <div className="card-header">
                                    <div>
                                        <h3>{int.title}</h3>
                                        <div className="company">{int.company?.companyName}</div>
                                    </div>
                                    <div className="company-logo">{int.company?.companyName?.charAt(0)}</div>
                                </div>
                                <div className="meta">
                                    <span><Icon name="location" size={14} /> {int.location || '—'}</span>
                                    <span><Icon name="work" size={14} /> {formatWorkMode(int.workType)}</span>
                                    <span><Icon name="duration" size={14} /> {int.duration || '—'}</span>
                                    <span><Icon name="stipend" size={14} /> {formatStipend(int.stipend) || 'Not disclosed'}</span>
                                </div>
                                <p className="text-muted" style={{fontSize: '0.85rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0.5rem 0'}}>
                                    {shortDesc(int.description, 140)}
                                </p>
                                <div className="skills" style={{marginBottom: '0.5rem'}}>
                                    {int.requiredSkills ? int.requiredSkills.split(',').slice(0, 4).map(sk => <span key={sk} className="skill">{sk.trim()}</span>) : <span className="skill" style={{opacity: 0.6}}>General</span>}
                                </div>
                                <div className="card-footer">
                                    <span className="badge badge-muted">Saved {s.savedAt ? new Date(s.savedAt).toLocaleDateString() : ''}</span>
                                    <div className="d-flex" style={{gap: '0.5rem'}}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => unsave(int.internshipId)}>★ Unsave</button>
                                        <Link to={`/internships/${int.internshipId}`} className="btn btn-primary btn-sm">View & Apply</Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SavedPage;
