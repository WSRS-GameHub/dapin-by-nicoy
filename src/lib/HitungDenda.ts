export function hitungDenda(
  tanggalCair: string,
  tempoHari: number,
  dendaPerHari: number,
  now: Date = new Date()
) {
  const jatuhTempo = new Date(tanggalCair);
  jatuhTempo.setDate(jatuhTempo.getDate() + tempoHari);

  const diffMs = now.getTime() - jatuhTempo.getTime();
  const hariTelat = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const totalDenda = hariTelat * dendaPerHari;

  return { jatuhTempo, hariTelat, totalDenda };
}