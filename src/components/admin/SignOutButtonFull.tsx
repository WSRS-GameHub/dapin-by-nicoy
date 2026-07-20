"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function SignOutButtonFull() {
  const router = useRouter();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      className="w-full flex items-center justify-center gap-2 text-red-500 bg-red-50 text-sm font-semibold rounded-xl py-3.5 disabled:opacity-60"
    >
      <LogOut size={16} />
      {loggingOut ? "Keluar..." : "Keluar dari Akun"}
    </button>
  );
}