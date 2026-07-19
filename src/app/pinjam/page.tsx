import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PinjamForm from "@/components/member/PinjamForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PinjamPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (profile?.verifikasi_status !== "selesai") redirect("/ajukan");

  const { data: settings } = await supabase.from("loan_settings").select("*").eq("id", 1).single();

  const limit = profile?.limit_khusus ?? 0;
  const tempoHari = profile?.tempo_khusus_hari ?? 5;

  const { data: tiers } = await supabase
    .from("loan_tiers")
    .select("*")
    .lte("nominal_pinjam", limit)
    .order("nominal_pinjam", { ascending: true });

  const { data: pengajuanAktif } = await supabase
    .from("loans")
    .select("id")
    .eq("member_id", user.id)
    .in("status", ["menunggu", "disetujui"])
    .limit(1)
    .maybeSingle();

  return (
    <PinjamForm
      userId={user.id}
      nama={profile?.nama ?? "Anggota"}
      idAnggota={profile?.id_anggota ?? "-"}
      tempoHari={tempoHari}
      adminWhatsapp={settings?.admin_whatsapp ?? "6281234567890"}
      tiers={tiers ?? []}
      sudahAdaPengajuan={!!pengajuanAktif}
    />
  );
}