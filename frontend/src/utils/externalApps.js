const KEY = 'internlite_external_apps';

export const getExternalApps = () => {
    try {
        const raw = localStorage.getItem(KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
};

export const isExternalApplied = (sourceId) =>
    getExternalApps().some((a) => String(a.sourceId) === String(sourceId));

export const trackExternalApply = (job) => {
    const list = getExternalApps();
    const sourceId = job.sourceId || job.id;
    if (list.some((a) => String(a.sourceId) === String(sourceId))) return list;
    const entry = {
        sourceId: String(sourceId),
        title: job.title,
        companyName: job.companyName,
        location: job.location,
        source: job.source,
        applyUrl: job.applyUrl,
        appliedAt: new Date().toISOString(),
    };
    const next = [entry, ...list];
    try {
        localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        /* ignore */
    }
    return next;
};

export const removeExternalApp = (sourceId) => {
    const next = getExternalApps().filter((a) => String(a.sourceId) !== String(sourceId));
    try {
        localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        /* ignore */
    }
    return next;
};
