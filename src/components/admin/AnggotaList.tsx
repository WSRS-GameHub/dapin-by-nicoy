"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Toast from "@/components/ui/Toast";

type Member = {
  id: string;
  nama: string;
  limit_khusus: number | null;
  tempo_khusus_hari: number | null;
};

type Tier = { id: string; nominal_pinjam: number; nominal_kembali: number };

export default function AnggotaList({
  members,
  tiers,
}: {
  members: Member[];
  tiers: Tier[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

  async function handleSave(memberId: string, limit: number, tempo: number) {
    setSavingId(memberId);
    setToast(null);

    const { error, data } = await supabase
      .from("profiles")
      .update({ limit_khusus: limit, tempo_khusus_hari: tempo })
      .eq("id", memberId)
      .select();

    setSavingId(null);

    if (error) {
      setToast({ type: "error", message: "Gagal menyimpan: " + error.message });
      return;
    }

    if (!data || data.length === 0) {
      setToast({ type: "error", message: "Tidak ada baris yang berubah. Cek hak akses (RLS)." });
      return;
    }

    setToast({ type: "success", message: `Tersimpan: limit ${formatRupiah(limit)}` });
    router.refresh();
  }

  if (members.length === 0) {
    return <p className="text-sm text-slate text-center py-14">Belum ada anggota terverifikasi.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {members.map((m) => (
        <MemberCard
          key={m.id}
          member={m}
          tiers={tiers}
          saving={savingId === m.id}
          onSave={handleSave}
        />
      ))}
    </div>
  );
}

function MemberCard({
  member,
  tiers,
  saving,
  onSave,
}: {
  member: Member;
  tiers: Tier[];
  saving: boolean;
  onSave: (memberId: string, limit: number, tempo: number) => void;
}) {
  const [limit, setLimit] = useState<number>(member.limit_khusus ?? 0);
  const [tempo, setTempo] = useState<number>(member.tempo_khusus_hari ?? 5);

  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky text-blue flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono">
          {member.nama?.slice(0, 2).toUpperCase()}
        </div>
        <p className="text-[13.5px] font-bold text-navy truncate">{member.nama}</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-[10px] font-semibold text-slate block mb-1">
            Limit (sekarang: {formatRupiah(member.limit_khusus ?? 0)})
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={tiers.length === 0}
            className="w-full border border-sky-line rounded-lg px-2.5 py-2 text-xs font-mono outline-none bg-white disabled:opacity-50"
          >
            <option value={0} disabled>Pilih limit</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.nominal_pinjam}>
                {formatRupiah(t.nominal_pinjam)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate block mb-1">Tempo (hari)</label>
          <input
            type="number"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="w-full border border-sky-line rounded-lg px-2.5 py-2 text-xs font-mono outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={saving || limit === 0}
        onClick={() => onSave(member.id, limit, tempo)}
        className="bg-blue text-white text-xs font-bold px-4 py-2.5 rounded-lg disabled:opacity-60"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </div>
  );
}