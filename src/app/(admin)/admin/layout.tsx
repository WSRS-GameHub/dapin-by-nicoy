import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, ShieldCheck, Wallet, Users, Tag, Settings } from "lucide-react";
import SignOutButton from "@/components/member/SignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, nama")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F3F6FE]">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <p className="text-xs text-slate font-medium">Halo, Admin 👋</p>
          <h1 className="font-display font-bold text-lg text-navy mt-0.5">{profile?.nama}</h1>
          <span className="inline-block text-[10px] font-mono font-semibold text-blue bg-sky px-2 py-0.5 rounded mt-1">
            Panel Admin
          </span>
        </div>
        <SignOutButton />
      </div>

      <div className="flex-1">{children}</div>

      <div className="mt-auto sticky bottom-0 bg-white border-t border-sky-line flex justify-around items-center py-3 pb-6">
        <NavItem href="/admin" icon={Home} label="Beranda" />
        <NavItem href="/admin/verifikasi" icon={ShieldCheck} label="Verifikasi" />
        <NavItem href="/admin/pinjaman" icon={Wallet} label="Pinjaman" />
        <NavItem href="/admin/anggota" icon={Users} label="Anggota" />
        <NavItem href="/admin/tarif" icon={Tag} label="Tarif" />
        <NavItem href="/admin/pengaturan" icon={Settings} label="Atur" />
      </div>
    </div>
  );
}

function NavItem({ href, icon: Icon, label }: { href: string; icon: typeof Home; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 flex-1 text-slate">
      <Icon size={18} />
      <span className="text-[9.5px] font-semibold">{label}</span>
    </Link>
  );
}