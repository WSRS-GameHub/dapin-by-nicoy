import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Plus,
  History,
  BarChart3,
  LifeBuoy,
  User,
  Home,
  Lock,
  ArrowRight,
  Clock,
  Wallet,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function sapaan() {
  const jam = new Date().getHours();
  if (jam < 10) return "Selamat pagi";
  if (jam < 15) return "Selamat siang";
  if (jam < 18) return "Selamat sore";
  return "Selamat malam";
}

export default async function DashboardPage() {
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

  const sudahTerverifikasi = profile?.verifikasi_status === "selesai";

  const { data: activeLoan } = sudahTerverifikasi
    ? await supabase
        .from("loans")
        .select("*")
        .eq("member_id", user.id)
        .eq("status", "disetujui")
        .order("tanggal_cair", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const { data: recentLoans } = await supabase
    .from("loans")
    .select("*")
    .eq("member_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const limit = profile?.limit_khusus ?? 0;
  const tempoHari = profile?.tempo_khusus_hari ?? 5;

  let hariBerjalan = 0;
  let sisaHari = tempoHari;
  let adaPengingat = false;

  if (activeLoan?.tanggal_cair) {
    const cair = new Date(activeLoan.tanggal_cair);
    const now = new Date();
    hariBerjalan = Math.max(
      0,
      Math.floor((now.getTime() - cair.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
    sisaHari = Math.max(0, tempoHari - hariBerjalan);

    const jatuhTempo = new Date(cair);
    jatuhTempo.setDate(jatuhTempo.getDate() + tempoHari);
    const todayStr = now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const jatuhTempoStr = jatuhTempo.toDateString();

    if (jatuhTempoStr === tomorrow.toDateString() || jatuhTempoStr === todayStr || jatuhTempo < now) {
      adaPengingat = true;
    }
  }

  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

  const statusLabel: Record<string, string> = {
    belum_verifikasi: "Belum verifikasi",
    menunggu: "Menunggu persetujuan",
    ditinjau: "Sedang ditinjau",
  };

  const aktivitasCfg: Record<string, { icon: typeof Clock; className: string }> = {
    menunggu: { icon: Clock, className: "bg-amber/10 text-amber" },
    disetujui: { icon: Wallet, className: "bg-blue/10 text-blue" },
    lunas: { icon: CheckCircle2, className: "bg-teal/10 text-teal" },
    ditolak: { icon: XCircle, className: "bg-red-50 text-red-500" },
  };

  const ajukanHref = sudahTerverifikasi ? "/pinjam" : "/ajukan";
  const ajukanLabel = sudahTerverifikasi ? "Pinjam" : "Verifikasi";

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F3F6FE]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <div>
          <p className="text-xs text-slate font-medium">{sapaan()} 👋</p>
          <h1 className="font-display font-bold text-xl text-navy mt-0.5">
            {profile?.nama ?? "Anggota"}
          </h1>
        </div>
        <Link href="/notifikasi" className="relative w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
          <Bell size={18} className="text-navy" />
          {adaPengingat && (
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
          )}
        </Link>
      </div>

      {/* Tenor / Limit Card */}
      <div className="px-5">
        {sudahTerverifikasi ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-blue-dark p-6 text-white shadow-lg shadow-navy/10">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs text-[#A9B8DE] font-semibold">
                  {activeLoan ? "Pinjaman aktif" : "Limit tersedia"}
                </p>
                <p className="font-mono text-[26px] font-bold mt-1.5 leading-none">
                  {formatRupiah(activeLoan ? activeLoan.nominal : limit)}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                  activeLoan ? "bg-teal/20 text-[#5FE1D3]" : "bg-white/10 text-white/70"
                }`}
              >
                {activeLoan ? "AKTIF" : "TERBUKA"}
              </span>
            </div>

            <div className="flex gap-1.5 mt-6 relative z-10">
              {Array.from({ length: tempoHari }).map((_, i) => {
                const dayNum = i + 1;
                let state = "";
                if (activeLoan) {
                  if (dayNum < hariBerjalan) state = "on";
                  else if (dayNum === hariBerjalan) state = "now";
                }
                return (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full ${
                      state === "on" ? "bg-blue" : state === "now" ? "bg-teal" : "bg-white/15"
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex justify-between mt-3 text-[11px] text-[#A9B8DE] relative z-10">
              <span>
                Tenor tetap <b className="text-white">{tempoHari} hari</b>
              </span>
              <span>
                {activeLoan ? (
                  <>
                    Sisa <b className="text-white">{sisaHari} hari lagi</b>
                  </>
                ) : (
                  <>
                    Limit maks <b className="text-white">{formatRupiah(limit)}</b>
                  </>
                )}
              </span>
            </div>

            {!activeLoan && (
              <Link
                href="/pinjam"
                className="mt-5 flex items-center justify-center gap-2 bg-blue text-white text-sm font-semibold rounded-xl py-3 relative z-10 hover:bg-blue-dark transition-colors"
              >
                Ajukan Pinjaman
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-lg shadow-navy/10">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs text-[#A9B8DE] font-semibold">Limit pinjaman</p>
                <div className="flex items-center gap-2 mt-2">
                  <Lock size={20} className="text-[#7488BC]" />
                  <p className="font-mono text-xl font-bold text-[#7488BC] tracking-widest">
                    ••••••••
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-amber/20 text-amber px-2.5 py-1 rounded-lg whitespace-nowrap">
                {statusLabel[profile?.verifikasi_status ?? "belum_verifikasi"]}
              </span>
            </div>

            <p className="text-xs text-[#A9B8DE] mt-4 leading-relaxed relative z-10">
              Limit kamu masih terkunci. Selesaikan verifikasi keanggotaan dulu supaya
              admin bisa membuka limit pinjaman kamu.
            </p>

            <Link
              href="/ajukan"
              className="mt-5 flex items-center justify-center gap-2 bg-blue text-white text-sm font-semibold rounded-xl py-3 relative z-10 hover:bg-blue-dark transition-colors"
            >
              {profile?.verifikasi_status === "belum_verifikasi"
                ? "Mulai Verifikasi"
                : "Lihat Status Verifikasi"}
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between px-5 pt-6 pb-1">
        <Link href={ajukanHref} className="flex flex-col items-center gap-2 w-16 group">
          <div className="w-[54px] h-[54px] rounded-2xl bg-blue/10 text-blue flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
            <Plus size={22} />
          </div>
          <span className="text-[11px] font-semibold text-navy">{ajukanLabel}</span>
        </Link>
        <Link href="/riwayat" className="flex flex-col items-center gap-2 w-16 group">
          <div className="w-[54px] h-[54px] rounded-2xl bg-indigo/10 text-indigo flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
            <History size={22} />
          </div>
          <span className="text-[11px] font-semibold text-navy">Riwayat</span>
        </Link>
        <Link href="/simulasi" className="flex flex-col items-center gap-2 w-16 group">
          <div className="w-[54px] h-[54px] rounded-2xl bg-teal/10 text-teal flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
            <BarChart3 size={22} />
          </div>
          <span className="text-[11px] font-semibold text-navy">Simulasi</span>
        </Link>
        <Link href="/bantuan" className="flex flex-col items-center gap-2 w-16 group">
          <div className="w-[54px] h-[54px] rounded-2xl bg-amber/10 text-amber flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
            <LifeBuoy size={22} />
          </div>
          <span className="text-[11px] font-semibold text-navy">Bantuan</span>
        </Link>
      </div>

      {/* Aktivitas Terbaru */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[15px] text-navy">Aktivitas Terbaru</h3>
          {recentLoans && recentLoans.length > 0 && (
            <Link href="/riwayat" className="text-xs font-semibold text-blue flex items-center gap-1">
              Lihat Semua <ArrowRight size={12} />
            </Link>
          )}
        </div>
        <div className="flex flex-col gap-2.5">
          {recentLoans && recentLoans.length > 0 ? (
            recentLoans.map((loan) => {
              const cfg = aktivitasCfg[loan.status] ?? aktivitasCfg.menunggu;
              const Icon = cfg.icon;
              return (
                <div key={loan.id} className="flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.className}`}>
                    <Icon size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-bold text-navy">Pinjaman</p>
                    <p className="text-[11.5px] text-slate mt-0.5 capitalize">
                      {new Date(loan.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {loan.status}
                    </p>
                  </div>
                  <p className="text-[13.5px] font-bold text-navy font-mono">
                    {formatRupiah(loan.nominal)}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl py-8 text-center shadow-sm">
              <p className="text-xs text-slate">Belum ada aktivitas pinjaman.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="mt-auto sticky bottom-0 bg-white border-t border-sky-line flex justify-around items-center py-3 pb-6">
        <div className="flex flex-col items-center gap-1 w-[70px] text-blue">
          <Home size={21} />
          <span className="text-[10.5px] font-semibold">Beranda</span>
        </div>
        <Link href="/riwayat" className="flex flex-col items-center gap-1 w-[70px] text-slate">
          <History size={21} />
          <span className="text-[10.5px] font-semibold">Riwayat</span>
        </Link>
        <Link href={ajukanHref} className="flex flex-col items-center gap-1 w-[70px] text-slate">
          <Plus size={21} />
          <span className="text-[10.5px] font-semibold">{ajukanLabel}</span>
        </Link>
        <Link href="/profil" className="flex flex-col items-center gap-1 w-[70px] text-slate">
          <User size={21} />
          <span className="text-[10.5px] font-semibold">Profil</span>
        </Link>
      </div>
    </div>
  );
}