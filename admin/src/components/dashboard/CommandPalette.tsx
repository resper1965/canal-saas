import { useState, useEffect, useRef, useCallback } from "react";

interface SearchResult {
  id: string;
  type: "entry" | "lead" | "comment";
  title: string;
  status?: string;
  collection_id?: string;
  contact?: string;
  entry_id?: string;
  user_name?: string;
  created_at?: string;
}

const TYPE_ICONS: Record<string, string> = {
  entry: "📄",
  lead: "🎯",
  comment: "💬",
};

const TYPE_LABELS: Record<string, string> = {
  entry: "Conteúdo",
  lead: "Lead",
  comment: "Comentário",
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else {
      setQuery("");
      setResults([]);
      setSelected(0);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
      const data = await res.json() as { results: SearchResult[] };
      setResults(data.results || []);
      setSelected(0);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 250);
  };

  const navigate = (result: SearchResult) => {
    setOpen(false);
    if (result.type === "entry") window.location.href = `/content/${result.collection_id || ""}`;
    else if (result.type === "lead") window.location.href = `/intelligence`;
    else if (result.type === "comment" && result.entry_id) window.location.href = `/content/${result.entry_id}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[selected]) navigate(results[selected]);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        paddingTop: "15vh",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "rgba(20, 20, 28, 0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
          maxHeight: "60vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span style={{ fontSize: 18, opacity: 0.5 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar conteúdo, leads, comentários..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 15,
              fontFamily: "inherit",
            }}
          />
          <kbd
            style={{
              background: "rgba(255,255,255,0.06)",
              padding: "2px 8px",
              borderRadius: 6,
              fontSize: 11,
              color: "#666",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading && (
            <div style={{ padding: 20, textAlign: "center", color: "#666", fontSize: 13 }}>Buscando...</div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#555", fontSize: 13 }}>
              Nenhum resultado para "{query}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              {results.map((r, i) => (
                <div
                  key={`${r.type}-${r.id}`}
                  onClick={() => navigate(r)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 20px",
                    cursor: "pointer",
                    background: i === selected ? "rgba(0,229,160,0.08)" : "transparent",
                    borderLeft: i === selected ? "3px solid #00E5A0" : "3px solid transparent",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={() => setSelected(i)}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{TYPE_ICONS[r.type] || "📌"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#fff",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.title || "(sem título)"}
                    </div>
                    <div style={{ fontSize: 11, color: "#555" }}>
                      {TYPE_LABELS[r.type]} {r.status && `· ${r.status}`}
                      {r.contact && ` · ${r.contact}`}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && query.length < 2 && (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#444", fontSize: 12 }}>
              <div style={{ marginBottom: 8 }}>Atalhos rápidos</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { label: "Conteúdo", icon: "📄", path: "/content/insights" },
                  { label: "Leads", icon: "🎯", path: "/intelligence" },
                  { label: "Compliance", icon: "⚖️", path: "/compliance" },
                  { label: "Media", icon: "🖼️", path: "/media" },
                ].map((s) => (
                  <button
                    key={s.path}
                    onClick={() => { setOpen(false); window.location.href = s.path; }}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      padding: "8px 14px",
                      color: "#888",
                      fontSize: 12,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0,229,160,0.1)";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.color = "#888";
                    }}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
