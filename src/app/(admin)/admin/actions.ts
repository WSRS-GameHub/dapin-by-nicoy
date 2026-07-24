"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function bulatkanKe50Ribu(n: number) {
  if (!n || isNaN(n)) return 0;
  return Math.round(n / 50000) * 50000;
}

// ===== Verifikasi Anggota =====

export async function tandaiDitinjau(memberId: string) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ verifikasi_status: "ditinjau" }).eq("id", memberId);
  revalidatePath("/admin");
  revalidatePath("/admin/verifikasi");
}

export async function tolakVerifikasi(memberId: string) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ verifikasi_status: "belum_verifikasi" }).eq("id", memberId);
  revalidatePath("/admin");
  revalidatePath("/admin/verifikasi");
}

export async function setujuiVerifikasi(formData: FormData) {
  const memberId = formData.get("memberId") as string;
  const limit = Number(formData.get("limit"));
  const tempo = Number(formData.get("tempo"));

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ verifikasi_status: "selesai", limit_khusus: limit, tempo_khusus_hari: tempo })
    .eq("id", memberId);

  revalidatePath("/admin");
  revalidatePath("/admin/verifikasi");
  revalidatePath("/admin/anggota");
}

// ===== Pengajuan Pinjaman =====

export async function setujuiPinjaman(loanId: string) {
  const supabase = await createClient();
  await supabase
    .from("loans")
    .update({ status: "disetujui", tanggal_cair: new Date().toISOString() })
    .eq("id", loanId);

  revalidatePath("/admin");
  revalidatePath("/admin/pinjaman");
}

export async function tolakPinjaman(loanId: string) {
  const supabase = await createClient();
  await supabase.from("loans").update({ status: "ditolak" }).eq("id", loanId);

  revalidatePath("/admin");
  revalidatePath("/admin/pinjaman");
}

export async function tandaiLunas(loanId: string) {
  const supabase = await createClient();
  await supabase.from("loans").update({ status: "lunas" }).eq("id", loanId);

  revalidatePath("/admin");
  revalidatePath("/admin/pinjaman");
}

export async function tolakBuktiTransfer(formData: FormData) {
  const loanId = formData.get("loanId") as string;
  const alasan = formData.get("alasan") as string;

  const supabase = await createClient();
  await supabase
    .from("loans")
    .update({
      bukti_transfer_url: null,
      bukti_transfer_at: null,
      bukti_ditolak_at: new Date().toISOString(),
      bukti_ditolak_alasan: alasan || null,
    })
    .eq("id", loanId);

  revalidatePath("/admin/pinjaman");
  revalidatePath("/dashboard");
  revalidatePath("/riwayat");
}

// ===== Tarif Pinjaman =====

export async function tambahTarif(formData: FormData) {
  const nominal_pinjam = bulatkanKe50Ribu(Number(formData.get("nominal_pinjam")));
  const nominal_kembali = Number(formData.get("nominal_kembali"));

  const supabase = await createClient();
  await supabase.from("loan_tiers").insert({ nominal_pinjam, nominal_kembali });

  revalidatePath("/admin/tarif");
  revalidatePath("/admin/anggota");
  revalidatePath("/admin/verifikasi");
}

export async function hapusTarif(tierId: string) {
  const supabase = await createClient();
  await supabase.from("loan_tiers").delete().eq("id", tierId);
  revalidatePath("/admin/tarif");
  revalidatePath("/admin/anggota");
  revalidatePath("/admin/verifikasi");
}

// ===== Pengaturan =====

export async function updateAdminWhatsapp(formData: FormData) {
  const admin_whatsapp = formData.get("admin_whatsapp") as string;

  const supabase = await createClient();
  await supabase.from("loan_settings").update({ admin_whatsapp }).eq("id", 1);

  revalidatePath("/admin/pengaturan");
}

export async function tambahRekening(formData: FormData) {
  const nama_bank = formData.get("nama_bank") as string;
  const no_rekening = formData.get("no_rekening") as string;
  const nama_pemilik = formData.get("nama_pemilik") as string;

  const supabase = await createClient();
  await supabase.from("rekening_admin").insert({ nama_bank, no_rekening, nama_pemilik });

  revalidatePath("/admin/pengaturan");
  revalidatePath("/riwayat");
}

export async function hapusRekening(rekeningId: string) {
  const supabase = await createClient();
  await supabase.from("rekening_admin").delete().eq("id", rekeningId);

  revalidatePath("/admin/pengaturan");
  revalidatePath("/riwayat");
}

export async function updateRekeningPembayaran(formData: FormData) {
  const rekening_bank = formData.get("rekening_bank") as string;
  const rekening_nomor = formData.get("rekening_nomor") as string;
  const rekening_atas_nama = formData.get("rekening_atas_nama") as string;

  const supabase = await createClient();
  await supabase
    .from("loan_settings")
    .update({ rekening_bank, rekening_nomor, rekening_atas_nama })
    .eq("id", 1);

  revalidatePath("/admin/pengaturan");
}

export async function updateProfilAdmin(formData: FormData) {
  const nama = formData.get("nama") as string;
  const no_telpon = formData.get("no_telpon") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("profiles").update({ nama, no_telpon }).eq("id", user.id);

  revalidatePath("/admin/pengaturan");
}

export async function updateDendaPerHari(formData: FormData) {
  const denda_per_hari = Number(formData.get("denda_per_hari"));

  const supabase = await createClient();
  await supabase.from("loan_settings").update({ denda_per_hari }).eq("id", 1);

  revalidatePath("/admin/pengaturan");
}