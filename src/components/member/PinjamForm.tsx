"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Send, Check } from "lucide-react";
import Toast from "@/components/ui/Toast";

type Tier = { id: string; nominal_pinjam: number; nominal_kembali: number };

type Props = {
  userId: string;
  nama: string;
  idAnggota: string;
  tempoHari: number;
  adminWhatsapp: string;
  tiers: Tier[];
  sudahAdaPengajuan: boolean;
};

export default function PinjamForm({
  userId, nama, idAnggota, tempoHari, adminWhatsapp, tiers, sudahAdaPengajuan,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<Tier | null>(null);
  const [keperluan, setKeperluan] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setToast(null);

    if (!selected) {
      setToast({ type: "error", message: "Pilih nominal pinjaman dulu." });
      return;
    }
    if (!keperluan.trim()) {
      setToast({ type: "error", message: "Isi keperluan pinjaman terlebih dahulu." });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("loans").insert({
      member_id: userId,
      nominal: selected.nominal_pinjam,
      jumlah_kembali: selected.nominal_kembali,
      keperluan,
      status: "menunggu",
      tempo_hari: tempoHari,
    });

    setLoading(false);

    if (error) {
      setToast({ type: "error", message: "Gagal menyimpan pengajuan. Coba lagi." });
      return;
    }

    const pesan = `Halo Admin Dapin, saya mau ajukan pinjaman.

Nama: ${nama}
ID Anggota: ${idAnggota}
Nominal Pinjam: ${formatRupiah(selected.nominal_pinjam)}
Jumlah Dikembalikan: ${formatRupiah(selected.nominal_kembali)}
Keperluan: ${keperluan}
Tempo: ${tempoHari} hari

Mohon diproses ya, terima kasih.`;

    const waUrl = `https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(pesan)}`;

    setToast({ type: "success", message: "Pengajuan tersimpan! Mengalihkan ke WhatsApp..." });
    setTimeout(() => {
      window.location.href = waUrl;
    }, 900);
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
        Pilih nominal sesuai kebutuhan, tempo {tempoHari} hari.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          {tiers.map((t) => {
            const active = selected?.id === t.id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setSelected(t)}
                className={`flex items-center justify-between rounded-2xl px-4 py-3.5 border-2 text-left ${
                  active ? "border-blue bg-blue/5" : "border-sky-line bg-white"
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-navy font-mono">{formatRupiah(t.nominal_pinjam)}</p>
                  <p className="text-[11px] text-slate mt-0.5">
                    Kembali <b className="text-teal">{formatRupiah(t.nominal_kembali)}</b>
                  </p>
                </div>
                {active && (
                  <div className="w-6 h-6 rounded-full bg-blue flex items-center justify-center flex-shrink-0">
                    <Check size={13} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate block mb-1.5">Keperluan</label>
          <textarea
            required
            value={keperluan}
            onChange={(e) => setKeperluan(e.target.value)}
            placeholder="Contoh: kebutuhan mendesak, modal jualan, dll"
            rows={3}
            className="w-full border border-sky-line bg-white rounded-xl px-4 py-3 outline-none text-sm text-navy placeholder:text-slate/60 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selected}
          className="flex items-center justify-center gap-2 bg-blue text-white font-semibold text-sm rounded-xl py-3.5 disabled:opacity-60"
        >
          <Send size={16} />
          {loading ? "Menyimpan..." : "Ajukan & Lanjut ke WhatsApp"}
        </button>
      </form>
    </div>
  );
}