"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Send, Clock, Eye, CheckCircle2, FileText, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import Toast from "@/components/ui/Toast";

type Status = "belum_verifikasi" | "menunggu" | "ditinjau" | "selesai";

type Props = {
  userId: string;
  nama: string;
  status: Status;
  adminWhatsapp: string;
  initialData: {
    alamat: string;
    nik: string;
    pekerjaan: string;
    kontak_darurat_nama: string;
    kontak_darurat_notelp: string;
    kontak_darurat_hubungan: string;
    nama_bank: string;
    no_rekening: string;
    nama_pemilik_rekening: string;
  };
};

const statusConfig: Record<Status, { label: string; icon: typeof Clock; className: string }> = {
  belum_verifikasi: {
    label: "Belum Verifikasi",
    icon: FileText,
    className: "bg-slate/10 text-slate",
  },
  menunggu: {
    label: "Menunggu Persetujuan",
    icon: Clock,
    className: "bg-amber/15 text-amber",
  },
  ditinjau: {
    label: "Sedang Ditinjau",
    icon: Eye,
    className: "bg-indigo/15 text-indigo",
  },
  selesai: {
    label: "Selesai · Limit Terbuka",
    icon: CheckCircle2,
    className: "bg-teal/15 text-teal",
  },
};

export default function AjukanForm({
  userId,
  nama,
  status,
  adminWhatsapp,
  initialData,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setToast(null);

    const required = [
      form.alamat, form.nik, form.pekerjaan,
      form.kontak_darurat_nama, form.kontak_darurat_notelp, form.kontak_darurat_hubungan,
      form.nama_bank, form.no_rekening, form.nama_pemilik_rekening,
    ];
    if (required.some((f) => !f.trim())) {
      setToast({ type: "error", message: "Semua field wajib diisi lengkap." });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ ...form, verifikasi_status: "menunggu" })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      setToast({ type: "error", message: "Gagal menyimpan data. Coba lagi." });
      return;
    }

    // Template pesan WhatsApp — ganti teks di sini kalau mau ubah kata-katanya
    const pesan = `Halo Admin, saya ${nama} mau mengajukan verifikasi keanggotaan di Dapin.

Data diri saya sudah saya isi di aplikasi:
- NIK: ${form.nik}
- Pekerjaan: ${form.pekerjaan}
- Alamat: ${form.alamat}

Kontak Darurat:
- ${form.kontak_darurat_nama} (${form.kontak_darurat_hubungan}), ${form.kontak_darurat_notelp}

Rekening:
- ${form.nama_bank} ${form.no_rekening} a.n ${form.nama_pemilik_rekening}

Berikut saya kirimkan seluruh dokumen dan data yang diperlukan untuk proses verifikasi.

Data yang dilampirkan:

Foto menggunakan aplikasi Cam GPS.
Foto KTP.
Foto selfie sambil memegang KTP.
Foto Kartu Keluarga (KK).
Screenshot seluruh akun media sosial yang dimiliki.
Screenshot akun media sosial dari 2 orang teman.
Foto bersama orang tua.
Foto bersama teman.
Foto rumah tampak depan.
Foto rumah tampak samping.
Video pernyataan/perjanjian. 
(**Naskah Video Perjanjian DAPIN by Nicoy**)

Halo, perkenalkan.

Nama saya **[Nama Lengkap]**, dengan NIK **[Nomor KTP]**.

Saya mengajukan pinjaman melalui **DAPIN by Nicoy**. Saya menyatakan bahwa seluruh data dan dokumen yang saya berikan adalah benar, asli, dan dapat dipertanggungjawabkan.

Saya memahami bahwa pinjaman yang saya terima wajib saya lunasi sesuai dengan jatuh tempo, yaitu maksimal **5 (lima) hari** sejak dana diterima.

Apabila saya memberikan data yang tidak benar atau tidak melunasi pinjaman sesuai dengan ketentuan yang telah disepakati, saya bersedia menerima konsekuensi sesuai dengan peraturan **DAPIN by Nicoy**.

Demikian pernyataan ini saya buat dengan sadar dan tanpa paksaan dari pihak mana pun."


Mohon dilakukan pengecekan dan verifikasi terhadap data yang telah saya kirim. Apabila terdapat dokumen yang kurang atau perlu diperbaiki, mohon informasikan kepada saya.

Terima kasih.`;

    setToast({ type: "success", message: "Data tersimpan! Mengalihkan ke WhatsApp..." });

    setTimeout(() => {
      const waUrl = `https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(pesan)}`;
      window.location.href = waUrl;
    }, 900);
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F3F6FE] px-5 pt-6 pb-10">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
          <ArrowLeft size={18} className="text-navy" />
        </button>
        <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${cfg.className}`}>
          <StatusIcon size={13} />
          {cfg.label}
        </span>
      </div>

      <h1 className="font-display font-bold text-xl text-navy">Verifikasi Keanggotaan</h1>
      <p className="text-sm text-slate mt-1 mb-6">
        {status === "selesai"
          ? "Verifikasi kamu sudah selesai."
          : "Lengkapi data ini sekali saja supaya limit pinjaman kamu bisa dibuka admin."}
      </p>

      {status === "selesai" && (
        <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
          <p className="text-sm text-slate leading-relaxed">
            Verifikasi kamu sudah disetujui admin dan limit pinjaman kamu sudah terbuka.
            Data diri, kontak darurat, dan rekening bisa dilihat atau diubah di halaman Profil.
          </p>
          <Link
            href="/pinjam"
            className="flex items-center justify-center gap-2 bg-blue text-white text-sm font-semibold rounded-xl py-3"
          >
            Ajukan Pinjaman
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/profil"
            className="flex items-center justify-center gap-2 bg-sky text-blue text-sm font-semibold rounded-xl py-3"
          >
            <User size={15} />
            Lihat Profil Saya
          </Link>
        </div>
      )}

      {(status === "menunggu" || status === "ditinjau") && (
        <div className="bg-white rounded-2xl p-5 mb-4 text-sm text-slate leading-relaxed">
          Data verifikasi kamu sudah dikirim dan sedang diproses admin. Kamu akan
          diberitahu lewat WhatsApp begitu statusnya berubah.
        </div>
      )}

      {status !== "selesai" && (
        <fieldset disabled={status !== "belum_verifikasi"} className="flex flex-col gap-6 disabled:opacity-60">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <section>
              <h2 className="font-display font-bold text-sm text-navy mb-3">1. Isi Data Diri</h2>
              <div className="flex flex-col gap-3">
                <Field label="NIK (Nomor KTP)" value={form.nik} onChange={(v) => update("nik", v)} placeholder="16 digit sesuai KTP" />
                <Field label="Pekerjaan" value={form.pekerjaan} onChange={(v) => update("pekerjaan", v)} placeholder="Contoh: Karyawan swasta" />
                <TextArea label="Alamat Lengkap" value={form.alamat} onChange={(v) => update("alamat", v)} placeholder="Sesuai KTP / domisili saat ini" />
              </div>
            </section>

            <section>
              <h2 className="font-display font-bold text-sm text-navy mb-3">2. Dokumen Pendukung</h2>
              <div className="bg-sky rounded-xl px-4 py-3.5 text-xs text-slate leading-relaxed">
                Dokumen di bawah ini tidak diupload di sini — kirimkan langsung sebagai
                foto/file lewat WhatsApp setelah menekan tombol kirim:
                <ul className="mt-2 space-y-1 font-medium text-navy">
                  <li>• Foto KTP</li>
                  <li>• Foto diri sambil memegang KTP</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-display font-bold text-sm text-navy mb-3">3. Kontak Darurat</h2>
              <div className="flex flex-col gap-3">
                <Field label="Nama Kontak Darurat" value={form.kontak_darurat_nama} onChange={(v) => update("kontak_darurat_nama", v)} placeholder="Nama lengkap" />
                <Field label="No. HP Kontak Darurat" value={form.kontak_darurat_notelp} onChange={(v) => update("kontak_darurat_notelp", v)} placeholder="08xxxxxxxxxx" />
                <Field label="Hubungan" value={form.kontak_darurat_hubungan} onChange={(v) => update("kontak_darurat_hubungan", v)} placeholder="Contoh: Orang tua, Saudara" />
              </div>
            </section>

            <section>
              <h2 className="font-display font-bold text-sm text-navy mb-3">4. Nomor Rekening</h2>
              <div className="flex flex-col gap-3">
                <Field label="Nama Bank" value={form.nama_bank} onChange={(v) => update("nama_bank", v)} placeholder="Contoh: BRI, BCA, Mandiri" />
                <Field label="Nomor Rekening" value={form.no_rekening} onChange={(v) => update("no_rekening", v)} placeholder="Nomor rekening aktif" />
                <Field label="Nama Pemilik Rekening" value={form.nama_pemilik_rekening} onChange={(v) => update("nama_pemilik_rekening", v)} placeholder="Sesuai buku tabungan" />
              </div>
            </section>

            {status === "belum_verifikasi" && (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-blue text-white font-semibold text-sm rounded-xl py-3.5 disabled:opacity-60"
              >
                <Send size={16} />
                {loading ? "Menyimpan..." : "Kirim Verifikasi & Lanjut ke WhatsApp"}
              </button>
            )}
          </form>
        </fieldset>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate block mb-1.5">{label}</label>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-sky-line bg-white rounded-xl px-4 py-3 outline-none text-sm text-navy placeholder:text-slate/60"
      />
    </div>
  );
}

function TextArea({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate block mb-1.5">{label}</label>
      <textarea
        required
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-sky-line bg-white rounded-xl px-4 py-3 outline-none text-sm text-navy placeholder:text-slate/60 resize-none"
      />
    </div>
  );
}