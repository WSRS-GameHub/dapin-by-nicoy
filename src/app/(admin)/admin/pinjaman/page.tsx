import { createClient } from "@/lib/supabase/server";
import { setujuiPinjaman, tolakPinjaman, tandaiLunas } from "../actions";
import { Clock, Wallet, CheckCircle2, Landmark } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PinjamanPage() {
  const supabase = await createClient();

  const { data: loans } = await supabase
    .from("loans")
    .select("*, profiles!loans_member_id_fkey(nama, nama_bank, no_rekening, nama_pemilik_rekening)")
    .order("created_at", { ascending: false });

  const formatRupiah = (n: number) => "Rp " + (n ?? 0).toLocaleString("id-ID");
  const formatTanggal = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const menunggu = loans?.filter((l) => l.status === "menunggu") ?? [];
  const aktif = loans?.filter((l) => l.status === "disetujui") ?? [];
  const selesai = loans?.filter((l) => l.status === "lunas" || l.status === "ditolak") ?? [];

  return (
    <div className="px-5 pb-4">
      <h1 className="font-display font-bold text-lg text-navy mb-1">Pengajuan Pinjaman</h1>
      <p className="text-sm text-slate mb-5">Setujui, tolak, atau tandai lunas pinjaman member.</p>

      {/* Menunggu persetujuan */}
      <SectionTitle icon={Clock} label={`Menunggu Persetujuan (${menunggu.length})`} color="text-amber" />
      <div className="flex flex-col gap-2.5 mb-6">
        {menunggu.length > 0 ? (
          menunggu.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-bold text-navy">{l.profiles?.nama ?? "-"}</p>
                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-amber/15 text-amber">
                  Menunggu
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate mb-3">
                <span>
                  Pinjam <b className="text-navy font-mono">{formatRupiah(l.nominal)}</b>
                </span>
                <span>
                  Kembali <b className="text-teal font-mono">{formatRupiah(l.jumlah_kembali)}</b>
                </span>
              </div>

              <RekeningInfo profile={l.profiles} />

              <div className="flex gap-2 mt-3">
                <form action={setujuiPinjaman.bind(null, l.id)} className="flex-1">
                  <button className="w-full text-xs font-bold text-white bg-teal px-3.5 py-2.5 rounded-lg">
                    Setujui & Cairkan
                  </button>
                </form>
                <form action={tolakPinjaman.bind(null, l.id)} className="flex-1">
                  <button className="w-full text-xs font-semibold text-red-500 bg-red-50 px-3.5 py-2.5 rounded-lg">
                    Tolak
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate text-center py-6">Tidak ada pengajuan menunggu.</p>
        )}
      </div>

      {/* Aktif / berjalan */}
      <SectionTitle icon={Wallet} label={`Sedang Berjalan (${aktif.length})`} color="text-blue" />
      <div className="flex flex-col gap-2.5 mb-6">
        {aktif.length > 0 ? (
          aktif.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-bold text-navy">{l.profiles?.nama ?? "-"}</p>
                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-blue/15 text-blue">
                  Aktif
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate mb-2">
                <span>
                  Pinjam <b className="text-navy font-mono">{formatRupiah(l.nominal)}</b>
                </span>
                <span>
                  Kembali <b className="text-teal font-mono">{formatRupiah(l.jumlah_kembali)}</b>
                </span>
              </div>
              {l.tanggal_cair && (
                <p className="text-[11px] text-slate mb-3">
                  Cair {formatTanggal(l.tanggal_cair)} · Tempo {l.tempo_hari} hari
                </p>
              )}

              <RekeningInfo profile={l.profiles} />

              <form action={tandaiLunas.bind(null, l.id)} className="mt-3">
                <button className="w-full text-xs font-bold text-white bg-blue px-3.5 py-2.5 rounded-lg">
                  Tandai Lunas
                </button>
              </form>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate text-center py-6">Tidak ada pinjaman aktif.</p>
        )}
      </div>

      {/* Riwayat */}
      <SectionTitle icon={CheckCircle2} label={`Selesai (${selesai.length})`} color="text-teal" />
      <div className="flex flex-col gap-2.5">
        {selesai.length > 0 ? (
          selesai.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-navy">{l.profiles?.nama ?? "-"}</p>
                <p className="text-xs text-slate font-mono mt-1">{formatRupiah(l.nominal)}</p>
              </div>
              <span
                className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg ${
                  l.status === "lunas" ? "bg-teal/15 text-teal" : "bg-red-100 text-red-500"
                }`}
              >
                {l.status === "lunas" ? "Lunas" : "Ditolak"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate text-center py-6">Belum ada riwayat.</p>
        )}
      </div>
    </div>
  );
}

function RekeningInfo({
  profile,
}: {
  profile?: { nama_bank: string | null; no_rekening: string | null; nama_pemilik_rekening: string | null } | null;
}) {
  if (!profile?.no_rekening) {
    return (
      <div className="bg-sky rounded-xl px-3.5 py-2.5 text-[11px] text-slate">
        Rekening belum diisi member.
      </div>
    );
  }

  return (
    <div className="bg-sky rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
      <Landmark size={14} className="text-blue flex-shrink-0" />
      <div className="text-[11px] text-navy leading-snug">
        <b>{profile.nama_bank}</b> · {profile.no_rekening}
        <br />
        a.n {profile.nama_pemilik_rekening}
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon, label, color,
}: { icon: typeof Clock; label: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 mb-3 ${color}`}>
      <Icon size={15} />
      <p className="text-sm font-bold">{label}</p>
    </div>
  );
}