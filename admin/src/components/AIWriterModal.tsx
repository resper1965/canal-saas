import { useState, useRef } from "react";
import { generateWithAI, type AIWriteParams } from "../lib/api";

type Tone = "tecnico" | "consultivo" | "executivo";

interface Props {
  field: string;
  fieldLabel: string;
  collection: string;
  locale?: string;
  onApply: (text: string) => void;
  onClose: () => void;
}

const TONE_LABELS: Record<Tone, { label: string; desc: string }> = {
  tecnico: { label: "Técnico", desc: "Specs, arquitetura e dados precisos" },
  consultivo: { label: "Consultivo", desc: "ROI, outcomes e impacto de negócio" },
  executivo: { label: "Executivo", desc: "Conciso, direto, C-level" },
};

export default function AIWriterModal({ field, fieldLabel, collection, locale, onApply, onClose }: Props) {
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState<Tone>("consultivo");
  const [result, setResult] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);

  async function handleGenerate() {
    if (!brief.trim()) return;
    setGenerating(true);
    setResult("");
    setError("");

    try {
      const params: AIWriteParams = { brief, field, collection, tone, locale };
      const stream = await generateWithAI(params);
      const reader = stream.getReader();
      readerRef.current = reader;

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += value;
        setResult(accumulated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar conteúdo.");
    } finally {
      setGenerating(false);
      readerRef.current = null;
    }
  }

  function handleStop() {
    readerRef.current?.cancel();
    setGenerating(false);
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "linear-gradient(135deg, var(--primary) 0%, #0099ff 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
          }}>✦</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 16 }}>Agente Redator</h2>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-dim)" }}>
              Campo: <strong>{fieldLabel}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "var(--text-dim)", cursor: "pointer", fontSize: 20, lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* Brief */}
        <div className="field">
          <label htmlFor="ai-brief">
            Brief — contexto do conteúdo
            <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 400, marginLeft: 8 }}>
              quanto mais específico, melhor
            </span>
          </label>
          <textarea
            id="ai-brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder={`Ex: "Case de SOC 24x7 implantado em banco nacional. Resultado: -89% MTTR, cobertura de 15M eventos/dia. Cliente anônimo."`}
            rows={3}
            disabled={generating}
            style={{ fontSize: 13, lineHeight: 1.6 }}
          />
        </div>

        {/* Tone selector */}
        <div className="field">
          <label>Tom de escrita</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
            {(Object.keys(TONE_LABELS) as Tone[]).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                disabled={generating}
                style={{
                  padding: "0.6rem 0.75rem",
                  border: `1.5px solid ${tone === t ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: 8,
                  background: tone === t ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent",
                  color: tone === t ? "var(--primary)" : "var(--text-dim)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>{TONE_LABELS[t].label}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{TONE_LABELS[t].desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <div style={{ marginTop: "0.5rem" }}>
          {generating ? (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleStop}
              style={{ width: "100%" }}
            >
              ⏹ Parar geração
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={!brief.trim()}
              style={{ width: "100%", gap: "0.5rem" }}
            >
              <span>✦</span>
              {result ? "Gerar novamente" : "Gerar conteúdo"}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: "0.75rem", padding: "0.75rem 1rem",
            background: "color-mix(in srgb, #ef4444 10%, transparent)",
            border: "1px solid color-mix(in srgb, #ef4444 30%, transparent)",
            borderRadius: 8, fontSize: 13, color: "#fca5a5",
          }}>
            {error}
          </div>
        )}

        {/* Result preview */}
        {result && (
          <>
            <div className="field" style={{ marginTop: "1rem" }}>
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Resultado gerado</span>
                {generating && (
                  <span style={{ fontSize: 11, color: "var(--primary)", display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="loader-inline" style={{ width: 10, height: 10 }} /> gerando…
                  </span>
                )}
              </label>
              <div style={{
                padding: "0.875rem 1rem",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                minHeight: 60,
                color: "var(--text)",
              }}>
                {result}
              </div>
            </div>

            {/* Actions */}
            {!generating && (
              <div className="action-row" style={{ marginTop: "1rem" }}>
                <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                <button
                  className="btn btn-primary"
                  onClick={() => { onApply(result); onClose(); }}
                >
                  ✓ Usar este texto
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state - no result yet */}
        {!result && !generating && (
          <div style={{
            marginTop: "1rem", textAlign: "center",
            padding: "1.5rem",
            border: "1px dashed var(--border)",
            borderRadius: 8,
            color: "var(--text-muted)",
            fontSize: 12,
          }}>
            Preencha o brief acima e clique em Gerar
          </div>
        )}
      </div>
    </div>
  );
}
