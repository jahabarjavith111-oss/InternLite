import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/adminAPI';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAllUsers();
            setUsers(Array.isArray(res.data) ? res.data : []);
        } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const changeRole = async (id, role) => {
        try { await adminAPI.updateUserRole(id, role); setUsers(prev => prev.map(u => u.userId === id ? { ...u, role } : u)); }
        catch { alert('Failed to update role'); }
    };
    const removeUser = async (id) => {
        if (!confirm('Delete user?')) return;
        try { await adminAPI.deleteUser(id); setUsers(prev => prev.filter(u => u.userId !== id)); }
        catch { alert('Failed to delete'); }
    };

    const filtered = users.filter(u => !q || u.name?.toLowerCase().includes(q.toLowerCase()) || u.email?.toLowerCase().includes(q.toLowerCase()));

    return (
        <div className="dashboard animate-fade-in" style={{padding: '1.5rem'}}>
            <div className="dashboard-header"><h1>Users</h1><p className="text-secondary">All platform users — change roles or remove.</p></div>
            <div style={{marginBottom: '1rem', display: 'flex', gap: '0.5rem'}}>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or email..." className="form-control" style={{maxWidth: '360px'}} />
            </div>
            {loading ? <div className="loading-spinner">Loading users...</div> : (
                <div style={{overflowX: 'auto'}}><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>{filtered.map(u => <tr key={u.userId}><td><strong>{u.name}</strong></td><td>{u.email}</td><td><span className="badge badge-primary">{u.role}</span></td><td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</td><td><div style={{display: 'flex', gap: '0.4rem', flexWrap: 'wrap'}}><button className="btn btn-outline btn-sm" onClick={() => changeRole(u.userId, u.role === 'STUDENT' ? 'RECRUITER' : 'STUDENT')}>Toggle Student/Recruiter</button><button className="btn btn-outline btn-sm" onClick={() => changeRole(u.userId, 'ADMIN')}>Make Admin</button><button className="btn btn-danger btn-sm" onClick={() => removeUser(u.userId)}>Delete</button></div></td></tr>)}</tbody></table></div>
            )}
        </div>
    );
};

export default AdminUsers;
