import { createClient } from "@/lib/supabase/server";
import { tambahTarif, hapusTarif } from "../actions";
import { Trash2, ArrowRight } from "lucide-react";

export default async function TarifPage() {
  const supabase = await createClient();
  const { data: tiers } = await supabase
    .from("loan_tiers")
    .select("*")
    .order("nominal_pinjam", { ascending: true });

  const formatRupiah = (n: number) => "Rp " + (n ?? 0).toLocaleString("id-ID");

  return (
    <div className="px-5 pb-4">
      <h1 className="font-display font-bold text-lg text-navy mb-1">Tarif Pinjaman</h1>
      <p className="text-sm text-slate mb-5">
        Daftar nominal pinjam & jumlah kembali yang bisa dipilih member (nominal pinjam kelipatan Rp50.000).
      </p>

      <form action={tambahTarif} className="bg-white rounded-2xl shadow-sm p-4 flex items-end gap-2.5 mb-5">
        <div className="flex-1">
          <label className="text-[10px] font-semibold text-slate block mb-1">Nominal Pinjam</label>
          <input
            name="nominal_pinjam"
            type="number"
            step="50000"
            min="50000"
            required
            placeholder="50000"
            className="w-full border border-sky-line rounded-lg px-2.5 py-2 text-xs font-mono outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-semibold text-slate block mb-1">Nominal Kembali</label>
          <input
            name="nominal_kembali"
            type="number"
            min="1"
            required
            placeholder="55000"
            className="w-full border border-sky-line rounded-lg px-2.5 py-2 text-xs font-mono outline-none"
          />
        </div>
        <button className="bg-blue text-white text-xs font-bold px-4 py-2.5 rounded-lg">
          Tambah
        </button>
      </form>

      {tiers && tiers.length > 0 ? (
        <div className="flex flex-col gap-2">
          {tiers.map((t) => (
            <div key={t.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-mono font-semibold text-navy">
                {formatRupiah(t.nominal_pinjam)}
                <ArrowRight size={13} className="text-slate" />
                <span className="text-teal">{formatRupiah(t.nominal_kembali)}</span>
              </div>
              <form action={hapusTarif.bind(null, t.id)}>
                <button className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <Trash2 size={14} />
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate text-center py-10">
          Belum ada tarif. Tambahkan minimal 1 baris supaya member bisa mengajukan pinjaman.
        </p>
      )}
    </div>
  );
}