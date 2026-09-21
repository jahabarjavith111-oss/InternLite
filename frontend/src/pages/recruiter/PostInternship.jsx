import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import { recruiterAPI } from '../../api/recruiterAPI';
import { categoryAPI } from '../../api/categoryAPI';

const PostInternship = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        title: '', department: '', jobType: 'Internship', openings: 1,
        location: '', workMode: 'Remote',
        stipend: '', duration: '', benefits: '',
        requiredSkills: '', education: '', experience: '', preferredQualifications: '',
        description: '', responsibilities: '', learningOpportunities: '',
        deadline: '', additionalQuestions: '', categoryId: ''
    });

    useEffect(() => {
        categoryAPI.getCategories().then(res => setCategories(res.data)).catch(() => {});
    }, []);

    const update = (field, value) => setForm({ ...form, [field]: value });
    const steps = ['Basic Info', 'Location', 'Compensation', 'Requirements', 'Description', 'Application'];

    const mapWorkType = (m) => {
        if (!m) return 'REMOTE';
        const v = m.toLowerCase();
        if (v.includes('remote')) return 'REMOTE';
        if (v.includes('hybrid')) return 'HYBRID';
        return 'ONSITE';
    };

    const handlePublish = async () => {
        if (!form.title || !form.description) { alert('Title and description are required'); return; }
        setSaving(true);
        try {
            const stipendNum = parseFloat(String(form.stipend).replace(/[^0-9.]/g, '')) || 0;
            const payload = {
                title: form.title,
                description: [form.description, form.responsibilities ? `\nResponsibilities: ${form.responsibilities}` : '', form.learningOpportunities ? `\nLearning: ${form.learningOpportunities}` : '', form.benefits ? `\nBenefits: ${form.benefits}` : '', form.education ? `\nEducation: ${form.education}` : '', form.experience ? `\nExperience: ${form.experience}` : '', form.openings > 1 ? `\nOpenings: ${form.openings}` : ''].join(''),
                location: form.location || 'Remote',
                workType: mapWorkType(form.workMode),
                duration: form.duration || '3 months',
                stipend: stipendNum,
                requiredSkills: form.requiredSkills,
                applicationDeadline: form.deadline || null,
                status: 'OPEN',
                category: form.categoryId ? { categoryId: Number(form.categoryId) } : null
            };
            await recruiterAPI.postInternship(payload);
            alert('Internship published!');
            navigate('/recruiter/internships');
        } catch (e) {
            alert(e.response?.data?.message || e.response?.data || 'Failed to publish');
        } finally { setSaving(false); }
    };

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <RecruiterHeader title="Post Internship" subtitle="Create a new internship listing." />
                <div className="recruiter-content">
                    <div className="card" style={{marginBottom: '1.5rem'}}>
                        <div className="stepper">
                            {steps.map((s, idx) => (
                                <div key={s} className={`step ${step === idx + 1 ? 'active' : ''} ${idx + 1 < step ? 'completed' : ''}`}>
                                    <div className="step-number">{idx + 1 < step ? '✓' : idx + 1}</div>
                                    <div className="step-label">{s}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card">
                        {step === 1 && (
                            <div className="form-step">
                                <h3 style={{marginBottom: '1.5rem'}}>Basic Information</h3>
                                <div className="profile-grid">
                                    <div className="form-group">
                                        <label>Internship Title *</label>
                                        <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Software Engineer Intern" className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input value={form.department} onChange={e => update('department', e.target.value)} placeholder="e.g. Engineering" className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select value={form.categoryId} onChange={e => update('categoryId', e.target.value)} className="form-control">
                                            <option value="">Select category</option>
                                            {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Number of Openings</label>
                                        <input type="number" value={form.openings} onChange={e => update('openings', e.target.value)} className="form-control" min="1" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {step === 2 && (
                            <div className="form-step">
                                <h3 style={{marginBottom: '1.5rem'}}>Location</h3>
                                <div className="profile-grid">
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Chennai, India" className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label>Work Mode</label>
                                        <select value={form.workMode} onChange={e => update('workMode', e.target.value)} className="form-control">
                                            <option>Remote</option>
                                            <option>Hybrid</option>
                                            <option>On-site</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                            <div className="form-step">
                                <h3 style={{marginBottom: '1.5rem'}}>Compensation</h3>
                                <div className="profile-grid">
                                    <div className="form-group">
                                        <label>Stipend (number)</label>
                                        <input value={form.stipend} onChange={e => update('stipend', e.target.value)} placeholder="e.g. 20000" className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label>Duration</label>
                                        <input value={form.duration} onChange={e => update('duration', e.target.value)} placeholder="e.g. 3 months" className="form-control" />
                                    </div>
                                    <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                        <label>Benefits</label>
                                        <textarea value={form.benefits} onChange={e => update('benefits', e.target.value)} placeholder="Benefits..." className="form-control" rows="3" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {step === 4 && (
                            <div className="form-step">
                                <h3 style={{marginBottom: '1.5rem'}}>Requirements</h3>
                                <div className="profile-grid">
                                    <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                        <label>Required Skills (comma separated)</label>
                                        <input value={form.requiredSkills} onChange={e => update('requiredSkills', e.target.value)} placeholder="Java, Spring Boot, MySQL" className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label>Education</label>
                                        <input value={form.education} onChange={e => update('education', e.target.value)} placeholder="e.g. B.E/B.Tech" className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label>Experience</label>
                                        <input value={form.experience} onChange={e => update('experience', e.target.value)} placeholder="e.g. Fresher" className="form-control" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {step === 5 && (
                            <div className="form-step">
                                <h3 style={{marginBottom: '1.5rem'}}>Description</h3>
                                <div className="profile-grid">
                                    <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                        <label>About Internship *</label>
                                        <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe the internship..." className="form-control" rows="4" />
                                    </div>
                                    <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                        <label>Responsibilities</label>
                                        <textarea value={form.responsibilities} onChange={e => update('responsibilities', e.target.value)} placeholder="What will the intern do?" className="form-control" rows="4" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {step === 6 && (
                            <div className="form-step">
                                <h3 style={{marginBottom: '1.5rem'}}>Application Settings</h3>
                                <div className="profile-grid">
                                    <div className="form-group">
                                        <label>Application Deadline</label>
                                        <input type="date" value={form.deadline} onChange={e => update('deadline', e.target.value)} className="form-control" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="form-actions" style={{display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)'}}>
                            <button className="btn btn-ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>Previous</button>
                            <div className="d-flex" style={{gap: '0.75rem'}}>
                                {step < 6 ? (
                                    <button className="btn btn-primary" onClick={() => setStep(s => Math.min(6, s + 1))}>Next</button>
                                ) : (
                                    <button className="btn btn-success" onClick={handlePublish} disabled={saving}>{saving ? 'Publishing...' : 'Publish Internship'}</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default PostInternship; 
