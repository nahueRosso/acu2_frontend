// Formato numérico es-AR (coma decimal) para toda la UI.

const nfDb = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nfInt = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
const nfFreq = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });

export function formatDb(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return nfDb.format(value);
}

export function formatInt(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return nfInt.format(value);
}

export function formatFreqFull(f: number): string {
  return nfFreq.format(f);
}

/** Frecuencia abreviada para el eje del gráfico: 1000 -> "1k", 1250 -> "1,25k" */
export function formatFreqAxis(f: number): string {
  if (f >= 1000) {
    const k = f / 1000;
    const texto = k % 1 === 0 ? String(k) : k.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    return `${texto.replace(".", ",")}k`;
  }
  return nfFreq.format(f);
}
