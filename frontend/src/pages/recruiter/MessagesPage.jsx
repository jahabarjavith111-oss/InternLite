import { useState, useEffect } from 'react';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import { messageAPI } from '../../api/messageAPI';

const MessagesPage = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [chatMessages, setChatMessages] = useState({});
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        setLoading(true);
        messageAPI.getInbox().then(res => {
            const data = Array.isArray(res.data) ? res.data : [];
            const grouped = {};
            const convos = [];
            data.forEach(m => {
                const senderId = m.sender?.userId ?? m.senderId ?? m.messageId;
                const name = m.sender?.name || 'Candidate';
                if (!grouped[senderId]) {
                    grouped[senderId] = [];
                    convos.push({ id: senderId, candidateName: name, position: m.application?.internship?.title || '', lastMessage: m.content, time: m.createdAt ? new Date(m.createdAt).toLocaleString() : '', receiverId: m.sender?.userId, applicationId: m.application?.applicationId || null, raw: m });
                }
                grouped[senderId].push({ id: m.messageId, sender: 'candidate', text: m.content, time: m.createdAt ? new Date(m.createdAt).toLocaleString() : '' });
                const c = convos.find(x => x.id === senderId);
                if (c) { c.lastMessage = m.content; }
            });
            setConversations(convos);
            setChatMessages(grouped);
            if (convos.length && !selectedId) setSelectedId(convos[0].id);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const selectedConversation = conversations.find(m => m.id === selectedId);
    const currentChat = chatMessages[selectedId] || [];

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;
        const text = newMessage;
        const newMsg = { id: Date.now(), sender: 'recruiter', text, time: 'Just now' };
        setChatMessages(prev => ({
            ...prev,
            [selectedId]: [...(prev[selectedId] || []), newMsg]
        }));
        setNewMessage('');
        try {
            await messageAPI.sendMessage({ receiverId: selectedConversation.receiverId || selectedConversation.id, applicationId: selectedConversation.applicationId || null, content: text });
        } catch { alert('Failed to send via backend'); }
    };

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <RecruiterHeader
                    title="Messages"
                    subtitle="Communicate with candidates."
                />

                <div className="recruiter-content">
                    {loading ? <div className="loading-spinner">Loading messages...</div> : (
                    <div className="messaging-layout">
                        <div className="conversation-list">
                            {conversations.length === 0 ? <p className="text-muted" style={{padding: '1rem'}}>No messages yet.</p> : conversations.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`conversation-item ${selectedId === msg.id ? 'active' : ''}`}
                                    onClick={() => setSelectedId(msg.id)}
                                >
                                    <div className="conversation-avatar">{msg.candidateName.charAt(0)}</div>
                                    <div className="conversation-info">
                                        <div className="conversation-name">{msg.candidateName}</div>
                                        <div className="conversation-preview">{msg.lastMessage}</div>
                                        <div className="conversation-meta">
                                            <span className="text-muted">{msg.time}</span>
                                            {msg.unread && <span className="badge badge-primary" style={{marginLeft: '0.5rem'}}>New</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="chat-area">
                            {selectedConversation && (
                                <>
                                    <div className="chat-header">
                                        <div className="d-flex" style={{gap: '0.75rem'}}>
                                            <div className="conversation-avatar">{selectedConversation.candidateName.charAt(0)}</div>
                                            <div>
                                                <div className="conversation-name">{selectedConversation.candidateName}</div>
                                                <div className="text-muted" style={{fontSize: '0.85rem'}}>{selectedConversation.position}</div>
                                            </div>
                                        </div>
                                        <span className={`badge ${selectedConversation.online ? 'badge-success' : 'badge-muted'}`}>
                                            {selectedConversation.online ? 'Online' : 'Offline'}
                                        </span>
                                    </div>

                                    <div className="chat-messages">
                                        {currentChat.map(msg => (
                                            <div key={msg.id} className={`chat-message ${msg.sender === 'recruiter' ? 'sent' : 'received'}`}>
                                                <div className="chat-bubble">{msg.text}</div>
                                                <div className="chat-time">{msg.time}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="chat-input-area">
                                        <input
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="form-control"
                                            onKeyPress={e => e.key === 'Enter' && sendMessage()}
                                        />
                                        <button onClick={sendMessage} className="btn btn-primary">Send</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MessagesPage;
