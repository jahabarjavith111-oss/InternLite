import { useState } from 'react';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        weeklyReport: true,
        newApplicationAlert: true,
        interviewReminder: true
    });

    const toggle = (key) => setSettings({ ...settings, [key]: !settings[key] });

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <RecruiterHeader
                    title="Settings"
                    subtitle="Manage your account preferences."
                />

                <div className="recruiter-content">
                    <div className="card" style={{marginBottom: '1.5rem'}}>
                        <h3 style={{marginBottom: '1.5rem', fontSize: '1.25rem'}}>Notification Preferences</h3>
                        <div className="settings-list">
                            {Object.keys(settings).map(key => (
                                <div key={key} className="setting-item">
                                    <div>
                                        <div className="setting-label" style={{textTransform: 'capitalize'}}>{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                        <div className="text-muted" style={{fontSize: '0.85rem'}}>Receive notifications for {key.toLowerCase()}.</div>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={settings[key]} onChange={() => toggle(key)} />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{marginBottom: '1.5rem', fontSize: '1.25rem'}}>Account Security</h3>
                        <div className="profile-grid">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input type="password" placeholder="Enter current password" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" placeholder="Enter new password" className="form-control" />
                            </div>
                        </div>
                        <button className="btn btn-primary mt-3" onClick={() => alert('Password updated!')}>Update Password</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
