import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfilPengaturan from "@/components/admin/profilPengaturan";

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

  return (
    <div className="px-5 pb-6">
      <div className="mb-5">
        <h1 className="font-display font-bold text-lg text-navy mb-1">Pengaturan</h1>
        <p className="text-sm text-slate">Profil, kontak, dan rekening pembayaran kamu.</p>
      </div>

      <ProfilPengaturan
        userId={user.id}
        idAnggota={profile?.id_anggota ?? "-"}
        initial={{
          nama: profile?.nama ?? "",
          no_telpon: profile?.no_telpon ?? "",
          admin_whatsapp: settings?.admin_whatsapp ?? "",
          rekening_bank: settings?.rekening_bank ?? "",
          rekening_nomor: settings?.rekening_nomor ?? "",
          rekening_atas_nama: settings?.rekening_atas_nama ?? "",
        }}
      />
    </div>
  );
}