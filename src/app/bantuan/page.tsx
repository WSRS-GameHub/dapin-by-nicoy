import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LifeBuoy, MessageCircle, ChevronDown } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FAQ = [
  {
    q: "Bagaimana cara jadi anggota dan bisa pinjam?",
    a: "Buka menu Verifikasi di Beranda, isi data diri, kontak darurat, dan rekening. Setelah kirim, lampirkan foto KTP dan selfie pegang KTP lewat WhatsApp yang otomatis kebuka. Admin akan meninjau dan membuka limit pinjaman kamu.",
  },
  {
    q: "Berapa lama proses verifikasi?",
    a: "Tergantung admin memeriksa data dan dokumen kamu. Status verifikasi bisa dicek kapan aja di halaman Verifikasi atau Notifikasi.",
  },
  {
    q: "Kenapa nominal pinjaman saya terbatas?",
    a: "Limit ditentukan admin berdasarkan hasil verifikasi. Pilihan nominal yang muncul di halaman Pinjam otomatis dibatasi sampai limit kamu.",
  },
  {
    q: "Bagaimana cara membayar pinjaman?",
    a: "Buka Beranda, klik tombol \"Bayar Sekarang\" di kartu pinjaman aktif. Transfer ke salah satu rekening admin yang ditampilkan, lalu upload screenshot bukti transfer.",
  },
  {
    q: "Apa yang terjadi kalau telat bayar?",
    a: "Setelah lewat tanggal jatuh tempo, denda keterlambatan dihitung otomatis per hari dan ditambahkan ke total yang harus dibayar.",
  },
  {
    q: "Bukti transfer saya ditolak, kenapa?",
    a: "Admin menolak bukti transfer kalau fotonya kurang jelas, nominalnya beda, atau ada kesalahan lain. Cek alasan penolakan di halaman Bayar atau Notifikasi, lalu upload ulang bukti yang benar.",
  },
];

export default async function BantuanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: settings } = await supabase
    .from("loan_settings")
    .select("admin_whatsapp")
    .eq("id", 1)
    .single();

  const adminWhatsapp = settings?.admin_whatsapp ?? "";
  const waUrl = adminWhatsapp
    ? `https://wa.me/${adminWhatsapp}?text=${encodeURIComponent("Halo Admin, saya mau tanya soal Dapin.")}`
    : null;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F3F6FE] px-5 pt-6 pb-10">
      <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
        <ArrowLeft size={18} className="text-navy" />
      </Link>

      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-9 h-9 rounded-xl bg-amber/10 text-amber flex items-center justify-center">
          <LifeBuoy size={17} />
        </div>
        <h1 className="font-display font-bold text-xl text-navy">Bantuan</h1>
      </div>
      <p className="text-sm text-slate mt-1 mb-6">
        Pertanyaan yang sering ditanyakan tentang Dapin.
      </p>

      <div className="flex flex-col gap-2.5 mb-6">
        {FAQ.map((item, i) => (
          <details key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
            <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none">
              <p className="text-sm font-bold text-navy">{item.q}</p>
              <ChevronDown size={16} className="text-slate flex-shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-4 pb-4 text-xs text-slate leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>

      {waUrl && (
        
          <a href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-teal text-white text-sm font-semibold rounded-xl py-3.5"
        >
          <MessageCircle size={16} />
          Hubungi Admin via WhatsApp
        </a>
      )}
    </div>
  );
}