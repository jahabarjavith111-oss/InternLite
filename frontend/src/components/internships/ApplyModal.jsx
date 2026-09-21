import React, { useState } from 'react';

const ApplyModal = ({ job, resumes = [], profileComplete = false, onClose, onSubmit, submitting = false }) => {
    const [resumeId, setResumeId] = useState(() => resumes.find((r) => r.default)?.resumeId || '');
    const [note, setNote] = useState('');
    const defaultResume = resumes.find((r) => String(r.resumeId) === String(resumeId));

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={`Apply to ${job?.title}`} onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <div className="modal-title">Apply to {job?.title}</div>
                        <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                            {job?.company?.companyName || job?.companyName || ''}
                        </div>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>
                <div className="modal-body">
                    <div className="apply-checklist">
                        <div className={profileComplete ? 'check done' : 'check'}>{profileComplete ? '✓' : '○'} Profile completed</div>
                        <div className={resumes.length ? 'check done' : 'check'}>{resumes.length ? '✓' : '○'} Resume attached</div>
                    </div>
                    {resumes.length > 0 ? (
                        <div className="form-group">
                            <label className="label" htmlFor="apply-resume">
                                Resume
                            </label>
                            <select
                                id="apply-resume"
                                className="input"
                                value={resumeId}
                                onChange={(e) => setResumeId(e.target.value)}
                            >
                                <option value="">Select a resume</option>
                                {resumes.map((r) => (
                                    <option key={r.resumeId} value={r.resumeId}>
                                        {r.resumeName || `Resume ${r.resumeId}`}
                                    </option>
                                ))}
                            </select>
                            {defaultResume && <div className="caption" style={{ marginTop: 6 }}>{defaultResume.resumeName}</div>}
                        </div>
                    ) : (
                        <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Upload a resume from your profile to attach it automatically.
                        </p>
                    )}
                    <div className="form-group">
                        <label className="label" htmlFor="apply-note">
                            Optional note
                        </label>
                        <textarea
                            id="apply-note"
                            className="input textarea"
                            rows={4}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Tell the recruiter why you're interested..."
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        disabled={submitting}
                        onClick={() => onSubmit?.({ resumeId: resumeId || null, note })}
                    >
                        {submitting ? 'Sending…' : 'Send Application'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplyModal;
