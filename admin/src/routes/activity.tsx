import { useState, useEffect } from "react";

interface ActivityItem {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

const ACTION_MAP: Record<string, { icon: string; label: string; color: string }> = {
  "entry.create": { icon: "📝", label: "criou", color: "#00E5A0" },
  "entry.update": { icon: "✏️", label: "editou", color: "#3b82f6" },
  "entry.delete": { icon: "🗑️", label: "removeu", color: "#ef4444" },
  "entry.publish": { icon: "📢", label: "publicou", color: "#8b5cf6" },
  "lead.create": { icon: "🎯", label: "capturou lead", color: "#f59e0b" },
  "member.invite": { icon: "👥", label: "convidou membro", color: "#06b6d4" },
  "member.remove": { icon: "🚪", label: "removeu membro", color: "#ef4444" },
  "settings.update": { icon: "⚙️", label: "atualizou configuração", color: "#64748b" },
  "compliance.create": { icon: "⚖️", label: "registrou caso", color: "#a855f7" },
  "brand.update": { icon: "🎨", label: "atualizou marca", color: "#ec4899" },
};

const RESOURCE_FILTERS = ["all", "entry", "lead", "member", "settings", "compliance", "brand"];

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [offset, setOffset] = useState(0);

  const fetchActivity = async (reset = false) => {
    setLoading(true);
    const nextOffset = reset ? 0 : offset;
    const resourceParam = filter !== "all" ? `&resource=${filter}` : "";
    try {
      const res = await fetch(`/api/admin/activity?limit=30&offset=${nextOffset}${resourceParam}`, {
        credentials: "include",
      });
      const data = await res.json() as { data: ActivityItem[] };
      if (reset) {
        setItems(data.data || []);
        setOffset(30);
      } else {
        setItems((prev) => [...prev, ...(data.data || [])]);
        setOffset(nextOffset + 30);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchActivity(true);
  }, [filter]);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return "agora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const getActionInfo = (action: string) => ACTION_MAP[action] || { icon: "📌", label: action, color: "#666" };

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#fff",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          ⏱️ Atividades
        </h1>
        <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
          Timeline de tudo que acontece na sua organização.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {RESOURCE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: filter === f ? "#00E5A0" : "rgba(255,255,255,0.08)",
              background: filter === f ? "rgba(0,229,160,0.1)" : "rgba(255,255,255,0.02)",
              color: filter === f ? "#00E5A0" : "#888",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.15s",
            }}
          >
            {f === "all" ? "Todas" : f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: 19,
            top: 0,
            bottom: 0,
            width: 2,
            background: "rgba(255,255,255,0.06)",
          }}
        />

        {items.map((item) => {
          const info = getActionInfo(item.action);
          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 4,
                padding: "12px 0",
                position: "relative",
              }}
            >
              {/* Timeline dot */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(20,20,28,1)",
                  border: `2px solid ${info.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {info.icon}
              </div>

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  border: "1px solid rgba(255,255,255,0.04)",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, color: "#ddd", lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: "#fff" }}>{item.user_name}</span>
                    <span style={{ color: "#666" }}> {info.label} </span>
                    {item.resource && (
                      <span
                        style={{
                          background: `${info.color}15`,
                          color: info.color,
                          padding: "1px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {item.resource}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: "#555", whiteSpace: "nowrap", marginLeft: 12 }}>
                    {timeAgo(item.created_at)}
                  </span>
                </div>

                {item.details && Object.keys(item.details).length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 11, color: "#555" }}>
                    {JSON.stringify(item.details).substring(0, 120)}...
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ textAlign: "center", padding: 20, color: "#555" }}>Carregando...</div>
        )}

        {!loading && items.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#444" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 14 }}>Nenhuma atividade registrada ainda</div>
          </div>
        )}

        {!loading && items.length >= 30 && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <button
              onClick={() => fetchActivity(false)}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "8px 24px",
                color: "#888",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Carregar mais
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
