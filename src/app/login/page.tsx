"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import Toast from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setToast(null);
  setLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    setLoading(false);
    setToast({ type: "error", message: "Email atau password salah. Coba lagi." });
    return;
  }

  // Cek apakah user ini admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .single();

  setLoading(false);
  setToast({ type: "success", message: "Berhasil masuk! Mengalihkan..." });

  setTimeout(() => {
    router.push(profile?.is_admin ? "/admin" : "/");
    router.refresh();
  }, 800);
}

  return (
    <div className="min-h-screen flex flex-col justify-center max-w-md mx-auto px-6 bg-[#F3F6FE]">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue to-navy text-white flex items-center justify-center font-display font-bold text-xl mx-auto">
          D
        </div>
        <h1 className="font-display font-bold text-2xl text-navy mt-4">Masuk ke Dapin</h1>
        <p className="text-sm text-slate mt-1">by Nicoy — khusus anggota terdaftar</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
          <LogIn size={17} />
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="text-center text-sm text-slate mt-6">
        Belum punya akun?{" "}
        <a href="/daftar" className="text-blue font-semibold">Daftar di sini</a>
      </p>
    </div>
  );
}