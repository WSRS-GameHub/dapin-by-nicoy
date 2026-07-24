import { createClient } from "@/lib/supabase/server";
import { setujuiPinjaman, tolakPinjaman, tandaiLunas, tolakBuktiTransfer } from "../actions";
import { Clock, Wallet, CheckCircle2, XCircle, Landmark, ShieldCheck, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { hitungDenda } from "@/lib/HitungDenda";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PinjamanPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("loan_settings")
    .select("denda_per_hari")
    .eq("id", 1)
    .single();

  const { data: loans } = await supabase
    .from("loans")
    .select("*, profiles!loans_member_id_fkey(nama, verifikasi_status, nama_bank, no_rekening, nama_pemilik_rekening)")
    .order("created_at", { ascending: false });

  const dendaPerHari = settings?.denda_per_hari ?? 0;

  const formatRupiah = (n: number) => "Rp " + (n ?? 0).toLocaleString("id-ID");
  const formatTanggalJam = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }) +
    ", " +
    new Date(d).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }) +
    " WIB";

  const menunggu = loans?.filter((l) => l.status === "menunggu") ?? [];
  const aktif = loans?.filter((l) => l.status === "disetujui") ?? [];
  const selesai = loans?.filter((l) => l.status === "lunas" || l.status === "ditolak") ?? [];

  return (
    <div className="px-5 pb-4">
      <h1 className="font-display font-bold text-lg text-navy mb-1">Pengajuan Pinjaman</h1>
      <p className="text-sm text-slate mb-5">Setujui, tolak, atau tandai lunas pinjaman member.</p>

      <SectionTitle icon={Clock} label={"Menunggu Persetujuan (" + menunggu.length + ")"} color="text-amber" />
      <div className="flex flex-col gap-2.5 mb-6">
        {menunggu.length > 0 ? (
          menunggu.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-navy">{l.profiles?.nama ?? "-"}</p>
                  {l.profiles?.verifikasi_status === "selesai" && <VerifiedBadge />}
                </div>
                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-amber/15 text-amber flex-shrink-0">
                  Menunggu
                </span>
              </div>
              <p className="text-[11px] text-slate mb-2">Diajukan {formatTanggalJam(l.created_at)}</p>
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
                    Setujui &amp; Cairkan
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

      <SectionTitle icon={Wallet} label={"Sedang Berjalan (" + aktif.length + ")"} color="text-blue" />
      <div className="flex flex-col gap-2.5 mb-6">
        {aktif.length > 0 ? (
          aktif.map((l) => {
            let jatuhTempo: Date | null = null;
            let hariTelat = 0;
            let totalDenda = 0;

            if (l.tanggal_cair && l.tempo_hari) {
              const denda = hitungDenda(l.tanggal_cair, l.tempo_hari, dendaPerHari);
              jatuhTempo = denda.jatuhTempo;
              hariTelat = denda.hariTelat;
              totalDenda = denda.totalDenda;
            }

            return (
              <div key={l.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-navy">{l.profiles?.nama ?? "-"}</p>
                    {l.profiles?.verifikasi_status === "selesai" && <VerifiedBadge />}
                  </div>
                  <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-blue/15 text-blue flex-shrink-0">
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
                  <div className="flex flex-col gap-1 text-[11px] text-slate mb-3 bg-sky/60 rounded-lg px-3 py-2.5">
                    <div className="flex justify-between">
                      <span>Mulai</span>
                      <b className="text-navy">{formatTanggalJam(l.tanggal_cair)}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Jatuh tempo</span>
                      <b className="text-amber">{jatuhTempo ? formatTanggalJam(jatuhTempo.toISOString()) : "-"}</b>
                    </div>
                  </div>
                )}

                {hariTelat > 0 && (
                  <div className="flex items-start gap-2 bg-red-50 text-red-600 rounded-lg px-3 py-2.5 mb-3 text-[11px] font-semibold leading-relaxed">
                    <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                    Telat {hariTelat} hari, denda {formatRupiah(totalDenda)} — total tagihan {formatRupiah(l.jumlah_kembali + totalDenda)}
                  </div>
                )}

                {l.bukti_transfer_url ? (
                  <div className="mb-3">
                    
                      <a href={l.bukti_transfer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-teal/10 rounded-xl px-3.5 py-2.5 mb-2"
                    >
                      <img
                        src={l.bukti_transfer_url}
                        alt="Bukti transfer"
                        className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="text-[11px] text-teal">
                        <p className="font-bold">Bukti transfer diterima</p>
                        <p>{l.bukti_transfer_at ? formatTanggalJam(l.bukti_transfer_at) : ""} · Ketuk buat lihat</p>
                      </div>
                    </a>

                    <form action={tolakBuktiTransfer} className="flex flex-col gap-2">
                      <input type="hidden" name="loanId" value={l.id} />
                      <input
                        name="alasan"
                        placeholder="Alasan tolak (opsional, misal: foto buram / nominal beda)"
                        className="w-full border border-sky-line rounded-lg px-3 py-2 text-xs outline-none"
                      />
                      <button className="w-full text-xs font-semibold text-red-500 bg-red-50 px-3.5 py-2 rounded-lg">
                        Tolak Bukti Ini
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-sky rounded-xl px-3.5 py-2.5 mb-3 text-[11px] text-slate">
                    <ImageIcon size={14} className="text-slate flex-shrink-0" />
                    {l.bukti_ditolak_at
                      ? "Bukti sebelumnya ditolak, menunggu member upload ulang."
                      : "Member belum kirim bukti transfer."}
                  </div>
                )}

                <RekeningInfo profile={l.profiles} />

                <form action={tandaiLunas.bind(null, l.id)} className="mt-3">
                  <button className="w-full text-xs font-bold text-white bg-blue px-3.5 py-2.5 rounded-lg">
                    Tandai Lunas
                  </button>
                </form>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate text-center py-6">Tidak ada pinjaman aktif.</p>
        )}
      </div>

      <SectionTitle icon={CheckCircle2} label={"Selesai (" + selesai.length + ")"} color="text-teal" />
      <div className="flex flex-col gap-2.5">
        {selesai.length > 0 ? (
          selesai.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-navy">{l.profiles?.nama ?? "-"}</p>
                  {l.profiles?.verifikasi_status === "selesai" && <VerifiedBadge />}
                </div>
                <span
                  className={
                    l.status === "lunas"
                      ? "text-[10.5px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 bg-teal/15 text-teal"
                      : "text-[10.5px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 bg-red-100 text-red-500"
                  }
                >
                  {l.status === "lunas" ? "Lunas" : "Ditolak"}
                </span>
              </div>
              <p className="text-xs text-slate font-mono mt-1">{formatRupiah(l.nominal)}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate text-center py-6">Belum ada riwayat.</p>
        )}
      </div>
    </div>
  );
}

function SectionTitle(props: { icon: typeof Clock; label: string; color: string }) {
  const Icon = props.icon;
  return (
    <div className={"flex items-center gap-2 mb-3 " + props.color}>
      <Icon size={15} />
      <p className="text-sm font-bold">{props.label}</p>
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span className="flex items-center gap-0.5 text-[9px] font-bold text-teal bg-teal/10 px-1.5 py-0.5 rounded">
      <ShieldCheck size={9} /> Terverifikasi
    </span>
  );
}

function RekeningInfo(props: {
  profile?: { nama_bank: string | null; no_rekening: string | null; nama_pemilik_rekening: string | null } | null;
}) {
  const profile = props.profile;

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