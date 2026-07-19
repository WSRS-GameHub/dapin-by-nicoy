"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate"
      aria-label="Keluar"
    >
      <LogOut size={17} />
    </button>
  );
}