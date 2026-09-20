import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import { recruiterAPI } from '../../api/recruiterAPI';
import { categoryAPI } from '../../api/categoryAPI';
import api from '../../api/api';

const EditInternship = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        title: '', description: '', location: '',
        workType: 'REMOTE', duration: '', stipend: '',
        requiredSkills: '', applicationDeadline: '', status: 'OPEN', categoryId: '',
    });

    useEffect(() => {
        let mounted = true;
        categoryAPI.getCategories().then(r => { if (mounted) setCategories(Array.isArray(r.data) ? r.data : []); }).catch(() => {});
        api.get(`/internships/${id}`).then(r => {
            if (!mounted) return;
            const i = r.data;
            setForm({
                title: i.title || '',
                description: i.description || '',
                location: i.location || '',
                workType: i.workType || 'REMOTE',
                duration: i.duration || '',
                stipend: i.stipend ?? '',
                requiredSkills: i.requiredSkills || '',
                applicationDeadline: i.applicationDeadline || '',
                status: i.status || 'OPEN',
                categoryId: i.category?.categoryId ? String(i.category.categoryId) : '',
            });
            setLoading(false);
        }).catch(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [id]);

    const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const save = async () => {
        if (!form.title || !form.description) { alert('Title and description are required'); return; }
        setSaving(true);
        try {
            const stipendNum = form.stipend === '' ? null : parseFloat(String(form.stipend).replace(/[^0-9.]/g, '')) || 0;
            await recruiterAPI.updateInternship(id, {
                title: form.title,
                description: form.description,
                location: form.location || 'Remote',
                workType: form.workType,
                duration: form.duration || '3 months',
                stipend: stipendNum,
                requiredSkills: form.requiredSkills,
                applicationDeadline: form.applicationDeadline || null,
                status: form.status,
                category: form.categoryId ? { categoryId: Number(form.categoryId) } : null,
            });
            alert('Internship updated');
            navigate('/recruiter/dashboard');
        } catch (e) {
            alert(e.response?.data || 'Failed to update');
        } finally { setSaving(false); }
    };

    if (loading) return <div className="recruiter-layout"><RecruiterSidebar /><main className="recruiter-main"><div className="loading-spinner">Loading internship...</div></main></div>;

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <RecruiterHeader title="Edit Internship" subtitle={`Internship #${id}`} />
                <div className="recruiter-content">
                    <div className="card">
                        <div className="profile-grid">
                            <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => update('title', e.target.value)} className="form-control" /></div>
                            <div className="form-group"><label>Category</label>
                                <select value={form.categoryId} onChange={e => update('categoryId', e.target.value)} className="form-control">
                                    <option value="">Select category</option>
                                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label>Location</label><input value={form.location} onChange={e => update('location', e.target.value)} className="form-control" /></div>
                            <div className="form-group"><label>Work Type</label>
                                <select value={form.workType} onChange={e => update('workType', e.target.value)} className="form-control">
                                    <option value="REMOTE">Remote</option>
                                    <option value="HYBRID">Hybrid</option>
                                    <option value="ONSITE">On-site</option>
                                </select>
                            </div>
                            <div className="form-group"><label>Stipend</label><input value={form.stipend} onChange={e => update('stipend', e.target.value)} className="form-control" /></div>
                            <div className="form-group"><label>Duration</label><input value={form.duration} onChange={e => update('duration', e.target.value)} className="form-control" /></div>
                            <div className="form-group" style={{gridColumn: '1 / -1'}}><label>Required Skills (comma separated)</label><input value={form.requiredSkills} onChange={e => update('requiredSkills', e.target.value)} className="form-control" /></div>
                            <div className="form-group"><label>Deadline</label><input type="date" value={form.applicationDeadline} onChange={e => update('applicationDeadline', e.target.value)} className="form-control" /></div>
                            <div className="form-group"><label>Status</label>
                                <select value={form.status} onChange={e => update('status', e.target.value)} className="form-control">
                                    <option value="OPEN">OPEN</option>
                                    <option value="CLOSED">CLOSED</option>
                                    <option value="DRAFT">DRAFT</option>
                                </select>
                            </div>
                            <div className="form-group" style={{gridColumn: '1 / -1'}}><label>Description *</label><textarea value={form.description} onChange={e => update('description', e.target.value)} className="form-control" rows={5} /></div>
                        </div>
                        <div className="d-flex" style={{gap: '0.75rem', marginTop: '1.5rem'}}>
                            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                            <button className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditInternship;
