import { useState, useEffect } from 'react';
import { messageAPI } from '../../api/messageAPI';
import { useAuth } from '../../context/AuthContext';

const StudentMessagesPage = () => {
    const { user } = useAuth();
    const [threads, setThreads] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [chat, setChat] = useState({});
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(true);

    const loadInbox = async () => {
        try {
            const res = await messageAPI.getInbox();
            const data = Array.isArray(res.data) ? res.data : [];
            const grouped = {};
            const list = [];
            data.forEach(m => {
                const other = m.sender?.userId === user?.userId ? m.receiver : m.sender;
                const key = other?.userId ?? m.messageId;
                if (!grouped[key]) {
                    grouped[key] = [];
                    list.push({ id: key, name: other?.name || 'Recruiter', position: m.application?.internship?.title || '', last: m.content, time: m.createdAt ? new Date(m.createdAt).toLocaleString() : '', receiverId: other?.userId, applicationId: m.application?.applicationId || null });
                }
                grouped[key].push({ id: m.messageId, mine: m.sender?.userId === user?.userId, text: m.content, time: m.createdAt ? new Date(m.createdAt).toLocaleString() : '' });
                const t = list.find(x => x.id === key);
                if (t) t.last = m.content;
            });
            setThreads(list);
            setChat(grouped);
            if (list.length && !selectedId) setSelectedId(list[0].id);
        } finally { setLoading(false); }
    };

    useEffect(() => { loadInbox(); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const send = async () => {
        const th = threads.find(t => t.id === selectedId);
        if (!draft.trim() || !th) return;
        const text = draft;
        setDraft('');
        try {
            await messageAPI.sendMessage({ receiverId: th.receiverId || th.id, applicationId: th.applicationId, content: text });
            loadInbox();
        } catch { alert('Failed to send'); }
    };

    const current = chat[selectedId] || [];
    const active = threads.find(t => t.id === selectedId);

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header">
                <h1>Messages</h1>
                <p>Chat with recruiters about your applications.</p>
            </div>
            {loading ? <div className="loading-spinner">Loading messages...</div> : (
            <div className="messaging-layout">
                <div className="conversation-list">
                    {threads.length === 0 ? <p className="text-muted" style={{padding: '1rem'}}>No conversations yet.</p> :
                        threads.map(t => (
                            <div key={t.id} className={`conversation-item${selectedId === t.id ? ' active' : ''}`} onClick={() => setSelectedId(t.id)}>
                                <div className="conversation-avatar">{(t.name || 'R').charAt(0)}</div>
                                <div className="conversation-info">
                                    <div className="conversation-name">{t.name}</div>
                                    <div className="conversation-preview">{t.last}</div>
                                </div>
                            </div>
                        ))}
                </div>
                <div className="chat-area">
                    {!active ? <p className="text-muted" style={{padding: '2rem'}}>Select a conversation.</p> : (
                        <>
                            <div className="chat-header"><strong>{active.name}</strong><span className="text-muted" style={{fontSize: '0.85rem'}}>{active.position}</span></div>
                            <div className="chat-messages">
                                {current.map(m => (
                                    <div key={m.id} className={`chat-message ${m.mine ? 'sent' : 'received'}`}>
                                        <div className="chat-bubble">{m.text}</div>
                                        <div className="chat-time">{m.time}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input-area">
                                <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Type a message..." className="form-control" onKeyPress={e => e.key === 'Enter' && send()} />
                                <button onClick={send} className="btn btn-primary">Send</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            )}
        </div>
    );
};

export default StudentMessagesPage;
