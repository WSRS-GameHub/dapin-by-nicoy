"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Upload, Send, CheckCircle2, Home, History } from "lucide-react";
import Link from "next/link";
import BankLogo from "@/components/ui/BankLogo";
import Toast from "@/components/ui/Toast";

type Rekening = {
  id: string;
  nama_bank: string;
  no_rekening: string;
  nama_pemilik: string;
};

type Props = {
  loanId: string;
  userId: string;
  jumlahKembali: number;
  rekeningList: Rekening[];
  buktiSudahAda: boolean;
};

export default function BayarForm({
  loanId, userId, jumlahKembali, rekeningList, buktiSudahAda,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [berhasilKirim, setBerhasilKirim] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function getErrorMessage(err: unknown): string {
    if (err && typeof err === "object" && "message" in err) {
      return String((err as { message: unknown }).message);
    }
    return "Terjadi kesalahan yang tidak diketahui.";
  }

  async function handleSubmit() {
    setToast(null);

    if (!file) {
      setToast({ type: "error", message: "Upload screenshot bukti transfer dulu." });
      return;
    }

    setLoading(true);

    const ext = file.name.split(".").pop();
    const path = userId + "/" + loanId + "-" + Date.now() + "." + ext;

    const uploadResult = await supabase.storage.from("bukti-transfer").upload(path, file);

    if (uploadResult.error) {
      setLoading(false);
      setToast({ type: "error", message: "Upload gagal: " + getErrorMessage(uploadResult.error) });
      return;
    }

    const urlData = supabase.storage.from("bukti-transfer").getPublicUrl(path);
    const publicUrl = urlData.data.publicUrl;

    const updateResult = await supabase
      .from("loans")
      .update({
        bukti_transfer_url: publicUrl,
        bukti_transfer_at: new Date().toISOString(),
      })
      .eq("id", loanId);

    setLoading(false);

    if (updateResult.error) {
      setToast({ type: "error", message: "Gagal menyimpan bukti: " + getErrorMessage(updateResult.error) });
      return;
    }

    setBerhasilKirim(true);
    router.refresh();
  }

  // Tampilan sukses — muncul kalau baru aja berhasil kirim ATAU sebelumnya udah pernah kirim
  if (berhasilKirim || buktiSudahAda) {
    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F3F6FE] px-5 pt-6 pb-10">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-teal/10 text-teal flex items-center justify-center mb-5">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="font-display font-bold text-xl text-navy mb-2">
            Bukti Berhasil Dikirim
          </h1>
          <p className="text-sm text-slate leading-relaxed max-w-[280px]">
            Bukti transfer kamu sudah kami terima dan sedang menunggu konfirmasi admin.
            Kamu akan diberi tahu begitu pinjaman ditandai lunas.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Link
            href="/riwayat"
            className="flex items-center justify-center gap-2 bg-blue text-white text-sm font-semibold rounded-xl py-3.5"
          >
            <History size={16} />
            Lihat Riwayat
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 bg-white border border-sky-line text-navy text-sm font-semibold rounded-xl py-3.5"
          >
            <Home size={16} />
            Kembali ke Beranda
          </Link>
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

      <h1 className="font-display font-bold text-xl text-navy">Bayar Pinjaman</h1>
      <p className="text-sm text-slate mt-1 mb-6">
        Transfer <b className="text-navy font-mono">{formatRupiah(jumlahKembali)}</b> ke salah satu rekening di bawah, lalu kirim bukti transfernya.
      </p>

      <p className="text-xs font-bold text-slate uppercase tracking-wide mb-2">Pilih Rekening Tujuan</p>
      <div className="flex flex-col gap-2 mb-6">
        {rekeningList.length > 0 ? (
          rekeningList.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm p-3.5 flex items-center gap-3">
              <BankLogo namaBank={r.nama_bank} size={40} />
              <div className="min-w-0">
                <p className="text-sm font-bold text-navy">{r.nama_bank}</p>
                <p className="text-xs text-slate font-mono mt-0.5">{r.no_rekening}</p>
                <p className="text-[11px] text-slate">a.n {r.nama_pemilik}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate text-center py-6 bg-white rounded-2xl shadow-sm">
            Admin belum menambahkan rekening pembayaran.
          </p>
        )}
      </div>

      <p className="text-xs font-bold text-slate uppercase tracking-wide mb-2">Upload Bukti Transfer</p>
      <label className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-sky-line cursor-pointer mb-6 min-h-[160px]">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview bukti transfer" className="max-h-40 rounded-lg object-contain" />
        ) : (
          <>
            <div className="w-11 h-11 rounded-full bg-sky text-blue flex items-center justify-center">
              <Upload size={18} />
            </div>
            <p className="text-xs text-slate text-center">
              Ketuk untuk pilih screenshot bukti transfer
            </p>
          </>
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !file}
        className="flex items-center justify-center gap-2 bg-blue text-white font-semibold text-sm rounded-xl py-3.5 disabled:opacity-60"
      >
        <Send size={16} />
        {loading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
      </button>
    </div>
  );
}