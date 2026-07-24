"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldCheck, Wallet, Users, Tag, Settings } from "lucide-react";

const STORAGE_KEY = "dapin-admin-bottomnav-idx";

const items = [
  { href: "/admin", icon: Home, label: "Beranda" },
  { href: "/admin/verifikasi", icon: ShieldCheck, label: "Verifikasi" },
  { href: "/admin/pinjaman", icon: Wallet, label: "Pinjaman" },
  { href: "/admin/anggota", icon: Users, label: "Anggota" },
  { href: "/admin/tarif", icon: Tag, label: "Tarif" },
  { href: "/admin/pengaturan", icon: Settings, label: "Atur" },
];

export default function AdminBottomNav() {
  const pathname = usePathname();

  const activeIndex = items.findIndex((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );
  const idx = activeIndex === -1 ? 0 : activeIndex;
  const widthPercent = 100 / items.length;

  const [displayIdx, setDisplayIdx] = useState<number>(() => {
    if (typeof window === "undefined") return idx;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored !== null ? Number(stored) : idx;
  });
  const [siap, setSiap] = useState(false);
  const prevIdxRef = useRef(displayIdx);

  useEffect(() => {
    if (prevIdxRef.current !== idx) {
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          startTransition(() => {
            setDisplayIdx(idx);
          });
        });
      });
      prevIdxRef.current = idx;
      startTransition(() => {
        setSiap(true);
      });
      return () => cancelAnimationFrame(t);
    }
    prevIdxRef.current = idx;
    startTransition(() => {
      setSiap(true);
    });
  }, [idx]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, String(idx));
    }
  }, [idx]);

  return (
    <div className="mt-auto sticky bottom-0 bg-white border-t border-sky-line px-2 pt-2.5 pb-6">
      <div className="relative">
        <div
          className={`absolute top-0 h-[50px] bg-sky rounded-2xl ${
            siap ? "transition-all duration-300 ease-out" : ""
          }`}
          style={{
            width: `${widthPercent}%`,
            left: `${displayIdx * widthPercent}%`,
          }}
        />

        <div className="relative flex justify-around items-center">
          {items.map((item, i) => {
            const Icon = item.icon;
            const active = i === displayIdx;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-2 z-10"
                style={{ width: `${widthPercent}%` }}
              >
                <Icon
                  size={18}
                  className={`transition-colors duration-300 ${active ? "text-blue" : "text-slate"}`}
                />
                <span
                  className={`text-[9.5px] font-semibold transition-colors duration-300 ${
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