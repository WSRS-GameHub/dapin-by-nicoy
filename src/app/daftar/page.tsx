"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Lock, Phone, UserPlus, Eye, EyeOff } from "lucide-react";
import Toast from "@/components/ui/Toast";

export default function DaftarPage() {
  const router = useRouter();
  const supabase = createClient();
  const [nama, setNama] = useState("");
  const [noTelpon, setNoTelpon] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleDaftar(e: React.FormEvent) {
    e.preventDefault();
    setToast(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nama } },
    });

    setLoading(false);

    if (error) {
      setToast({ type: "error", message: error.message });
      return;
    }

    if (data.user) {
      await supabase.from("profiles").update({ no_telpon: noTelpon }).eq("id", data.user.id);
    }

    if (data.session) {
  setToast({ type: "success", message: "Pendaftaran berhasil! Mengalihkan..." });
  setTimeout(() => {
    router.push("/dashboard");
    router.refresh();
  }, 800);
} else {
  setToast({
    type: "success",
    message: "Pendaftaran berhasil. Cek email untuk konfirmasi sebelum masuk.",
  });
}
  }

  return (
    <div className="min-h-screen flex flex-col justify-center max-w-md mx-auto px-6 py-10 bg-[#F3F6FE]">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="mb-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue to-navy text-white flex items-center justify-center font-display font-bold text-xl mx-auto">
          D
        </div>
        <h1 className="font-display font-bold text-2xl text-navy mt-4">Daftar Anggota Dapin</h1>
        <p className="text-sm text-slate mt-1">Isi data di bawah untuk mulai</p>
      </div>

      <form onSubmit={handleDaftar} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-slate block mb-1.5">Nama Lengkap</label>
          <div className="flex items-center gap-2.5 border border-sky-line bg-white rounded-xl px-4 py-3">
            <User size={17} className="text-slate" />
            <input
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama sesuai KTP"
              className="flex-1 outline-none text-sm text-navy placeholder:text-slate/60"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate block mb-1.5">No. WhatsApp</label>
          <div className="flex items-center gap-2.5 border border-sky-line bg-white rounded-xl px-4 py-3">
            <Phone size={17} className="text-slate" />
            <input
              required
              value={noTelpon}
              onChange={(e) => setNoTelpon(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="flex-1 outline-none text-sm text-navy placeholder:text-slate/60"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate block mb-1.5">Email</label>
          <div className="flex items-center gap-2.5 border border-sky-line bg-white rounded-xl px-4 py-3">
            <Mail size={17} className="text-slate" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="flex-1 outline-none text-sm text-navy placeholder:text-slate/60"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate block mb-1.5">Password</label>
          <div className="flex items-center gap-2.5 border border-sky-line bg-white rounded-xl px-4 py-3">
            <Lock size={17} className="text-slate" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="flex-1 outline-none text-sm text-navy placeholder:text-slate/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate flex-shrink-0"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-blue text-white font-semibold text-sm rounded-xl py-3.5 mt-2 disabled:opacity-60"
        >
          <UserPlus size={17} />
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p className="text-center text-sm text-slate mt-6">
        Sudah punya akun?{" "}
        <a href="/login" className="text-blue font-semibold">Masuk di sini</a>
      </p>
    </div>
  );
}