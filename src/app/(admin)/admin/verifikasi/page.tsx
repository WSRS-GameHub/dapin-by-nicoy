import { createClient } from "@/lib/supabase/server";
import { tandaiDitinjau, tolakVerifikasi, setujuiVerifikasi } from "../actions";
import { Clock, Eye } from "lucide-react";

export default async function VerifikasiPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase.from("loan_settings").select("*").eq("id", 1).single();
  const { data: pendingMembers } = await supabase
    .from("profiles")
    .select("*")
    .in("verifikasi_status", ["menunggu", "ditinjau"])
    .order("created_at", { ascending: true });

  const { data: tiers } = await supabase
    .from("loan_tiers")
    .select("*")
    .order("nominal_pinjam", { ascending: true });

  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

  const statusCfg: Record<string, { label: string; icon: typeof Clock; className: string }> = {
    menunggu: { label: "Menunggu", icon: Clock, className: "bg-amber/15 text-amber" },
    ditinjau: { label: "Ditinjau", icon: Eye, className: "bg-indigo/15 text-indigo" },
  };

  return (
    <div className="px-5 pb-4">
      <h1 className="font-display font-bold text-lg text-navy mb-1">Verifikasi Anggota</h1>
      <p className="text-sm text-slate mb-5">Cek data lalu setujui atau tolak.</p>

      {(!tiers || tiers.length === 0) && (
        <div className="bg-amber/10 text-amber text-xs font-medium rounded-xl px-4 py-3 mb-4">
          Belum ada tarif pinjaman. Tambahkan dulu di menu <b>Tarif</b> supaya bisa approve member.
        </div>
      )}

      {pendingMembers && pendingMembers.length > 0 ? (
        <div className="flex flex-col gap-3">
          {pendingMembers.map((m) => {
            const cfg = statusCfg[m.verifikasi_status];
            const Icon = cfg.icon;
            return (
              <details key={m.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <summary className="flex items-center gap-3 px-4 py-3.5 cursor-pointer list-none">
                  <div className="w-10 h-10 rounded-xl bg-sky text-blue flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono">
                    {m.nama?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-bold text-navy truncate">{m.nama}</p>
                    <p className="text-[11px] text-slate">{m.id_anggota}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-lg ${cfg.className}`}>
                    <Icon size={11} /> {cfg.label}
                  </span>
                </summary>

                <div className="px-4 pb-4 pt-1 border-t border-sky-line bg-sky/40">
                  <div className="grid grid-cols-1 gap-1.5 text-xs text-slate my-3">
                    <p><b className="text-navy">NIK:</b> {m.nik || "-"}</p>
                    <p><b className="text-navy">Pekerjaan:</b> {m.pekerjaan || "-"}</p>
                    <p><b className="text-navy">Alamat:</b> {m.alamat || "-"}</p>
                    <p><b className="text-navy">Kontak Darurat:</b> {m.kontak_darurat_nama || "-"} ({m.kontak_darurat_hubungan || "-"})</p>
                    <p><b className="text-navy">No. HP Darurat:</b> {m.kontak_darurat_notelp || "-"}</p>
                    <p><b className="text-navy">Bank:</b> {m.nama_bank || "-"}</p>
                    <p><b className="text-navy">No. Rekening:</b> {m.no_rekening} a.n {m.nama_pemilik_rekening}</p>
                  </div>

                  <form action={setujuiVerifikasi} className="flex flex-col gap-2.5 bg-white rounded-xl p-3.5 border border-sky-line">
                    <input type="hidden" name="memberId" value={m.id} />
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-semibold text-slate block mb-1">Limit Disetujui</label>
                        <select
                          name="limit"
                          defaultValue=""
                          disabled={!tiers || tiers.length === 0}
                          required
                          className="w-full border border-sky-line rounded-lg px-2.5 py-2 text-xs font-mono outline-none bg-white disabled:opacity-50"
                        >
                          <option value="" disabled>Pilih limit</option>
                          {tiers?.map((t) => (
                            <option key={t.id} value={t.nominal_pinjam}>
                              {formatRupiah(t.nominal_pinjam)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate block mb-1">Tempo (hari)</label>
                        <input
                          name="tempo"
                          type="number"
                          defaultValue={settings?.tempo_default_hari}
                          required
                          className="w-full border border-sky-line rounded-lg px-2.5 py-2 text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                    <button className="bg-teal text-white text-xs font-bold px-4 py-2.5 rounded-lg">
                      Setujui
                    </button>
                  </form>

                  <div className="flex gap-2 mt-2.5">
                    {m.verifikasi_status === "menunggu" && (
                      <form action={tandaiDitinjau.bind(null, m.id)} className="flex-1">
                        <button className="w-full text-xs font-semibold text-indigo bg-indigo/10 px-3.5 py-2.5 rounded-lg">
                          Sedang Ditinjau
                        </button>
                      </form>
                    )}
                    <form action={tolakVerifikasi.bind(null, m.id)} className="flex-1">
                      <button className="w-full text-xs font-semibold text-red-500 bg-red-50 px-3.5 py-2.5 rounded-lg">
                        Tolak
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate text-center py-14">Tidak ada pengajuan yang menunggu.</p>
      )}
    </div>
  );
}