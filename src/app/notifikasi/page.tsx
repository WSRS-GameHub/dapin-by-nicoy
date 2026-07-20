import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  ArrowLeft, AlertTriangle, Clock, CheckCircle2, XCircle, Eye, ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Notif = {
  id: string;
  type: "overdue" | "today" | "h1" | "verifikasi" | "status";
  title: string;
  desc: string;
  icon: typeof AlertTriangle;
  className: string;
};

export default async function NotifikasiPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: loans } = await supabase
    .from("loans")
    .select("*")
    .eq("member_id", user.id)
    .order("created_at", { ascending: false });

  const formatTanggalJam = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
    " WIB";
  const formatRupiah = (n: number) => "Rp " + (n ?? 0).toLocaleString("id-ID");

  const now = new Date();
  const todayStr = now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toDateString();

  const notifs: Notif[] = [];

  // ===== Notifikasi verifikasi keanggotaan =====
  const vStatus = profile?.verifikasi_status;

  if (vStatus === "menunggu") {
    notifs.push({
      id: "verif-menunggu",
      type: "verifikasi",
      title: "Verifikasi sedang diproses",
      desc: "Data verifikasi keanggotaan kamu sudah dikirim dan sedang menunggu diperiksa admin.",
      icon: Clock,
      className: "bg-amber/15 text-amber",
    });
  } else if (vStatus === "ditinjau") {
    notifs.push({
      id: "verif-ditinjau",
      type: "verifikasi",
      title: "Verifikasi sedang ditinjau admin",
      desc: "Admin lagi mengecek data verifikasi kamu lebih lanjut. Tunggu sebentar ya.",
      icon: Eye,
      className: "bg-indigo/15 text-indigo",
    });
  } else if (vStatus === "selesai") {
    notifs.push({
      id: "verif-selesai",
      type: "verifikasi",
      title: "Verifikasi disetujui",
      desc: "Selamat! Verifikasi keanggotaan kamu disetujui dan limit pinjaman sudah terbuka.",
      icon: ShieldCheck,
      className: "bg-teal/15 text-teal",
    });
  } else if (vStatus === "belum_verifikasi" && profile?.nik) {
    // ada data lama tapi status balik ke belum_verifikasi = pernah ditolak
    notifs.push({
      id: "verif-ditolak",
      type: "verifikasi",
      title: "Verifikasi ditolak",
      desc: "Data verifikasi kamu sebelumnya ditolak admin. Silakan cek dan ajukan ulang.",
      icon: XCircle,
      className: "bg-red-50 text-red-500",
    });
  }

  // ===== Notifikasi pinjaman =====
  for (const loan of loans ?? []) {
    if (loan.status === "disetujui" && loan.tanggal_cair && loan.tempo_hari) {
      const jatuhTempo = new Date(loan.tanggal_cair);
      jatuhTempo.setDate(jatuhTempo.getDate() + loan.tempo_hari);
      const jatuhTempoStr = jatuhTempo.toDateString();

      if (jatuhTempo < now && jatuhTempoStr !== todayStr) {
        notifs.push({
          id: loan.id + "-overdue",
          type: "overdue",
          title: "Pinjaman sudah lewat jatuh tempo",
          desc: `${formatRupiah(loan.jumlah_kembali)} — jatuh tempo ${formatTanggalJam(jatuhTempo)}. Segera lakukan pembayaran.`,
          icon: XCircle,
          className: "bg-red-50 text-red-500",
        });
      } else if (jatuhTempoStr === todayStr) {
        notifs.push({
          id: loan.id + "-today",
          type: "today",
          title: "Pinjaman jatuh tempo hari ini",
          desc: `${formatRupiah(loan.jumlah_kembali)} harus dikembalikan hari ini, ${formatTanggalJam(jatuhTempo)}.`,
          icon: AlertTriangle,
          className: "bg-amber/15 text-amber",
        });
      } else if (jatuhTempoStr === tomorrowStr) {
        notifs.push({
          id: loan.id + "-h1",
          type: "h1",
          title: "Pengingat: jatuh tempo besok",
          desc: `${formatRupiah(loan.jumlah_kembali)} jatuh tempo besok, ${formatTanggalJam(jatuhTempo)}. Siapkan dari sekarang ya.`,
          icon: Clock,
          className: "bg-amber/15 text-amber",
        });
      }
    }

    if (loan.status === "disetujui" && loan.tanggal_cair) {
      notifs.push({
        id: loan.id + "-approved",
        type: "status",
        title: "Pinjaman disetujui",
        desc: `Pengajuan ${formatRupiah(loan.nominal)} kamu disetujui dan sudah cair.`,
        icon: CheckCircle2,
        className: "bg-teal/15 text-teal",
      });
    }

    if (loan.status === "ditolak") {
      notifs.push({
        id: loan.id + "-rejected",
        type: "status",
        title: "Pinjaman ditolak",
        desc: `Pengajuan ${formatRupiah(loan.nominal)} kamu ditolak admin.`,
        icon: XCircle,
        className: "bg-red-50 text-red-500",
      });
    }

    if (loan.status === "lunas") {
      notifs.push({
        id: loan.id + "-lunas",
        type: "status",
        title: "Pinjaman lunas",
        desc: `Pinjaman ${formatRupiah(loan.nominal)} kamu sudah ditandai lunas. Terima kasih!`,
        icon: CheckCircle2,
        className: "bg-teal/15 text-teal",
      });
    }
  }

  // Urutkan: paling urgent di atas
  const priority: Record<string, number> = {
    overdue: 0, today: 1, h1: 2, verifikasi: 3, status: 4,
  };
  notifs.sort((a, b) => priority[a.type] - priority[b.type]);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F3F6FE] px-5 pt-6 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <a href="/dashboard" className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
          <ArrowLeft size={18} className="text-navy" />
        </a>
        <h1 className="font-display font-bold text-lg text-navy">Notifikasi</h1>
      </div>

      {notifs.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {notifs.map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.className}`}>
                  <Icon size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-navy">{n.title}</p>
                  <p className="text-xs text-slate mt-1 leading-relaxed">{n.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate text-center py-14">Belum ada notifikasi.</p>
        </div>
      )}
    </div>
  );
}