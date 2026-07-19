import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShieldCheck, Users, Settings, ArrowRight, Clock, Eye } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminBeranda() {
  const supabase = await createClient();

  const { data: settings } = await supabase.from("loan_settings").select("*").eq("id", 1).single();
  const { data: pendingMembers } = await supabase
    .from("profiles")
    .select("*")
    .in("verifikasi_status", ["menunggu", "ditinjau"])
    .order("created_at", { ascending: true });
  const { data: verifiedCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: false })
    .eq("verifikasi_status", "selesai")
    .eq("is_admin", false);

  const statusCfg: Record<string, { label: string; icon: typeof Clock; className: string }> = {
    menunggu: { label: "Menunggu", icon: Clock, className: "bg-amber/15 text-amber" },
    ditinjau: { label: "Ditinjau", icon: Eye, className: "bg-indigo/15 text-indigo" },
  };

  return (
    <div className="px-5 pb-4 flex flex-col gap-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-navy to-blue-dark rounded-2xl p-4 text-white">
          <p className="text-[11px] text-[#A9B8DE] font-semibold">Menunggu Verifikasi</p>
          <p className="font-display font-bold text-2xl mt-2">{pendingMembers?.length ?? 0}</p>
        </div>
        <div className="bg-white border border-sky-line rounded-2xl p-4">
          <p className="text-[11px] text-slate font-semibold">Anggota Aktif</p>
          <p className="font-display font-bold text-2xl text-blue mt-2">{verifiedCount?.length ?? 0}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex justify-between">
        <Link href="/admin/verifikasi" className="flex flex-col items-center gap-2 w-16">
          <div className="w-[54px] h-[54px] rounded-2xl bg-amber/10 text-amber flex items-center justify-center shadow-sm">
            <ShieldCheck size={22} />
          </div>
          <span className="text-[11px] font-semibold text-navy text-center">Verifikasi</span>
        </Link>
        <Link href="/admin/anggota" className="flex flex-col items-center gap-2 w-16">
          <div className="w-[54px] h-[54px] rounded-2xl bg-blue/10 text-blue flex items-center justify-center shadow-sm">
            <Users size={22} />
          </div>
          <span className="text-[11px] font-semibold text-navy text-center">Anggota</span>
        </Link>
        <Link href="/admin/pengaturan" className="flex flex-col items-center gap-2 w-16">
          <div className="w-[54px] h-[54px] rounded-2xl bg-indigo/10 text-indigo flex items-center justify-center shadow-sm">
            <Settings size={22} />
          </div>
          <span className="text-[11px] font-semibold text-navy text-center">Pengaturan</span>
        </Link>
      </div>

      {/* Aturan aktif ringkas */}
      <div className="bg-white border border-sky-line rounded-2xl p-4">
        <p className="text-xs font-bold text-navy mb-2">Aturan Default Aktif</p>
        <div className="flex justify-between text-xs text-slate">
          <span>Limit: <b className="text-navy font-mono">Rp {(settings?.limit_default ?? 0).toLocaleString("id-ID")}</b></span>
          <span>Tempo: <b className="text-navy font-mono">{settings?.tempo_default_hari} hari</b></span>
        </div>
        <div className="flex justify-between text-xs text-slate mt-1.5">
          <span>Denda: <b className="text-navy font-mono">Rp {(settings?.denda_per_hari ?? 0).toLocaleString("id-ID")}/hari</b></span>
        </div>
      </div>

      {/* Preview pengajuan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[15px] text-navy">Pengajuan Terbaru</h3>
          <Link href="/admin/verifikasi" className="text-xs font-semibold text-blue flex items-center gap-1">
            Lihat Semua <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex flex-col gap-2.5">
          {pendingMembers && pendingMembers.length > 0 ? (
            pendingMembers.slice(0, 3).map((m) => {
              const cfg = statusCfg[m.verifikasi_status];
              const Icon = cfg.icon;
              return (
                <Link
                  key={m.id}
                  href="/admin/verifikasi"
                  className="flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky text-blue flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono">
                    {m.nama?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-bold text-navy truncate">{m.nama}</p>
                    <p className="text-[11.5px] text-slate mt-0.5">{m.id_anggota}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-lg ${cfg.className}`}>
                    <Icon size={11} /> {cfg.label}
                  </span>
                </Link>
              );
            })
          ) : (
            <p className="text-xs text-slate text-center py-6">Tidak ada pengajuan menunggu.</p>
          )}
        </div>
      </div>
    </div>
  );
}