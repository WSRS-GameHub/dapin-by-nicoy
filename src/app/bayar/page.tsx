import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BayarForm from "@/components/member/BayarForm";
import { hitungDenda } from "@/lib/HitungDenda";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BayarPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: loan } = await supabase
    .from("loans")
    .select("*")
    .eq("member_id", user.id)
    .eq("status", "disetujui")
    .order("tanggal_cair", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!loan) redirect("/riwayat");

  const { data: settings } = await supabase
    .from("loan_settings")
    .select("denda_per_hari")
    .eq("id", 1)
    .single();

  const { data: rekeningList } = await supabase
    .from("rekening_admin")
    .select("*")
    .order("created_at", { ascending: true });

  let hariTelat = 0;
  let totalDenda = 0;

  if (loan.tanggal_cair && loan.tempo_hari) {
    const denda = hitungDenda(loan.tanggal_cair, loan.tempo_hari, settings?.denda_per_hari ?? 0);
    hariTelat = denda.hariTelat;
    totalDenda = denda.totalDenda;
  }

  return (
    <BayarForm
      loanId={loan.id}
      userId={user.id}
      jumlahKembali={loan.jumlah_kembali}
      hariTelat={hariTelat}
      totalDenda={totalDenda}
      rekeningList={rekeningList ?? []}
      buktiSudahAda={!!loan.bukti_transfer_url}
      buktiDitolakAlasan={loan.bukti_ditolak_at && !loan.bukti_transfer_url ? loan.bukti_ditolak_alasan : null}
    />
  );
}