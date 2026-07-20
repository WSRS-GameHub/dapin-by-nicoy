import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Wallet, ArrowRight, Clock, Eye, Landmark, Phone,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type StatusBadge = {
  label: string;
  icon: typeof Clock;
  className: string;
};

type PendingVerif = {
  id: string;
  nama: string;
  verifikasi_status: string;
  created_at: string;
};

type PendingLoan = {
  id: string;
  nominal: number;
  created_at: string;
  profiles: { nama: string } | null;
};

type Item = {
  id: string;
  nama: string;
  tanggal: string;
  href: string;
  badge: StatusBadge;
  subtitle: string;
};

export default async function AdminBeranda() {
  const supabase = await createClient();

  const { data: settings } = await supabase.from("loan_settings").select("*").eq("id", 1).single();

  const { data: pendingVerifRaw } = await supabase
    .from("profiles")
    .select("id, nama, verifikasi_status, created_at")
    .in("verifikasi_status", ["menunggu", "ditinjau"])
    .order("created_at", { ascending: true });

  const { data: pendingLoansRaw } = await supabase
    .from("loans")
    .select("id, nominal, created_at, profiles!loans_member_id_fkey(nama)")
    .eq("status", "menunggu")
    .order("created_at", { ascending: true });

  const { data: activeLoansCount } = await supabase
    .from("loans")
    .select("id", { count: "exact", head: false })
    .eq("status", "disetujui");

  const { data: verifiedCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: false })
    .eq("verifikasi_status", "selesai")
    .eq("is_admin", false);

  const pendingVerif = (pendingVerifRaw ?? []) as PendingVerif[];
  const pendingLoans = (pendingLoansRaw ?? []) as unknown as PendingLoan[];

  const formatRupiah = (n: number) => "Rp " + (n ?? 0).toLocaleString("id-ID");

  const statusCfg: Record<string, StatusBadge> = {
    menunggu: { label: "Menunggu", icon: Clock, className: "bg-amber/15 text-amber" },
    ditinjau: { label: "Ditinjau", icon: Eye, className: "bg-indigo/15 text-indigo" },
  };

  const items: Item[] = [
    ...pendingVerif.map((v) => ({
      id: "verif-" + v.id,
      nama: v.nama,
      tanggal: v.created_at,
      href: "/admin/verifikasi",
      badge: statusCfg[v.verifikasi_status] ?? statusCfg.menunggu,
      subtitle: "Verifikasi keanggotaan",
    })),
    ...pendingLoans.map((l) => ({
      id: "loan-" + l.id,
      nama: l.profiles?.nama ?? "-",
      tanggal: l.created_at,
      href: "/admin/pinjaman",
      badge: { label: "Menunggu", icon: Wallet, className: "bg-blue/15 text-blue" },
      subtitle: `Pinjaman ${formatRupiah(l.nominal)}`,
    })),
  ].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  return (
    <div className="px-5 pb-4 flex flex-col gap-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-navy to-blue-dark rounded-2xl p-4 text-white">
          <p className="text-[11px] text-[#A9B8DE] font-semibold">Verifikasi Menunggu</p>
          <p className="font-display font-bold text-2xl mt-2">{pendingVerif.length}</p>
        </div>
        <div className="bg-gradient-to-br from-navy to-blue-dark rounded-2xl p-4 text-white">
          <p className="text-[11px] text-[#A9B8DE] font-semibold">Pinjaman Menunggu</p>
          <p className="font-display font-bold text-2xl mt-2">{pendingLoans.length}</p>
        </div>
        <div className="bg-white border border-sky-line rounded-2xl p-4">
          <p className="text-[11px] text-slate font-semibold">Anggota Aktif</p>
          <p className="font-display font-bold text-2xl text-blue mt-2">{verifiedCount?.length ?? 0}</p>
        </div>
        <div className="bg-white border border-sky-line rounded-2xl p-4">
          <p className="text-[11px] text-slate font-semibold">Pinjaman Berjalan</p>
          <p className="font-display font-bold text-2xl text-teal mt-2">{activeLoansCount?.length ?? 0}</p>
        </div>
      </div>

      {/* Kontak & rekening ringkas */}
      <div className="bg-white border border-sky-line rounded-2xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky text-blue flex items-center justify-center flex-shrink-0">
            <Phone size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate font-semibold">WA Admin</p>
            <p className="text-xs font-mono font-semibold text-navy truncate">
              {settings?.admin_whatsapp || "Belum diisi"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky text-blue flex items-center justify-center flex-shrink-0">
            <Landmark size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate font-semibold">Rekening Pembayaran</p>
            <Link href="/admin/pengaturan" className="text-xs font-semibold text-blue truncate hover:underline">
              Kelola rekening →
            </Link>
          </div>
        </div>
      </div>

      {/* Perlu tindakan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[15px] text-navy">Perlu Tindakan</h3>
          {items.length > 0 && (
            <span className="text-[11px] font-bold text-white bg-red-500 rounded-full px-2 py-0.5">
              {items.length}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2.5">
          {items.length > 0 ? (
            items.slice(0, 5).map((item) => {
              const Icon = item.badge.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky text-blue flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono">
                    {item.nama?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-bold text-navy truncate">{item.nama}</p>
                    <p className="text-[11px] text-slate mt-0.5 truncate">{item.subtitle}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ${item.badge.className}`}>
                    <Icon size={11} /> {item.badge.label}
                  </span>
                </Link>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl py-8 text-center shadow-sm">
              <p className="text-xs text-slate">Semua sudah beres, gak ada yang perlu ditindak.</p>
            </div>
          )}
          {items.length > 5 && (
            <Link
              href="/admin/verifikasi"
              className="text-center text-xs font-semibold text-blue py-2 flex items-center justify-center gap-1"
            >
              Lihat semua <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}