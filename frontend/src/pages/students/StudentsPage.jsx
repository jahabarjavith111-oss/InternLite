import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../api/studentAPI';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/common/Icon';

const StudentsPage = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [skill, setSkill] = useState('');
    const [loading, setLoading] = useState(true);
    const isRecruiter = user?.role === 'RECRUITER' || user?.role === 'ADMIN';

    const fetchStudents = async (kw, sk) => {
        setLoading(true);
        try {
            const res = await studentAPI.getDirectory({ keyword: kw || undefined, skill: sk || undefined });
            setStudents(Array.isArray(res.data) ? res.data : []);
        } catch { setStudents([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStudents('', ''); }, []);

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header">
                <h1>{isRecruiter ? 'Talent Pool' : 'Students'}</h1>
                <p>{isRecruiter ? 'Discover talented students for your openings.' : 'Connect with fellow students on InternLite.'}</p>
            </div>

            <form onSubmit={e => { e.preventDefault(); fetchStudents(search, skill); }} className="search-bar" style={{marginBottom: '2rem', background: '#fff', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, college, degree..." className="form-control" style={{flex: 2, minWidth: '180px'}} />
                <input value={skill} onChange={e=>setSkill(e.target.value)} placeholder="Skill (e.g. React)" className="form-control" style={{flex: 1, minWidth: '140px'}} />
                <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {loading ? <div className="loading-spinner">Loading students...</div> : students.length === 0 ? (
                <div className="empty-state"><span className="empty-icon" style={{display:"inline-flex", justifyContent:"center"}}><Icon name="emptySearch" size={28} /></span><h3>No students found</h3><p>Try a different search.</p></div>
            ) : (
                <div className="candidate-grid">
                    {students.map(s => (
                        <div key={s.studentId} className="candidate-card">
                            <div className="candidate-card-header">
                                <div className="candidate-avatar-lg">{(s.name || 'S').charAt(0)}</div>
                                <div>
                                    <div className="candidate-name">{s.name}</div>
                                    <div className="candidate-position">{[s.degree, s.branch].filter(Boolean).join(' • ') || s.college || '—'}</div>
                                </div>
                            </div>
                            <div className="candidate-card-body">
                                <div className="text-muted" style={{fontSize: '0.85rem'}}>{s.college || ''} {s.location ? `• ${s.location}` : ''}</div>
                                <div className="skills-list" style={{marginTop: '0.75rem'}}>
                                    {(s.skills || []).slice(0, 5).map(sk => <span key={sk} className="skill-chip">{sk}</span>)}
                                </div>
                                {isRecruiter && s.email && <div className="text-muted" style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>✉️ {s.email}</div>}
                            </div>
                            <div className="candidate-card-actions">
                                <Link to={`/students/${s.studentId}`} className="btn btn-outline btn-sm">View Profile</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentsPage;
