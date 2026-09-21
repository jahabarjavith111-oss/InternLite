export const formatWorkMode = (v) => {
    if (!v) return '—';
    const s = String(v).toLowerCase();
    if (s.includes('remote')) return 'Remote';
    if (s.includes('hybrid')) return 'Hybrid';
    if (s.includes('on-site') || s.includes('onsite') || s.includes('on_site')) return 'On-site';
    return v;
};

export const stipendToNumber = (v) => {
    if (v == null || String(v).trim() === '') return null;
    const n = Number(String(v).replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) && n > 0 ? n : null;
};

export const formatINR = (n) => {
    if (n == null) return null;
    if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
    return `₹${Number(n).toLocaleString('en-IN')}`;
};

export const formatStipend = (v) => {
    if (v == null || String(v).trim() === '') return null;
    if (/[₹$]/.test(String(v))) return String(v).trim();
    const n = stipendToNumber(v);
    if (n == null) return String(v);
    return `${formatINR(n)}`;
};

export const stipendRange = (job = {}) => {
    const min = job.stipendMin ?? job.salaryMin ?? null;
    const max = job.stipendMax ?? job.salaryMax ?? null;
    const single = job.stipend ?? job.salary ?? null;
    if (min != null || max != null) {
        const a = min != null ? formatStipend(min) : null;
        const b = max != null ? formatStipend(max) : null;
        if (a && b) return `${a}–${b}/month`;
        return `${a || b}/month`;
    }
    const s = formatStipend(single);
    return s ? `${s}/month` : 'Stipend not disclosed';
};

export const stipendValue = (job = {}) => {
    const max = job.stipendMax ?? job.salaryMax ?? null;
    const min = job.stipendMin ?? job.salaryMin ?? null;
    const single = job.stipend ?? job.salary ?? null;
    return stipendToNumber(max) ?? stipendToNumber(min) ?? stipendToNumber(single) ?? 0;
};

export const timeAgo = (iso) => {
    if (!iso) return '';
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return '';
    const mins = Math.floor((Date.now() - t) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const postedLabel = (job = {}) => {
    const d = job.postedAt || job.createdAt || job.created_at || null;
    if (!d) return '';
    const ago = timeAgo(d);
    return ago ? `Posted ${ago.toLowerCase()}` : '';
};

export const isNew = (job = {}, days = 7) => {
    const d = job.postedAt || job.createdAt || job.created_at || null;
    if (!d) return false;
    const t = new Date(d).getTime();
    if (Number.isNaN(t)) return false;
    return Date.now() - t < days * 24 * 3600 * 1000;
};

export const isActivelyHiring = (job = {}) => {
    const status = String(job.status || 'OPEN').toUpperCase();
    if (status !== 'OPEN' && status !== 'ACTIVE') return false;
    return isNew(job, 21);
};

export const isVerifiedCompany = (job = {}) => Boolean(job.company?.website);

export const skillList = (job = {}, max = 4) => {
    const raw = job.requiredSkills || job.skills || job.tags || '';
    const arr = Array.isArray(raw) ? raw : String(raw).split(',');
    const cleaned = arr.map((s) => String(s).trim()).filter(Boolean);
    return { visible: cleaned.slice(0, max), extra: Math.max(0, cleaned.length - max) };
};

export const shortDesc = (t, n = 140) => {
    if (!t) return 'No description provided.';
    const s = String(t).replace(/\s+/g, ' ').trim();
    return s.length > n ? `${s.slice(0, n).trim()}…` : s;
};

/** Unified feed items: { id: 'int-1' | 'ext-123', source, sourceId, isExternal } */
export const isExternalItem = (job = {}) => Boolean(job.isExternal ?? job.external ?? (typeof job.id === 'string' && job.id.startsWith('ext-')));

export const numericId = (job = {}) => {
    if (job.internshipId ?? job.jobId) return String(job.internshipId ?? job.jobId);
    if (job.sourceId) return String(job.sourceId);
    const id = String(job.id || '');
    return id.replace(/^(ext-|int-)/, '');
};

/** Detail link: internal -> base/numericId, external -> /external-jobs/sourceId */
export const detailLinkFor = (job = {}, base = '/internships') => {
    if (isExternalItem(job)) return `/external-jobs/${numericId(job)}`;
    return `${base}/${numericId(job)}`;
};

export const sourceLabel = (job = {}) => {
    const s = String(job.source || (isExternalItem(job) ? 'external' : 'internal')).toLowerCase();
    if (s === 'internal') return 'InternLite';
    return s.charAt(0).toUpperCase() + s.slice(1);
};
