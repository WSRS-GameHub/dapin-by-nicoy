"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pencil, X, Check } from "lucide-react";
import Toast from "@/components/ui/Toast";

type Props = {
  userId: string;
  initial: {
    nama: string;
    no_telpon: string;
    admin_whatsapp: string;
  };
};

export default function ProfilPengaturan({ userId, initial }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initial);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleBatal() {
    setForm(initial);
    setEditing(false);
  }

  async function handleSimpan() {
    setSaving(true);
    setToast(null);

    const [res1, res2] = await Promise.all([
      supabase
        .from("profiles")
        .update({ nama: form.nama, no_telpon: form.no_telpon })
        .eq("id", userId),
      supabase
        .from("loan_settings")
        .update({ admin_whatsapp: form.admin_whatsapp })
        .eq("id", 1),
    ]);

    setSaving(false);

    if (res1.error || res2.error) {
      setToast({ type: "error", message: "Gagal menyimpan perubahan. Coba lagi." });
      return;
    }

    setToast({ type: "success", message: "Profil & pengaturan tersimpan." });
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue to-navy text-white flex items-center justify-center font-display font-bold text-xl flex-shrink-0">
          {form.nama?.slice(0, 2).toUpperCase() || "AD"}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={form.nama}
              onChange={(e) => update("nama", e.target.value)}
              className="font-display font-bold text-lg text-navy border-b border-sky-line outline-none w-full bg-transparent"
            />
          ) : (
            <p className="font-display font-bold text-lg text-navy truncate">{form.nama || "-"}</p>
          )}
          <p className="text-xs text-slate mt-0.5">Admin Dapin</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="w-9 h-9 rounded-xl bg-sky text-blue flex items-center justify-center flex-shrink-0"
          >
            <Pencil size={15} />
          </button>
        )}
      </div>

      <SettingGroup title="Kontak">
        <SettingRow
          label="No. WhatsApp Pribadi"
          value={form.no_telpon}
          editing={editing}
          onChange={(v) => update("no_telpon", v)}
          placeholder="08xxxxxxxxxx"
        />
        <SettingRow
          label="No. WhatsApp Admin (untuk member)"
          value={form.admin_whatsapp}
          editing={editing}
          onChange={(v) => update("admin_whatsapp", v)}
          placeholder="628xxxxxxxxxx"
        />
      </SettingGroup>

      {editing && (
        <div className="flex gap-2.5">
          <button
            onClick={handleBatal}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-sky-line text-navy text-sm font-semibold rounded-xl py-3.5"
          >
            <X size={16} /> Batal
          </button>
          <button
            onClick={handleSimpan}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-blue text-white text-sm font-semibold rounded-xl py-3.5 disabled:opacity-60"
          >
            <Check size={16} /> {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      )}
    </div>
  );
}

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate uppercase tracking-wide mb-2 px-1">{title}</p>
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-sky-line overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingRow({
  label, value, editing, onChange, placeholder,
}: {
  label: string; value: string; editing: boolean; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <p className="text-xs text-slate flex-shrink-0">{label}</p>
      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-sm font-mono text-navy text-right outline-none bg-transparent flex-1 min-w-0"
        />
      ) : (
        <p className="text-sm font-mono font-semibold text-navy text-right truncate">
          {value || <span className="text-slate/50">Belum diisi</span>}
        </p>
      )}
    </div>
  );
}