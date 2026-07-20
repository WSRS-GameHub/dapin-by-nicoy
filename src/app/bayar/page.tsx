import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BayarForm from "@/components/member/BayarForm";

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

  const { data: rekeningList } = await supabase
    .from("rekening_admin")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <BayarForm
      loanId={loan.id}
      userId={user.id}
      jumlahKembali={loan.jumlah_kembali}
      rekeningList={rekeningList ?? []}
      buktiSudahAda={!!loan.bukti_transfer_url}
    />
  );
}