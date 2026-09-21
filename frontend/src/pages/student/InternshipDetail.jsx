import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Home, Clock3, Banknote, CalendarDays } from 'lucide-react';
import { internshipAPI } from '../../api/internshipAPI';
import { savedAPI } from '../../api/savedAPI';
import { resumeAPI } from '../../api/resumeAPI';
import { studentAPI } from '../../api/studentAPI';
import { useAuth } from '../../context/AuthContext';
import ApplyModal from '../../components/internships/ApplyModal';
import InternshipCard from '../../components/internships/InternshipCard';
import { formatWorkMode, stipendRange, skillList, isVerifiedCompany, isActivelyHiring } from '../../utils/format';

const InternshipDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [internship, setInternship] = useState(null);
    const [applied, setApplied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [resumes, setResumes] = useState([]);
    const [related, setRelated] = useState([]);
    const [showApply, setShowApply] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [profileComplete, setProfileComplete] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const [iRes, rRes, sRes, aRes, pRes] = await Promise.allSettled([
                    internshipAPI.getInternshipById(id),
                    resumeAPI.getMyResumes(),
                    savedAPI.getSaved(),
                    internshipAPI.getMyApplications(),
                    studentAPI.getProfile ? studentAPI.getProfile() : Promise.reject(new Error('no profile api')),
                ]);
                if (!mounted) return;
                if (iRes.status === 'fulfilled') {
                    setInternship(iRes.value.data);
                    const cat = iRes.value.data?.category?.categoryName;
                    if (cat) {
                        internshipAPI
                            .getInternships({ category: cat })
                            .then((rr) => {
                                if (!mounted) return;
                                const list = (Array.isArray(rr.data) ? rr.data : [])
                                    .filter((x) => String(x.internshipId) !== String(id))
                                    .slice(0, 3);
                                setRelated(list);
                            })
                            .catch(() => {});
                    }
                }
                if (rRes.status === 'fulfilled') setResumes(Array.isArray(rRes.value.data) ? rRes.value.data : []);
                if (sRes.status === 'fulfilled') {
                    const list = Array.isArray(sRes.value.data) ? sRes.value.data : [];
                    if (list.some((s) => String(s.internship?.internshipId) === String(id))) setSaved(true);
                }
                if (aRes.status === 'fulfilled') {
                    const list = Array.isArray(aRes.value.data) ? aRes.value.data : [];
                    if (list.some((a) => String(a.internship?.internshipId) === String(id))) setApplied(true);
                }
                if (pRes.status === 'fulfilled' && pRes.value.data) {
                    const p = pRes.value.data;
                    setProfileComplete(Boolean(p.phone || p.college || p.bio || p.location));
                }
            } catch {
                /* ignore */
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id]);

    const toggleSave = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            if (saved) {
                await savedAPI.unsaveInternship(internship.internshipId);
                setSaved(false);
            } else {
                await savedAPI.saveInternship(internship.internshipId);
                setSaved(true);
            }
        } catch {
            /* ignore */
        }
    };

    const handleSubmit = async ({ resumeId, note }) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setSubmitting(true);
        try {
            await internshipAPI.applyInternship(internship.internshipId, note, resumeId || null);
            setApplied(true);
            setShowApply(false);
            navigate('/student/applications');
        } catch (e) {
            alert(e.response?.data || 'Failed to apply');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !internship) {
        return (
            <div className="container" style={{ padding: '2rem 0' }}>
                <div className="loading-spinner">Loading internship details...</div>
            </div>
        );
    }

    const { visible } = skillList(internship, 12);
    const companyName = internship.company?.companyName || 'Company';

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}>
                ← Back to internships
            </button>

            <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div className="company-logo" style={{ width: 56, height: 56, fontSize: '1.4rem' }} aria-hidden="true">
                        {String(companyName).charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="internship-company">{companyName}</div>
                        <h1 style={{ fontSize: '1.6rem', lineHeight: 1.25, margin: '0.15rem 0 0.5rem' }}>{internship.title}</h1>
                        <div className="text-secondary" style={{ fontSize: '0.92rem' }}>
                            {internship.location || 'India'} • {formatWorkMode(internship.workType)}
                            {internship.duration ? ` • ${internship.duration}` : ''}
                        </div>
                        <div style={{ fontWeight: 700, marginTop: '0.4rem' }}>{stipendRange(internship)}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                    {!applied && (
                        <button onClick={() => (user ? setShowApply(true) : navigate('/login'))} className="btn btn-primary">
                            Apply Now
                        </button>
                    )}
                    <button onClick={toggleSave} className="btn btn-outline">
                        {saved ? '★ Saved' : '♡ Save'}
                    </button>
                </div>
            </div>

            <div className="detail-layout">
                <div className="card" style={{ padding: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>About the Internship</h2>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>About the role</h3>
                    <p className="text-secondary" style={{ lineHeight: 1.75, marginBottom: '1.25rem' }}>
                        {internship.description || 'No description provided.'}
                    </p>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>Responsibilities</h3>
                    <ul style={{ paddingLeft: '1.25rem', color: '#4B5563', lineHeight: 1.75, marginBottom: '1.25rem' }}>
                        <li>Build and ship real features with the {companyName} team</li>
                        <li>Develop and integrate APIs and data workflows</li>
                        <li>Collaborate with mentors and participate in code reviews</li>
                    </ul>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>Requirements</h3>
                    <ul style={{ paddingLeft: '1.25rem', color: '#4B5563', lineHeight: 1.75, marginBottom: '1.25rem' }}>
                        {(visible.length ? visible.slice(0, 5) : ['Good communication skills']).map((s) => (
                            <li key={s}>{s}</li>
                        ))}
                    </ul>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Skills</h3>
                    <div className="skills">
                        {visible.map((s) => (
                            <span key={s} className="skill">
                                {s}
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', paddingTop: '1.25rem', marginTop: '1.25rem', borderTop: '1px solid #F3F4F6' }}>
                        <div>
                            <div className="caption">Category</div>
                            <div style={{ fontWeight: 600 }}>{internship.category?.categoryName || '—'}</div>
                        </div>
                        <div>
                            <div className="caption">Apply before</div>
                            <div style={{ fontWeight: 600 }}>{internship.applicationDeadline || '—'}</div>
                        </div>
                        <div>
                            <div className="caption">Start date</div>
                            <div style={{ fontWeight: 600 }}>{internship.startDate || 'Flexible'}</div>
                        </div>
                    </div>
                </div>

                <aside className="card apply-sidebar" style={{ padding: '1.5rem' }} aria-label="Application">
                    <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Application</h2>
                    {!applied ? (
                        <>
                            <button onClick={() => (user ? setShowApply(true) : navigate('/login'))} className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
                                Apply Now
                            </button>
                            <div className="apply-checklist">
                                <div className={profileComplete ? 'check done' : 'check'}>{profileComplete ? '✓' : '○'} Profile complete</div>
                                <div className={resumes.length ? 'check done' : 'check'}>{resumes.length ? '✓' : '○'} Resume uploaded</div>
                                <div className="check">○ Skills added</div>
                            </div>
                            <div className="meta" style={{ fontSize: '0.85rem' }}>
                                <span>
                                    <MapPin size={14} /> {internship.location || '—'}
                                </span>
                                <span>
                                    <Home size={14} /> {formatWorkMode(internship.workType)}
                                </span>
                                <span>
                                    <Banknote size={14} /> {stipendRange(internship)}
                                </span>
                                <span>
                                    <Clock3 size={14} /> {internship.duration || '—'}
                                </span>
                                <span>
                                    <CalendarDays size={14} /> Apply before {internship.applicationDeadline || '—'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                                {isVerifiedCompany(internship) && <span className="badge badge-success">✓ Verified</span>}
                                {isActivelyHiring(internship) && <span className="badge badge-primary">⚡ Responds quickly</span>}
                            </div>
                        </>
                    ) : (
                        <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: 8, border: '1px solid #A7F3D0' }}>
                            <p style={{ fontWeight: 600, color: '#067647' }}>✓ Application submitted</p>
                            <p className="text-secondary" style={{ fontSize: '0.88rem', marginTop: '0.4rem' }}>
                                Track progress from your applications page.
                            </p>
                            <Link to="/student/applications" className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                                Track application
                            </Link>
                        </div>
                    )}
                </aside>
            </div>

            {related.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Related Internships</h2>
                    <div className="grid-3">
                        {related.map((r) => (
                            <InternshipCard key={r.internshipId} job={r} onToggleSave={() => navigate(`/internships/${r.internshipId}`)} />
                        ))}
                    </div>
                </div>
            )}

            {showApply && (
                <ApplyModal job={internship} resumes={resumes} profileComplete={profileComplete} submitting={submitting} onClose={() => setShowApply(false)} onSubmit={handleSubmit} />
            )}
        </div>
    );
};

export default InternshipDetail;
