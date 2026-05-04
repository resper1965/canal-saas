import { useState, useEffect, useCallback, useRef } from "react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  action_url?: string;
  read_at?: string;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications?limit=15", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json() as { data: Notification[]; unread_count: number };
      setNotifications(data.data || []);
      setUnreadCount(data.unread_count || 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/admin/notifications/all/read", { method: "POST", credentials: "include" });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
  };

  const markRead = async (id: string) => {
    await fetch(`/api/admin/notifications/${id}/read`, { method: "POST", credentials: "include" });
    setUnreadCount((c) => Math.max(0, c - 1));
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return "agora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const typeIcon: Record<string, string> = {
    review_requested: "📝",
    entry_published: "📢",
    lead_captured: "🎯",
    comment_added: "💬",
    approval: "✅",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: "8px",
          borderRadius: 8,
          transition: "background 0.2s",
          fontSize: 18,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        title="Notificações"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              background: "#ef4444",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: "50%",
              minWidth: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              boxShadow: "0 0 0 2px var(--bg-primary, #111)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: 8,
            width: 360,
            maxHeight: 480,
            overflowY: "auto",
            background: "rgba(20, 20, 28, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Notificações</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: "none",
                  border: "none",
                  color: "#00E5A0",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#666", fontSize: 13 }}>
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read_at) markRead(n.id);
                  if (n.action_url) window.location.href = n.action_url;
                }}
                style={{
                  padding: "12px 20px",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: n.read_at ? "transparent" : "rgba(0,229,160,0.04)",
                  transition: "background 0.15s",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = n.read_at ? "transparent" : "rgba(0,229,160,0.04)")
                }
              >
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>
                  {typeIcon[n.type] || "📌"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: n.read_at ? 400 : 600,
                      color: n.read_at ? "#aaa" : "#fff",
                      lineHeight: 1.4,
                    }}
                  >
                    {n.title}
                  </div>
                  {n.body && (
                    <div style={{ fontSize: 11, color: "#666", marginTop: 2, lineHeight: 1.3 }}>{n.body}</div>
                  )}
                  <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>{timeAgo(n.created_at)}</div>
                </div>
                {!n.read_at && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#00E5A0",
                      flexShrink: 0,
                      marginTop: 6,
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
