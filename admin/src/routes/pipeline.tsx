import { useState, useEffect, useCallback, useRef } from "react";

/* ── Types ────────────────────────────────────────────────────── */

interface Lead {
  id: number;
  name: string;
  contact: string;
  source: string;
  intent?: string;
  urgency: string;
  stage: string;
  score: number;
  owner_name?: string;
  company?: string;
  notes?: string;
  tags: string[];
  created_at: string;
}

interface Stage {
  id: string;
  label: string;
  color: string;
  count: number;
}

interface PipelineData {
  board: Record<string, Lead[]>;
  stages: Stage[];
  stats: { total: number; avgScore: number };
}

/* ── Score Badge ──────────────────────────────────────────────── */

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? "#00E5A0" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontWeight: 700,
        color,
        background: `${color}15`,
        padding: "2px 8px",
        borderRadius: 6,
      }}
    >
      {score}
    </span>
  );
}

/* ── Lead Card ────────────────────────────────────────────────── */

function LeadCard({
  lead,
  onScore,
  onEdit,
  dragHandlers,
}: {
  lead: Lead;
  onScore: (id: number) => void;
  onEdit: (lead: Lead) => void;
  dragHandlers: {
    onDragStart: (e: React.DragEvent, leadId: number) => void;
  };
}) {
  const urgencyColors: Record<string, string> = {
    alta: "#ef4444",
    crítica: "#ef4444",
    media: "#f59e0b",
    baixa: "#64748b",
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <div
      draggable
      onDragStart={(e) => dragHandlers.onDragStart(e, lead.id)}
      onClick={() => onEdit(lead)}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: "12px 14px",
        cursor: "grab",
        transition: "all 0.15s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Header: name + score */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {lead.name}
          </div>
          {lead.company && (
            <div style={{ fontSize: 11, color: "#666", marginTop: 1 }}>
              🏢 {lead.company}
            </div>
          )}
        </div>
        <ScoreBadge score={lead.score || 0} />
      </div>

      {/* Contact */}
      <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
        {lead.contact}
      </div>

      {/* Intent (truncated) */}
      {lead.intent && (
        <div
          style={{
            fontSize: 11,
            color: "#555",
            marginTop: 4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          💬 {lead.intent}
        </div>
      )}

      {/* Footer: urgency + source + time */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: urgencyColors[lead.urgency] || "#666",
            background: `${urgencyColors[lead.urgency] || "#666"}15`,
            padding: "1px 6px",
            borderRadius: 4,
          }}
        >
          {lead.urgency}
        </span>
        <span
          style={{
            fontSize: 10,
            color: "#555",
            background: "rgba(255,255,255,0.04)",
            padding: "1px 6px",
            borderRadius: 4,
          }}
        >
          {lead.source}
        </span>
        {lead.owner_name && (
          <span style={{ fontSize: 10, color: "#06b6d4" }}>
            👤 {lead.owner_name}
          </span>
        )}
        <span style={{ fontSize: 10, color: "#444", marginLeft: "auto" }}>
          {timeAgo(lead.created_at)}
        </span>
      </div>

      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
          {lead.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 9,
                color: "#888",
                background: "rgba(255,255,255,0.04)",
                padding: "1px 5px",
                borderRadius: 3,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Score button */}
      {(lead.score === 0 || !lead.score) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onScore(lead.id);
          }}
          style={{
            marginTop: 8,
            width: "100%",
            background: "rgba(0,229,160,0.06)",
            border: "1px solid rgba(0,229,160,0.15)",
            borderRadius: 6,
            padding: "4px 0",
            color: "#00E5A0",
            fontSize: 10,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,229,160,0.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,229,160,0.06)")}
        >
          🤖 Calcular Score
        </button>
      )}
    </div>
  );
}

/* ── Lead Detail Modal ────────────────────────────────────────── */

