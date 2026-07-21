import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AjukanForm from "@/components/member/AjukanForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AjukanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: settings } = await supabase
    .from("loan_settings")
    .select("admin_whatsapp")
    .eq("id", 1)
    .single();

  return (
    <AjukanForm
      userId={user.id}
      nama={profile?.nama ?? "Anggota"}
      status={profile?.verifikasi_status ?? "belum_verifikasi"}
      adminWhatsapp={settings?.admin_whatsapp ?? ""}
      initialData={{
        alamat: profile?.alamat ?? "",
        nik: profile?.nik ?? "",
        pekerjaan: profile?.pekerjaan ?? "",
        kontak_darurat_nama: profile?.kontak_darurat_nama ?? "",
        kontak_darurat_notelp: profile?.kontak_darurat_notelp ?? "",
        kontak_darurat_hubungan: profile?.kontak_darurat_hubungan ?? "",
        nama_bank: profile?.nama_bank ?? "",
        no_rekening: profile?.no_rekening ?? "",
        nama_pemilik_rekening: profile?.nama_pemilik_rekening ?? "",
      }}
    />
  );
}