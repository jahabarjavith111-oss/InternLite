import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock3, Banknote, Home } from 'lucide-react';
import {
    formatWorkMode,
    stipendRange,
    skillList,
    isNew,
    isActivelyHiring,
    isVerifiedCompany,
    postedLabel,
    isExternalItem,
    detailLinkFor,
    sourceLabel,
} from '../../utils/format';

const InternshipCard = ({ job, saved = false, onToggleSave, detailPath = '/internships', to }) => {
    const external = isExternalItem(job);
    const link = to || detailLinkFor(job, detailPath);
    const companyName = job.company?.companyName || job.companyName || 'Company';
    const { visible, extra } = skillList(job);
    const showVerified = isVerifiedCompany(job);
    const showHiring = isActivelyHiring(job) && !external;
    const showNew = isNew(job) && !showHiring;

    return (
        <article className="internship-card card">
            <div className="internship-card-top">
                <div className="company-logo" aria-hidden="true">
                    {String(companyName).charAt(0).toUpperCase()}
                </div>
                <div className="internship-card-head">
                    <div className="internship-company">{companyName}</div>
                    <h3 className="internship-title">
                        <Link to={link}>{job.title}</Link>
                    </h3>
                </div>
                {!external && (
                    <button
                        type="button"
                        onClick={() => onToggleSave?.(job)}
                        className={`save-btn${saved ? ' saved' : ''}`}
                        aria-label={saved ? 'Unsave internship' : 'Save internship'}
                        aria-pressed={saved}
                        title={saved ? 'Saved' : 'Save'}
                    >
                        {saved ? '★' : '♡'}
                    </button>
                )}
            </div>

            <div className="meta internship-meta">
                <span>
                    <MapPin size={14} aria-hidden="true" /> {job.location || 'India'}
                </span>
                <span>
                    <Home size={14} aria-hidden="true" /> {formatWorkMode(job.workType || job.workplaceType)}
                </span>
                <span>
                    <Banknote size={14} aria-hidden="true" /> {stipendRange(job)}
                </span>
                {job.duration && (
                    <span>
                        <Clock3 size={14} aria-hidden="true" /> {job.duration}
                    </span>
                )}
            </div>

            {(visible.length > 0 || extra > 0) && (
                <div className="skills">
                    {visible.map((s) => (
                        <span key={s} className="skill">
                            {s}
                        </span>
                    ))}
                    {extra > 0 && <span className="skill skill-highlight">+{extra} more</span>}
                </div>
            )}

            <div className="internship-card-badges">
                {external ? (
                    <span className="badge badge-gray">{sourceLabel(job)}</span>
                ) : (
                    <>
                        {showVerified && <span className="badge badge-success">✓ Verified</span>}
                        {showHiring && <span className="badge badge-primary">✓ Actively hiring</span>}
                        {showNew && <span className="badge badge-info">🆕 New</span>}
                    </>
                )}
                {job.workType && String(job.workType).toLowerCase().includes('remote') && (
                    <span className="badge badge-gray">Remote</span>
                )}
                {job.isRemote && !job.workType && <span className="badge badge-gray">Remote</span>}
                <span className="posted-label">{postedLabel(job)}</span>
            </div>

            <div className="internship-card-footer">
                <Link to={link} className="btn btn-primary btn-sm">
                    {external ? 'View & Apply' : 'View Internship'}
                </Link>
                {!external && (
                    <button type="button" onClick={() => onToggleSave?.(job)} className="btn btn-ghost btn-sm">
                        {saved ? 'Saved' : 'Save'}
                    </button>
                )}
            </div>
        </article>
    );
};

export default InternshipCard;