function LeadDetailModal({
  lead,
  onClose,
  onSave,
}: {
  lead: Lead;
  onClose: () => void;
  onSave: (id: number, data: Partial<Lead>) => void;
}) {
  const [company, setCompany] = useState(lead.company || "");
  const [notes, setNotes] = useState(lead.notes || "");
  const [ownerName, setOwnerName] = useState(lead.owner_name || "");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(20, 20, 28, 0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>
              {lead.name}
            </h3>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
              {lead.contact} · Score: <ScoreBadge score={lead.score || 0} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>

        {lead.intent && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              fontSize: 12,
              color: "#aaa",
              lineHeight: 1.5,
            }}
          >
            💬 <strong>Intenção:</strong> {lead.intent}
          </div>
        )}

        {[
          { label: "Empresa", value: company, setter: setCompany, placeholder: "Nome da empresa..." },
          { label: "Responsável", value: ownerName, setter: setOwnerName, placeholder: "Quem cuida desse lead?" },
        ].map(({ label, value, setter, placeholder }) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#888", fontWeight: 600, display: "block", marginBottom: 4 }}>
              {label}
            </label>
            <input
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={placeholder}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#fff",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#888", fontWeight: 600, display: "block", marginBottom: 4 }}>
            Notas
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anotações sobre o lead..."
            rows={3}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "8px 12px",
              color: "#fff",
              fontSize: 13,
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "#888",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave(lead.id, { company, notes, owner_name: ownerName });
              onClose();
            }}
            style={{
              padding: "8px 20px",
              background: "#00E5A0",
              border: "none",
              borderRadius: 8,
              color: "#000",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Pipeline Page ────────────────────────────────────────────── */

export default function PipelinePage() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [scoring, setScoring] = useState<number | null>(null);
  const dragRef = useRef<{ leadId: number; sourceStage: string } | null>(null);

  const fetchPipeline = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pipeline", { credentials: "include" });
      const d = (await res.json()) as PipelineData;
      setData(d);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const moveLead = async (leadId: number, newStage: string) => {
    await fetch(`/api/admin/pipeline/${leadId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ stage: newStage }),
    });
    fetchPipeline();
  };

  const scoreLead = async (leadId: number) => {
    setScoring(leadId);
    await fetch(`/api/admin/pipeline/${leadId}/score`, {
      method: "POST",
      credentials: "include",
    });
    await fetchPipeline();
    setScoring(null);
  };

  const scoreAll = async () => {
    await fetch("/api/admin/pipeline/score-all", {
      method: "POST",
      credentials: "include",
    });
    fetchPipeline();
  };

  const saveLead = async (id: number, updates: Partial<Lead>) => {
    await fetch(`/api/admin/pipeline/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });
    fetchPipeline();
  };

  /* Drag & Drop */
  const onDragStart = (e: React.DragEvent, leadId: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(leadId));
    dragRef.current = { leadId, sourceStage: "" };
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    (e.currentTarget as HTMLElement).style.background = "rgba(0,229,160,0.06)";
  };

  const onDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.background = "transparent";
  };

  const onDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.background = "transparent";
    const leadId = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (leadId) moveLead(leadId, targetStage);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80, color: "#555" }}>
        Carregando pipeline...
      </div>
    );
  }

  if (!data) return null;

  // Filter out won/lost for main board, show them separately
  const activeStages = data.stages.filter((s) => s.id !== "won" && s.id !== "lost");
  const closedStages = data.stages.filter((s) => s.id === "won" || s.id === "lost");

  return (
    <div style={{ padding: "24px 32px", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexShrink: 0,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>
            🎯 Pipeline de Leads
          </h1>
          <p style={{ color: "#666", fontSize: 13, marginTop: 2 }}>
            {data.stats.total} leads · Score médio: {data.stats.avgScore}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={scoreAll}
            style={{
              padding: "8px 16px",
              background: "rgba(0,229,160,0.08)",
              border: "1px solid rgba(0,229,160,0.2)",
              borderRadius: 8,
              color: "#00E5A0",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,229,160,0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,229,160,0.08)")}
          >
            🤖 Pontuar Todos
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexShrink: 0,
          overflowX: "auto",
        }}
      >
        {data.stages.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: 8,
              flexShrink: 0,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
            <span style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${activeStages.length}, minmax(260px, 1fr))`,
          gap: 12,
          flex: 1,
          overflowX: "auto",
          overflowY: "hidden",
          minHeight: 0,
        }}
      >
        {activeStages.map((stage) => (
          <div
            key={stage.id}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, stage.id)}
            style={{
              background: "rgba(255,255,255,0.01)",
              border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "background 0.15s",
            }}
          >
            {/* Column header */}
            <div
              style={{
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `2px solid ${stage.color}30`,
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: stage.color,
                    boxShadow: `0 0 8px ${stage.color}50`,
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#ddd" }}>{stage.label}</span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#888",
                  background: "rgba(255,255,255,0.04)",
                  padding: "2px 8px",
                  borderRadius: 10,
                }}
              >
                {stage.count}
              </span>
            </div>

            {/* Cards */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 8,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {(data.board[stage.id] || []).map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onScore={scoreLead}
                  onEdit={setEditingLead}
                  dragHandlers={{ onDragStart }}
                />
              ))}

              {(data.board[stage.id] || []).length === 0 && (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "#333",
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px dashed rgba(255,255,255,0.06)",
                  }}
                >
                  Arraste leads aqui
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Closed stages (won/lost) */}
      {closedStages.some((s) => s.count > 0) && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 12,
            flexShrink: 0,
          }}
        >
          {closedStages.map((stage) => (
            <div
              key={stage.id}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, stage.id)}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.01)",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 12,
                padding: "12px 14px",
                transition: "background 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#aaa" }}>{stage.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#666" }}>{stage.count}</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(data.board[stage.id] || []).slice(0, 5).map((lead) => (
                  <span
                    key={lead.id}
                    onClick={() => setEditingLead(lead)}
                    style={{
                      display: "inline-flex",
                      fontSize: 11,
                      color: "#888",
                      background: "rgba(255,255,255,0.03)",
                      padding: "4px 8px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    {lead.name}
                  </span>
                ))}
                {(data.board[stage.id] || []).length > 5 && (
                  <span style={{ fontSize: 11, color: "#555", padding: "4px 0" }}>
                    +{(data.board[stage.id] || []).length - 5} mais
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingLead && (
        <LeadDetailModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSave={saveLead}
        />
      )}
    </div>
  );
}
