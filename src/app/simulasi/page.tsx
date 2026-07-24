import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calculator, Info } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SimulasiPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("verifikasi_status, limit_khusus, tempo_khusus_hari")
    .eq("id", user.id)
    .single();

  const { data: tiers } = await supabase
    .from("loan_tiers")
    .select("*")
    .order("nominal_pinjam", { ascending: true });

  const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
  const sudahTerverifikasi = profile?.verifikasi_status === "selesai";
  const limit = profile?.limit_khusus ?? null;
  const tempoHari = profile?.tempo_khusus_hari ?? null;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F3F6FE] px-5 pt-6 pb-10">
      <button
        className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6"
        style={{ display: "inline-flex" }}
      >
        <Link href="/dashboard" className="flex items-center justify-center w-full h-full">
          <ArrowLeft size={18} className="text-navy" />
        </Link>
      </button>

      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-9 h-9 rounded-xl bg-teal/10 text-teal flex items-center justify-center">
          <Calculator size={17} />
        </div>
        <h1 className="font-display font-bold text-xl text-navy">Simulasi Pinjaman</h1>
      </div>
      <p className="text-sm text-slate mt-1 mb-5">
        Lihat semua pilihan nominal pinjam dan jumlah yang harus dikembalikan.
      </p>

      {sudahTerverifikasi && limit !== null && (
        <div className="bg-navy rounded-2xl p-4 mb-5 flex justify-between text-white">
          <div>
            <p className="text-[10px] text-[#A9B8DE] font-semibold">Limit Kamu</p>
            <p className="text-sm font-bold font-mono mt-1">{formatRupiah(limit)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#A9B8DE] font-semibold">Tempo</p>
            <p className="text-sm font-bold font-mono mt-1">{tempoHari ?? "-"} hari</p>
          </div>
        </div>
      )}

      {!sudahTerverifikasi && (
        <div className="flex items-start gap-2.5 bg-sky rounded-xl px-4 py-3.5 mb-5 text-[11.5px] text-slate leading-relaxed">
          <Info size={15} className="text-blue flex-shrink-0 mt-0.5" />
          Ini simulasi seluruh tarif yang tersedia. Setelah verifikasi keanggotaan, kamu cuma bisa
          pinjam sampai batas limit yang disetujui admin.
        </div>
      )}

      <div className="flex flex-col gap-2.5 mb-6">
        {tiers && tiers.length > 0 ? (
          tiers.map((t) => {
            const bisaDipilih = sudahTerverifikasi && limit !== null && t.nominal_pinjam <= limit;
            return (
              <div
                key={t.id}
                className={`rounded-2xl px-4 py-3.5 border-2 ${
                  bisaDipilih ? "border-teal/30 bg-teal/5" : "border-sky-line bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-navy font-mono">{formatRupiah(t.nominal_pinjam)}</p>
                    <p className="text-[11px] text-slate mt-0.5">
                      Kembali <b className="text-teal">{formatRupiah(t.nominal_kembali)}</b>
                    </p>
                  </div>
                  {bisaDipilih && (
                    <span className="text-[9.5px] font-bold text-teal bg-teal/10 px-2 py-1 rounded-lg">
                      Bisa Dipilih
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate text-center py-10 bg-white rounded-2xl shadow-sm">
            Belum ada tarif yang tersedia. Hubungi admin.
          </p>
        )}
      </div>

      {sudahTerverifikasi ? (
        <Link
          href="/pinjam"
          className="flex items-center justify-center gap-2 bg-blue text-white text-sm font-semibold rounded-xl py-3.5"
        >
          Ajukan Pinjaman
          <ArrowRight size={15} />
        </Link>
      ) : (
        <Link
          href="/ajukan"
          className="flex items-center justify-center gap-2 bg-blue text-white text-sm font-semibold rounded-xl py-3.5"
        >
          Mulai Verifikasi Dulu
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}