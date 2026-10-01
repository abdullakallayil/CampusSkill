import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { getInitials, timeAgo } from '../utils';

const MOCK_CONVERSATIONS = [
  { other_user_id: 10, other_name: 'Rahul Sharma', other_role: 'client', last_message: 'Great! Let\'s discuss the project details.', last_at: '2024-11-22T10:00:00Z', unread_count: 2 },
  { other_user_id: 11, other_name: 'Arjun Mehta', other_role: 'student', last_message: 'I have submitted the initial designs.', last_at: '2024-11-21T16:00:00Z', unread_count: 0 },
];
const MOCK_MESSAGES = [
  { message_id: 1, sender_id: 10, content: 'Hi! I saw your profile and I think you\'d be perfect for my project.', created_at: '2024-11-22T09:00:00Z', sender_name: 'Rahul Sharma' },
  { message_id: 2, sender_id: 1, content: 'Thank you! I\'d love to hear more about it.', created_at: '2024-11-22T09:05:00Z', sender_name: 'Me' },
  { message_id: 3, sender_id: 10, content: 'I need a portfolio website built in React. Budget around ₹3,500.', created_at: '2024-11-22T09:08:00Z', sender_name: 'Rahul Sharma' },
  { message_id: 4, sender_id: 1, content: 'That sounds great! I have extensive React experience. Can you share more requirements?', created_at: '2024-11-22T09:12:00Z', sender_name: 'Me' },
  { message_id: 5, sender_id: 10, content: 'Great! Let\'s discuss the project details.', created_at: '2024-11-22T10:00:00Z', sender_name: 'Rahul Sharma' },
];

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/messages/conversations').then(r => r.data.length && setConversations(r.data)).catch(() => {});
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (conv) => {
    setActiveConv(conv);
    try {
      const { data } = await api.get(`/messages/${conv.other_user_id}`);
      setMessages(data.length ? data : MOCK_MESSAGES);
    } catch { setMessages(MOCK_MESSAGES); }
    setConversations(prev => prev.map(c => c.other_user_id === conv.other_user_id ? { ...c, unread_count: 0 } : c));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    const tempMsg = { message_id: Date.now(), sender_id: user.id, content: newMsg, created_at: new Date().toISOString(), sender_name: user.name };
    setMessages(prev => [...prev, tempMsg]);
    const msgContent = newMsg;
    setNewMsg('');
    try {
      await api.post('/messages', { receiver_id: activeConv.other_user_id, content: msgContent });
    } catch (e) {}
    setSending(false);
  };

  return (
    <div className="page" style={{ paddingTop: 72 }}>
      <div className="messages-layout">
        {/* Conversations */}
        <div className="conversations-panel">
          <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)', fontWeight: 800, fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem' }}>
            💬 Messages
          </div>
          {conversations.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-state-icon" style={{ fontSize: '2rem' }}>💬</div>
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div key={conv.other_user_id} className={`conversation-item${activeConv?.other_user_id === conv.other_user_id ? ' active' : ''}`} onClick={() => openConversation(conv)}>
                <div className="avatar-placeholder" style={{ width: 44, height: 44, fontSize: '0.95rem', flexShrink: 0 }}>{getInitials(conv.other_name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <h4>{conv.other_name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo(conv.last_at)}</span>
                  </div>
                  <div className="conversation-info">
                    <p>{conv.last_message}</p>
                  </div>
                </div>
                {conv.unread_count > 0 && (
                  <div style={{ width: 20, height: 20, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {conv.unread_count}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Chat Panel */}
        <div className="chat-panel">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)' }}>
                <div className="avatar-placeholder" style={{ width: 40, height: 40, fontSize: '0.9rem' }}>{getInitials(activeConv.other_name)}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{activeConv.other_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>● Online</div>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {messages.map(msg => {
                  const isOwn = msg.sender_id === user?.id || msg.sender_id === 1;
                  return (
                    <div key={msg.message_id} className={`chat-msg${isOwn ? ' own' : ''}`}>
                      {!isOwn && (
                        <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: '0.7rem', flexShrink: 0 }}>{getInitials(msg.sender_name)}</div>
                      )}
                      <div>
                        <div className="chat-bubble">{msg.content}</div>
                        <div className={`chat-time${isOwn ? '' : ''}`} style={{ textAlign: isOwn ? 'right' : 'left' }}>{timeAgo(msg.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-input-bar" onSubmit={sendMessage}>
                <input className="form-input chat-input" placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} />
                <button type="submit" className="btn btn-primary" disabled={sending || !newMsg.trim()}>
                  {sending ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '➤ Send'}
                </button>
              </form>
            </>
          ) : (
            <div className="loading-page" style={{ flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '4rem' }}>💬</div>
              <h3>Select a conversation</h3>
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: 300 }}>Choose a conversation from the left to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
