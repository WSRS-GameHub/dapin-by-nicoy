import Image from "next/image";

const knownLogos: Record<string, string> = {
  bca: "/bank-logos/bca.png",
  mandiri: "/bank-logos/mandiri.png",
  bri: "/bank-logos/bri.png",
  seabank: "/bank-logos/seabank.png",
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function BankLogo({
  namaBank,
  size = 40,
}: {
  namaBank: string;
  size?: number;
}) {
  const slug = slugify(namaBank || "");
  const src = knownLogos[slug];

  if (src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-xl bg-white border border-sky-line flex items-center justify-center overflow-hidden flex-shrink-0"
      >
        <Image
          src={src}
          alt={namaBank}
          width={size}
          height={size}
          className="object-contain p-1.5"
        />
      </div>
    );
  }

  // Fallback kalau nama bank belum ada logonya di /public/bank-logos
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-xl bg-sky text-blue flex items-center justify-center font-bold flex-shrink-0"
    >
      <span style={{ fontSize: size * 0.32 }}>{namaBank?.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}