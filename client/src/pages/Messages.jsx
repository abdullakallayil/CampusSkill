import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { getInitials, timeAgo } from "../utils";

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const messagesEndRef = useRef(null);

  const openConversation = async (conv) => {
    setActiveConv(conv);
    setMessages([]);
    try {
      const { data } = await api.get(`/messages/${conv.other_user_id}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    }
    setConversations((prev) =>
      prev.map((c) =>
        String(c.other_user_id) === String(conv.other_user_id)
          ? { ...c, unread_count: 0 }
          : c
      )
    );
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setLoadingConvs(true);
    api
      .get("/messages/conversations")
      .then((r) => {
        const convs = Array.isArray(r.data) ? r.data : [];
        setConversations(convs);
        const withId = searchParams.get("with");
        const withName = searchParams.get("name");
        if (withId) {
          const existing = convs.find(
            (c) => String(c.other_user_id) === String(withId)
          );
          if (existing) {
            openConversation(existing);
          } else {
            const newConv = {
              other_user_id: withId,
              other_name: withName || "User",
              other_role: "unknown",
              last_message: "",
              last_at: new Date().toISOString(),
              unread_count: 0,
            };
            setConversations((prev) => [newConv, ...prev]);
            setActiveConv(newConv);
            setMessages([]);
          }
        }
      })
      .catch(() => setConversations([]))
      .finally(() => setLoadingConvs(false));
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    const msgContent = newMsg;
    setNewMsg("");
    const tempId = `temp_${Date.now()}`;
    const tempMsg = {
      message_id: tempId,
      sender_id: user.id,
      content: msgContent,
      created_at: new Date().toISOString(),
      sender_name: user.name,
    };
    setMessages((prev) => [...prev, tempMsg]);
    try {
      await api.post("/messages", {
        receiver_id: activeConv.other_user_id,
        content: msgContent,
      });
      setConversations((prev) =>
        prev.map((c) =>
          String(c.other_user_id) === String(activeConv.other_user_id)
            ? { ...c, last_message: msgContent, last_at: new Date().toISOString() }
            : c
        )
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m.message_id !== tempId));
      setNewMsg(msgContent);
    }
    setSending(false);
  };

  return (
    <div className="page" style={{ paddingTop: 72 }}>
      <div className="messages-layout">
        {/* Conversations Panel */}
        <div className="conversations-panel">
          <div
            style={{
              padding: "20px 20px 12px",
              borderBottom: "1px solid var(--border)",
              fontWeight: 800,
              fontFamily: "Outfit, sans-serif",
              fontSize: "1.1rem",
            }}
          >
            Messages
          </div>
          {loadingConvs ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <div className="spinner" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-state-icon" style={{ fontSize: "2rem" }}>
                No conversations yet
              </div>
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                }}
              >
                Message a client or student to get started.
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={String(conv.other_user_id)}
                className={`conversation-item${
                  activeConv &&
                  String(activeConv.other_user_id) ===
                    String(conv.other_user_id)
                    ? " active"
                    : ""
                }`}
                onClick={() => openConversation(conv)}
              >
                <div
                  className="avatar-placeholder"
                  style={{ width: 44, height: 44, fontSize: "0.95rem", flexShrink: 0 }}
                >
                  {getInitials(conv.other_name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: "0.95rem" }}>
                      {conv.other_name}
                    </h4>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        flexShrink: 0,
                      }}
                    >
                      {timeAgo(conv.last_at)}
                    </span>
                  </div>
                  <div className="conversation-info">
                    <p
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        margin: 0,
                      }}
                    >
                      {conv.last_message || "Start the conversation"}
                    </p>
                  </div>
                </div>
                {conv.unread_count > 0 && (
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      background: "var(--primary)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
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
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "var(--bg-card)",
                }}
              >
                <div
                  className="avatar-placeholder"
                  style={{ width: 40, height: 40, fontSize: "0.9rem" }}
                >
                  {getInitials(activeConv.other_name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{activeConv.other_name}</div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      textTransform: "capitalize",
                    }}
                  >
                    {activeConv.other_role || "Member"}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {messages.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "var(--text-muted)",
                      fontSize: "0.9rem",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>Hello</div>
                    <p>No messages yet. Say hello!</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isOwn = String(msg.sender_id) === String(user?.id);
                  return (
                    <div
                      key={String(msg.message_id || msg._id)}
                      className={`chat-msg${isOwn ? " own" : ""}`}
                    >
                      {!isOwn && (
                        <div
                          className="avatar-placeholder"
                          style={{
                            width: 32,
                            height: 32,
                            fontSize: "0.7rem",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(msg.sender_name || activeConv.other_name)}
                        </div>
                      )}
                      <div>
                        <div className="chat-bubble">{msg.content}</div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                            marginTop: 4,
                            textAlign: isOwn ? "right" : "left",
                          }}
                        >
                          {timeAgo(msg.created_at || msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-input-bar" onSubmit={sendMessage}>
                <input
                  className="form-input chat-input"
                  placeholder={`Message ${activeConv.other_name}...`}
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending || !newMsg.trim()}
                >
                  {sending ? (
                    <span className="spinner" style={{ width: 16, height: 16 }} />
                  ) : (
                    "Send"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div
              className="loading-page"
              style={{ flexDirection: "column", gap: 16 }}
            >
              <div style={{ fontSize: "4rem" }}>Chat</div>
              <h3>Select a conversation</h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  textAlign: "center",
                  maxWidth: 300,
                }}
              >
                Choose a conversation from the left to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
