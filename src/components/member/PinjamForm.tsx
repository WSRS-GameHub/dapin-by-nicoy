"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Send, Check, AlertTriangle } from "lucide-react";
import Toast from "@/components/ui/Toast";

type Tier = { id: string; nominal_pinjam: number; nominal_kembali: number };

type Rekening = {
  nama_bank: string;
  no_rekening: string;
  nama_pemilik_rekening: string;
};

type Props = {
  userId: string;
  tempoHari: number;
  tiers: Tier[];
  sudahAdaPengajuan: boolean;
  rekening: Rekening;
};

export default function PinjamForm({
  userId, tempoHari, tiers, sudahAdaPengajuan, rekening,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
  const formatTanggalJam = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
    " WIB";

  const now = new Date();
  const perkiraanJatuhTempo = new Date(now);
  perkiraanJatuhTempo.setDate(perkiraanJatuhTempo.getDate() + tempoHari);

  async function handleSubmit() {
    setToast(null);

    if (!selected) {
      setToast({ type: "error", message: "Pilih nominal pinjaman dulu." });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("loans").insert({
      member_id: userId,
      nominal: selected.nominal_pinjam,
      jumlah_kembali: selected.nominal_kembali,
      status: "menunggu",
      tempo_hari: tempoHari,
    });

    setLoading(false);

    if (error) {
      setToast({ type: "error", message: "Gagal menyimpan pengajuan. Coba lagi." });
      return;
    }

    setToast({ type: "success", message: "Pengajuan terkirim! Menunggu persetujuan admin." });
    setTimeout(() => {
      router.push("/riwayat");
      router.refresh();
    }, 1200);
  }

  if (sudahAdaPengajuan) {
    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F3F6FE] px-5 pt-6">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
          <ArrowLeft size={18} className="text-navy" />
        </button>
        <div className="bg-white rounded-2xl p-6 text-center mt-10">
          <p className="text-sm text-slate leading-relaxed">
            Kamu masih punya pinjaman yang berjalan atau sedang menunggu persetujuan.
            Selesaikan dulu sebelum mengajukan pinjaman baru.
          </p>
        </div>
      </div>
    );
  }

  if (tiers.length === 0) {
    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F3F6FE] px-5 pt-6">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
          <ArrowLeft size={18} className="text-navy" />
        </button>
        <div className="bg-white rounded-2xl p-6 text-center mt-10">
          <p className="text-sm text-slate leading-relaxed">
            Belum ada pilihan nominal pinjaman yang tersedia untuk limit kamu. Hubungi admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F3F6FE] px-5 pt-6 pb-10">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
        <ArrowLeft size={18} className="text-navy" />
      </button>

      <h1 className="font-display font-bold text-xl text-navy">Ajukan Pinjaman</h1>
      <p className="text-sm text-slate mt-1 mb-5">
        Pilih nominal sesuai kebutuhan, tempo {tempoHari} hari. Admin akan meninjau pengajuanmu.
      </p>

      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {tiers.map((t) => {
          const active = selected?.id === t.id;
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => setSelected(t)}
              className={`relative rounded-2xl px-3.5 py-3 border-2 text-left ${
                active ? "border-blue bg-blue/5" : "border-sky-line bg-white"
              }`}
            >
              {active && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </div>
              )}
              <p className="text-sm font-bold text-navy font-mono">{formatRupiah(t.nominal_pinjam)}</p>
              <p className="text-[10.5px] text-slate mt-1">
                Kembali <b className="text-teal">{formatRupiah(t.nominal_kembali)}</b>
              </p>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="bg-sky rounded-xl px-4 py-3.5 mb-6 flex flex-col gap-3">
          <div className="flex gap-2.5">
            <AlertTriangle size={15} className="text-amber flex-shrink-0 mt-0.5" />
            <div className="text-[11.5px] text-slate leading-relaxed">
              Harap cek rekening tujuan pencairan dengan benar sebelum mengajukan:
              <br />
              <b className="text-navy">
                {rekening.nama_bank || "Bank belum diisi"} · {rekening.no_rekening || "-"}
              </b>
              <br />
              a.n {rekening.nama_pemilik_rekening || "-"}
            </div>
          </div>
          <div className="border-t border-sky-line pt-3 text-[11.5px] text-slate">
            Jatuh tempo pada tanggal <b className="text-navy">{formatTanggalJam(perkiraanJatuhTempo)}</b>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !selected}
        className="flex items-center justify-center gap-2 bg-blue text-white font-semibold text-sm rounded-xl py-3.5 disabled:opacity-60"
      >
        <Send size={16} />
        {loading ? "Mengirim..." : "Ajukan Pinjaman"}
      </button>
    </div>
  );
}