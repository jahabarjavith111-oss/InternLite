import { useState, useEffect } from 'react';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import { recruiterAPI } from '../../api/recruiterAPI';
import { companyAPI } from '../../api/companyAPI';

const CompanyProfile = () => {
    const [profile, setProfile] = useState({ name: '', industry: '', size: '', location: '', website: '', about: '', mission: '', culture: '', benefits: [] });
    const [editing, setEditing] = useState(false);
    const [companyId, setCompanyId] = useState(null);

    useEffect(() => {
        recruiterAPI.getMyCompany().then(res => {
            if (res.data) {
                const c = res.data;
                setCompanyId(c.companyId);
                setProfile(p => ({ ...p, name: c.companyName || '', industry: c.industry || '', location: c.location || '', website: c.website || '', about: c.description || '' }));
            }
        }).catch(() => {});
    }, []);

    const save = async () => {
        try {
            if (!companyId) {
                const res = await companyAPI.createCompany({ companyName: profile.name, industry: profile.industry, location: profile.location, website: profile.website, description: profile.about });
                setCompanyId(res.data?.companyId || null);
            } else {
                await companyAPI.updateCompany(companyId, { companyName: profile.name, industry: profile.industry, location: profile.location, website: profile.website, description: profile.about });
            }
            alert('Company profile saved');
            setEditing(false);
        } catch { alert('Failed to save'); }
    };

    const update = (field, value) => setProfile({ ...profile, [field]: value });

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <RecruiterHeader
                    title="Company Profile"
                    subtitle="Manage your company information."
                />

                <div className="recruiter-content">
                    <div className="card" style={{marginBottom: '1.5rem'}}>
                        <div className="card-header" style={{marginBottom: '1.5rem'}}>
                            <h3 style={{fontSize: '1.25rem'}}>Company Information</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => setEditing(!editing)}>
                                {editing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>

                        <div className="profile-grid">
                            <div className="form-group">
                                <label>Company Name</label>
                                <input value={profile.name} onChange={e => update('name', e.target.value)} disabled={!editing} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Industry</label>
                                <input value={profile.industry} onChange={e => update('industry', e.target.value)} disabled={!editing} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Company Size</label>
                                <input value={profile.size} onChange={e => update('size', e.target.value)} disabled={!editing} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input value={profile.location} onChange={e => update('location', e.target.value)} disabled={!editing} className="form-control" />
                            </div>
                            <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                <label>Website</label>
                                <input value={profile.website} onChange={e => update('website', e.target.value)} disabled={!editing} className="form-control" />
                            </div>
                            <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                <label>About Company</label>
                                <textarea value={profile.about} onChange={e => update('about', e.target.value)} disabled={!editing} className="form-control" rows="4" />
                            </div>
                            <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                <label>Mission</label>
                                <textarea value={profile.mission} onChange={e => update('mission', e.target.value)} disabled={!editing} className="form-control" rows="3" />
                            </div>
                        </div>

                        {editing && (
                            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem'}}>
                                <button className="btn btn-primary" onClick={save}>Save Changes</button>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h3 style={{marginBottom: '1.5rem', fontSize: '1.25rem'}}>Company Culture & Benefits</h3>
                        <div className="profile-grid">
                            <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                <label>Culture</label>
                                <textarea value={profile.culture} onChange={e => update('culture', e.target.value)} disabled={!editing} className="form-control" rows="4" />
                            </div>
                            <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                <label>Benefits</label>
                                <div className="skills-list" style={{marginTop: '0.5rem'}}>
                                    {profile.benefits.map(b => <span key={b} className="skill-chip">{b}</span>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompanyProfile;
