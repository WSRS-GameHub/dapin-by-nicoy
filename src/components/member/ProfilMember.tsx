"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Pencil, X, Check, ArrowLeft, User, Phone, Landmark,
  Wallet, Clock3, ShieldCheck, LogOut,
} from "lucide-react";
import Toast from "@/components/ui/Toast";

type Props = {
  userId: string;
  limit: number;
  tempoHari: number;
  verifikasiStatus: string;
  initial: {
    nama: string;
    no_telpon: string;
    nik: string;
    pekerjaan: string;
    alamat: string;
    kontak_darurat_nama: string;
    kontak_darurat_notelp: string;
    kontak_darurat_hubungan: string;
    nama_bank: string;
    no_rekening: string;
    nama_pemilik_rekening: string;
  };
};

const statusLabel: Record<string, string> = {
  belum_verifikasi: "Belum Verifikasi",
  menunggu: "Menunggu Persetujuan",
  ditinjau: "Sedang Ditinjau",
  selesai: "Terverifikasi",
};

export default function ProfilMember({
  userId, limit, tempoHari, verifikasiStatus, initial,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [form, setForm] = useState(initial);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

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

    const { error } = await supabase.from("profiles").update(form).eq("id", userId);

    setSaving(false);

    if (error) {
      setToast({ type: "error", message: "Gagal menyimpan perubahan." });
      return;
    }

    setToast({ type: "success", message: "Profil tersimpan." });
    setEditing(false);
    router.refresh();
  }

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F3F6FE] px-5 pt-6 pb-10">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-5">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
          <ArrowLeft size={18} className="text-navy" />
        </button>
        <h1 className="font-display font-bold text-base text-navy">Profil Saya</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue"
          >
            <Pencil size={16} />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>

      {/* Header profil */}
      <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col items-center text-center mb-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue to-navy text-white flex items-center justify-center font-display font-bold text-2xl shadow-lg shadow-blue/20 mb-3">
          {form.nama?.slice(0, 2).toUpperCase() || "AN"}
        </div>
        {editing ? (
          <input
            value={form.nama}
            onChange={(e) => update("nama", e.target.value)}
            className="font-display font-bold text-lg text-navy border-b border-sky-line outline-none text-center bg-transparent"
          />
        ) : (
          <p className="font-display font-bold text-lg text-navy">{form.nama || "-"}</p>
        )}
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full mt-2 ${
            verifikasiStatus === "selesai" ? "bg-teal/15 text-teal" : "bg-amber/15 text-amber"
          }`}
        >
          <ShieldCheck size={12} />
          {statusLabel[verifikasiStatus] ?? "-"}
        </span>
      </div>

      {/* Ringkasan limit */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-navy rounded-2xl p-4 text-white flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Wallet size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[#A9B8DE] font-semibold">Limit</p>
            <p className="text-xs font-bold font-mono truncate">{formatRupiah(limit)}</p>
          </div>
        </div>
        <div className="bg-navy rounded-2xl p-4 text-white flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Clock3 size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[#A9B8DE] font-semibold">Tempo</p>
            <p className="text-xs font-bold font-mono">{tempoHari} hari</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <Group title="Data Diri" icon={User}>
          <Row label="No. WhatsApp" value={form.no_telpon} editing={editing} onChange={(v) => update("no_telpon", v)} />
          <Row label="NIK" value={form.nik} editing={editing} onChange={(v) => update("nik", v)} />
          <Row label="Pekerjaan" value={form.pekerjaan} editing={editing} onChange={(v) => update("pekerjaan", v)} />
          <Row label="Alamat" value={form.alamat} editing={editing} onChange={(v) => update("alamat", v)} />
        </Group>

        <Group title="Kontak Darurat" icon={Phone}>
          <Row label="Nama" value={form.kontak_darurat_nama} editing={editing} onChange={(v) => update("kontak_darurat_nama", v)} />
          <Row label="No. HP" value={form.kontak_darurat_notelp} editing={editing} onChange={(v) => update("kontak_darurat_notelp", v)} />
          <Row label="Hubungan" value={form.kontak_darurat_hubungan} editing={editing} onChange={(v) => update("kontak_darurat_hubungan", v)} />
        </Group>

        <Group title="Rekening" icon={Landmark}>
          <Row label="Bank" value={form.nama_bank} editing={editing} onChange={(v) => update("nama_bank", v)} />
          <Row label="No. Rekening" value={form.no_rekening} editing={editing} onChange={(v) => update("no_rekening", v)} />
          <Row label="Atas Nama" value={form.nama_pemilik_rekening} editing={editing} onChange={(v) => update("nama_pemilik_rekening", v)} />
        </Group>
      </div>

      {editing ? (
        <div className="flex gap-2.5 mt-6">
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
      ) : (
        <>
          <div className="border-t border-sky-line mt-8 mb-5" />
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center justify-center gap-2 text-red-500 bg-red-50 text-sm font-semibold rounded-xl py-3.5 disabled:opacity-60"
          >
            <LogOut size={16} />
            {loggingOut ? "Keluar..." : "Keluar dari Akun"}
          </button>
        </>
      )}
    </div>
  );
}

function Group({
  title, icon: Icon, children,
}: { title: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <Icon size={13} className="text-slate" />
        <p className="text-xs font-bold text-slate uppercase tracking-wide">{title}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-sky-line overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({
  label, value, editing, onChange,
}: { label: string; value: string; editing: boolean; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <p className="text-xs text-slate flex-shrink-0">{label}</p>
      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm text-navy text-right outline-none bg-transparent flex-1 min-w-0"
        />
      ) : (
        <p className="text-sm font-medium text-navy text-right truncate">
          {value || <span className="text-slate/50">Belum diisi</span>}
        </p>
      )}
    </div>
  );
}