import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfilPengaturan from "@/components/admin/profilPengaturan";
import RekeningPembayaran from "@/components/admin/RekeningPembayaran";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PengaturanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: settings } = await supabase.from("loan_settings").select("*").eq("id", 1).single();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: rekeningList } = await supabase
    .from("rekening_admin")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="px-5 pb-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-lg text-navy mb-1">Pengaturan</h1>
        <p className="text-sm text-slate">Profil, kontak, dan rekening pembayaran kamu.</p>
      </div>

      <ProfilPengaturan
        userId={user.id}
        initial={{
          nama: profile?.nama ?? "",
          no_telpon: profile?.no_telpon ?? "",
          admin_whatsapp: settings?.admin_whatsapp ?? "",
        }}
      />

      <RekeningPembayaran initial={rekeningList ?? []} />
    </div>
  );
}