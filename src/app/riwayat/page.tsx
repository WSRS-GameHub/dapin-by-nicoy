import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Clock, CheckCircle2, XCircle, Wallet } from "lucide-react";
import BottomNav from "@/components/member/BottomNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RiwayatPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("verifikasi_status")
    .eq("id", user.id)
    .single();

  const { data: loans } = await supabase
    .from("loans")
    .select("*")
    .eq("member_id", user.id)
    .order("created_at", { ascending: false });

  const sudahTerverifikasi = profile?.verifikasi_status === "selesai";
  const ajukanHref = sudahTerverifikasi ? "/pinjam" : "/ajukan";
  const ajukanLabel = sudahTerverifikasi ? "Pinjam" : "Verifikasi";

  const formatRupiah = (n: number) => "Rp " + (n ?? 0).toLocaleString("id-ID");
  const formatTanggalJam = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }) +
  ", " +
  new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) +
  " WIB";

  function hitungJatuhTempo(tanggalCair: string, tempoHari: number) {
    const cair = new Date(tanggalCair);
    const jatuhTempo = new Date(cair);
    jatuhTempo.setDate(jatuhTempo.getDate() + tempoHari);
    return jatuhTempo;
  }

  const statusCfg: Record<string, { label: string; icon: typeof Clock; className: string }> = {
    menunggu: { label: "Menunggu", icon: Clock, className: "bg-amber/15 text-amber" },
    disetujui: { label: "Disetujui", icon: Wallet, className: "bg-blue/15 text-blue" },
    lunas: { label: "Lunas", icon: CheckCircle2, className: "bg-teal/15 text-teal" },
    ditolak: { label: "Ditolak", icon: XCircle, className: "bg-red-100 text-red-500" },
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F3F6FE]">
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-display font-bold text-lg text-navy">Riwayat Pinjaman</h1>
        <p className="text-sm text-slate mt-1">Semua pengajuan pinjaman kamu.</p>
      </div>

      <div className="px-5 flex-1 flex flex-col gap-2.5">
        {loans && loans.length > 0 ? (
          loans.map((loan) => {
            const cfg = statusCfg[loan.status] ?? statusCfg.menunggu;
            const Icon = cfg.icon;
            const jatuhTempo =
              loan.tanggal_cair && loan.tempo_hari
                ? hitungJatuhTempo(loan.tanggal_cair, loan.tempo_hari)
                : null;

            return (
              <div key={loan.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-navy font-mono">{formatRupiah(loan.nominal)}</p>
                    {loan.jumlah_kembali && (
                      <p className="text-[11px] text-slate mt-0.5">
                        Kembali <b className="text-teal">{formatRupiah(loan.jumlah_kembali)}</b>
                      </p>
                    )}
                  </div>
                  <span className={`flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ${cfg.className}`}>
                    <Icon size={11} /> {cfg.label}
                  </span>
                </div>

                {loan.tanggal_cair ? (
                  <div className="mt-3 pt-3 border-t border-sky-line flex flex-col gap-1 text-[11px] text-slate">
                    <div className="flex justify-between">
                      <span>Mulai</span>
                      <b className="text-navy">{formatTanggalJam(loan.tanggal_cair)}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Jatuh tempo</span>
                      <b className={loan.status === "disetujui" ? "text-amber" : "text-navy"}>
                        {jatuhTempo ? formatTanggalJam(jatuhTempo.toISOString()) : "-"}
                      </b>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between mt-3 pt-3 border-t border-sky-line text-[11px] text-slate">
                    <span>Diajukan {formatTanggalJam(loan.created_at)}</span>
                    <span>Tempo {loan.tempo_hari ?? "-"} hari</span>
                  </div>
                )}

                {loan.status === "disetujui" && loan.bukti_transfer_url && (
                  <div className="mt-3 flex items-center gap-2 bg-teal/10 text-teal text-[11px] font-semibold rounded-lg px-3 py-2.5">
                    <CheckCircle2 size={13} />
                    Bukti transfer terkirim, menunggu konfirmasi admin
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-slate text-center py-14">
              Belum ada riwayat pinjaman.
            </p>
          </div>
        )}
      </div>

      <BottomNav ajukanHref={ajukanHref} ajukanLabel={ajukanLabel} />
    </div>
  );
}