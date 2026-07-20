"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Check, Trash2 } from "lucide-react";
import BankLogo from "@/components/ui/BankLogo";
import Toast from "@/components/ui/Toast";

type Rekening = {
  id: string;
  nama_bank: string;
  no_rekening: string;
  nama_pemilik: string;
};

const BANKS = ["BCA", "Mandiri", "BRI", "SeaBank"];

export default function RekeningPembayaran({ initial }: { initial: Rekening[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [list, setList] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [bankTerpilih, setBankTerpilih] = useState("");
  const [bankLain, setBankLain] = useState("");
  const [noRekening, setNoRekening] = useState("");
  const [namaPemilik, setNamaPemilik] = useState("");

  const namaBankFinal = bankTerpilih === "lainnya" ? bankLain : bankTerpilih;

  const bankTerurut = useMemo(() => {
    const sudahDipakai = new Set(list.map((r) => r.nama_bank));
    return [...BANKS].sort((a, b) => {
      const aDipakai = sudahDipakai.has(a) ? 1 : 0;
      const bDipakai = sudahDipakai.has(b) ? 1 : 0;
      return aDipakai - bDipakai;
    });
  }, [list]);

  function resetForm() {
    setBankTerpilih("");
    setBankLain("");
    setNoRekening("");
    setNamaPemilik("");
    setShowForm(false);
  }

  async function handleTambah() {
    setToast(null);

    if (!namaBankFinal.trim() || !noRekening.trim() || !namaPemilik.trim()) {
      setToast({ type: "error", message: "Semua field wajib diisi." });
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("rekening_admin")
      .insert({ nama_bank: namaBankFinal, no_rekening: noRekening, nama_pemilik: namaPemilik })
      .select()
      .single();

    setSaving(false);

    if (error || !data) {
      setToast({ type: "error", message: "Gagal menambah rekening. Coba lagi." });
      return;
    }

    setList((l) => [...l, data]);
    setToast({ type: "success", message: "Rekening ditambahkan." });
    resetForm();
    router.refresh();
  }

  async function handleHapus(id: string) {
    setDeletingId(id);
    const { error } = await supabase.from("rekening_admin").delete().eq("id", id);
    setDeletingId(null);

    if (error) {
      setToast({ type: "error", message: "Gagal menghapus rekening." });
      return;
    }

    setList((l) => l.filter((r) => r.id !== id));
    router.refresh();
  }

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs font-bold text-slate uppercase tracking-wide">Rekening Pembayaran</p>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-xs font-bold text-blue"
          >
            <Plus size={13} /> Tambah
          </button>
        )}
      </div>
      <p className="text-xs text-slate px-1 mb-3">
        Semua rekening ini muncul sebagai pilihan buat member saat mau bayar pinjaman.
      </p>

      <div className="flex flex-col gap-2.5">
        {/* Form tambah SEKARANG DI ATAS */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3.5">
            <div>
              <p className="text-xs font-semibold text-slate mb-2">Pilih Bank</p>
              <div className="grid grid-cols-4 gap-2">
                {bankTerurut.map((b) => {
                  const active = bankTerpilih === b;
                  const sudahAda = list.some((r) => r.nama_bank === b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBankTerpilih(b)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl py-2.5 border-2 relative ${
                        active ? "border-blue bg-blue/5" : "border-sky-line bg-white"
                      } ${sudahAda ? "opacity-50" : ""}`}
                    >
                      <BankLogo namaBank={b} size={28} />
                      <span className="text-[9px] font-semibold text-navy">{b}</span>
                      {sudahAda && (
                        <span className="absolute -top-1.5 -right-1.5 text-[7px] font-bold bg-slate text-white rounded-full px-1.5 py-0.5">
                          Ada
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setBankTerpilih("lainnya")}
                className={`w-full mt-2 text-xs font-semibold rounded-xl py-2.5 border-2 ${
                  bankTerpilih === "lainnya" ? "border-blue bg-blue/5 text-blue" : "border-sky-line text-slate"
                }`}
              >
                Bank Lainnya
              </button>
              {bankTerpilih === "lainnya" && (
                <input
                  value={bankLain}
                  onChange={(e) => setBankLain(e.target.value)}
                  placeholder="Nama bank"
                  className="w-full mt-2 border border-sky-line rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate block mb-1.5">Nomor Rekening</label>
              <input
                value={noRekening}
                onChange={(e) => setNoRekening(e.target.value)}
                placeholder="Nomor rekening aktif"
                className="w-full border border-sky-line rounded-xl px-4 py-2.5 text-sm font-mono outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate block mb-1.5">Atas Nama</label>
              <input
                value={namaPemilik}
                onChange={(e) => setNamaPemilik(e.target.value)}
                placeholder="Sesuai buku tabungan"
                className="w-full border border-sky-line rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-sky-line text-navy text-xs font-semibold rounded-xl py-3"
              >
                <X size={14} /> Batal
              </button>
              <button
                type="button"
                onClick={handleTambah}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-blue text-white text-xs font-semibold rounded-xl py-3 disabled:opacity-60"
              >
                <Check size={14} /> {saving ? "Menyimpan..." : "Simpan Rekening"}
              </button>
            </div>
          </div>
        )}

        {/* Daftar rekening yang udah ada SEKARANG DI BAWAH */}
        {list.length > 0 ? (
          list.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
              <BankLogo namaBank={r.nama_bank} size={44} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-navy">{r.nama_bank}</p>
                <p className="text-xs text-slate font-mono mt-0.5">{r.no_rekening}</p>
                <p className="text-[11px] text-slate mt-0.5">a.n {r.nama_pemilik}</p>
              </div>
              <button
                onClick={() => handleHapus(r.id)}
                disabled={deletingId === r.id}
                className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          !showForm && (
            <p className="text-xs text-slate text-center py-6 bg-white rounded-2xl shadow-sm">
              Belum ada rekening. Klik &quot;Tambah&quot; buat nambahin.
            </p>
          )
        )}
      </div>
    </div>
  );
}