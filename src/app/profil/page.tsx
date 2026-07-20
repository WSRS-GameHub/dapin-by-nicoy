import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfilMember from "@/components/member/ProfilMember";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <ProfilMember
      userId={user.id}
      limit={profile?.limit_khusus ?? 0}
      tempoHari={profile?.tempo_khusus_hari ?? 5}
      verifikasiStatus={profile?.verifikasi_status ?? "belum_verifikasi"}
      initial={{
        nama: profile?.nama ?? "",
        no_telpon: profile?.no_telpon ?? "",
        nik: profile?.nik ?? "",
        pekerjaan: profile?.pekerjaan ?? "",
        alamat: profile?.alamat ?? "",
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