"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, History, User } from "lucide-react";

type Props = {
  ajukanHref: string;
  ajukanLabel: string;
};

export default function BottomNav({ ajukanHref, ajukanLabel }: Props) {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", icon: Home, label: "Beranda" },
    { href: ajukanHref, icon: Wallet, label: ajukanLabel },
    { href: "/riwayat", icon: History, label: "Riwayat" },
    { href: "/profil", icon: User, label: "Profil" },
  ];

  const activeIndex = items.findIndex((item) =>
    item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)
  );
  const idx = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div className="mt-auto sticky bottom-0 bg-white border-t border-sky-line px-3 pt-2.5 pb-6">
      <div className="relative">
        {/* Pill indikator yang geser */}
        <div
          className="absolute top-0 h-[54px] bg-sky rounded-2xl transition-all duration-300 ease-out"
          style={{
            width: "25%",
            left: `${idx * 25}%`,
          }}
        />

        <div className="relative flex justify-around items-center">
          {items.map((item, i) => {
            const Icon = item.icon;
            const active = i === idx;
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="flex flex-col items-center gap-1 w-1/4 py-2 z-10"
              >
                <Icon
                  size={21}
                  className={`transition-colors duration-300 ${active ? "text-blue" : "text-slate"}`}
                />
                <span
                  className={`text-[10.5px] font-semibold transition-colors duration-300 ${
                    active ? "text-blue" : "text-slate"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}