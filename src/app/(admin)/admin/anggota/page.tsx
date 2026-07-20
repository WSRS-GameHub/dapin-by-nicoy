import { createClient } from "@/lib/supabase/server";
import AnggotaList from "@/components/admin/AnggotaList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnggotaPage() {
  const supabase = await createClient();

  const { data: verifiedMembers } = await supabase
    .from("profiles")
    .select("id, nama, limit_khusus, tempo_khusus_hari")
    .eq("verifikasi_status", "selesai")
    .eq("is_admin", false)
    .order("nama", { ascending: true });

  const { data: tiers } = await supabase
    .from("loan_tiers")
    .select("*")
    .order("nominal_pinjam", { ascending: true });

  return (
    <div className="px-5 pb-4">
      <h1 className="font-display font-bold text-lg text-navy mb-1">Anggota Terverifikasi</h1>
      <p className="text-sm text-slate mb-5">Atur limit & tempo pinjaman per anggota kapan saja.</p>

      {(!tiers || tiers.length === 0) && (
        <div className="bg-amber/10 text-amber text-xs font-medium rounded-xl px-4 py-3 mb-4">
          Belum ada tarif pinjaman. Tambahkan dulu di menu <b>Tarif</b> supaya bisa pilih limit di sini.
        </div>
      )}

      <AnggotaList members={verifiedMembers ?? []} tiers={tiers ?? []} />
    </div>
  );
}