import * as React from "react";
import { organization } from "../../lib/auth-client";
import { TrashIcon } from "./Icons";

export function SettingsTab({ org }: { org: any }) {
  const [name, setName] = React.useState(org?.name || "");
  const [slug, setSlug] = React.useState(org?.slug || "");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState("");

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await organization.update({
        data: { name, slug },
        organizationId: org.id,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirmDelete !== org.slug) return;
    await organization.delete({ organizationId: org.id });
    window.location.reload();
  };

  return (
    <>
      {/* Edit org */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Informações da Organização</span>
        </div>
        <div className="form">
          <div className="form-row-2">
            <div className="field">
              <label>Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              />
            </div>
          </div>
          <div className="action-row">
            {saved && <span style={{ color: "var(--success)", fontSize: 13, marginRight: "auto" }}>Salvo!</span>}
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ borderColor: "rgba(244,63,94,0.2)" }}>
        <div className="card-header">
          <span className="card-title" style={{ color: "var(--danger)" }}>Zona de Risco</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
          Excluir a organização remove todos os dados, membros e conteúdo permanentemente.
        </p>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>Digite <strong style={{ color: "var(--danger)" }}>{org?.slug}</strong> para confirmar</label>
          <input
            type="text"
            placeholder={org?.slug}
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
          />
        </div>
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={confirmDelete !== org?.slug}
        >
          <TrashIcon /> Excluir Organização
        </button>
      </div>
    </>
  );
}
