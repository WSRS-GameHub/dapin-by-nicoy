import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfilPengaturan from "@/components/admin/profilPengaturan";
import RekeningPembayaran from "@/components/admin/RekeningPembayaran";
import SignOutButton from "@/components/admin/SignOutButtonFull";
import { updateDendaPerHari } from "../actions";

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

      {/* Denda Keterlambatan */}
      <div>
        <p className="text-xs font-bold text-slate uppercase tracking-wide mb-2 px-1">
          Denda Keterlambatan
        </p>
        <p className="text-xs text-slate px-1 mb-3">
          Dikenakan otomatis per hari kalau member telat bayar dari jatuh tempo.
        </p>
        <form action={updateDendaPerHari} className="bg-white rounded-2xl shadow-sm p-4 flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate block mb-1.5">Denda per Hari Telat</label>
            <div className="flex items-center gap-2 border border-sky-line rounded-xl px-4 py-3 bg-sky">
              <span className="text-xs text-slate">Rp</span>
              <input
                name="denda_per_hari"
                type="number"
                defaultValue={settings?.denda_per_hari ?? 0}
                required
                className="w-full outline-none text-sm font-mono bg-transparent"
              />
            </div>
          </div>
          <button className="bg-blue text-white text-sm font-semibold rounded-xl py-3 px-5">
            Simpan
          </button>
        </form>
      </div>

      <RekeningPembayaran initial={rekeningList ?? []} />

      <div className="border-t border-sky-line pt-5">
        <SignOutButton />
      </div>
    </div>
  );
}