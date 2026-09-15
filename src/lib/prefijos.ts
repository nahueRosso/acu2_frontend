// Prefijos del SI usados para cargar el Módulo de Young sin escribir ceros
// de más (fuente de errores frecuente: E suele rondar los GPa).

export interface Prefijo {
  simbolo: string;
  nombre: string;
  factor: number;
}

export const PREFIJOS: Prefijo[] = [
  { simbolo: "P", nombre: "Peta", factor: 1e15 },
  { simbolo: "T", nombre: "Tera", factor: 1e12 },
  { simbolo: "G", nombre: "Giga", factor: 1e9 },
  { simbolo: "M", nombre: "Mega", factor: 1e6 },
  { simbolo: "k", nombre: "Kilo", factor: 1e3 },
  { simbolo: "", nombre: "Unidad", factor: 1 },
];

export const PREFIJO_POR_DEFECTO = PREFIJOS.find((p) => p.simbolo === "G")!;

/** El prefijo más grande cuya mantisa (valor/factor) sea >= 1. */
export function mejorPrefijo(valor: number): Prefijo {
  for (const p of PREFIJOS) {
    if (Math.abs(valor) >= p.factor) return p;
  }
  return PREFIJOS[PREFIJOS.length - 1];
}

/** Mantisa "limpia" (sin ruido de punto flotante) para mostrar en el input. */
export function formatMantisa(valor: number, factor: number): string {
  const mantisa = valor / factor;
  if (!Number.isFinite(mantisa)) return "";
  const redondeada = Number(mantisa.toPrecision(10));
  return String(redondeada);
}

export function factorPorSimbolo(simbolo: string): number {
  return PREFIJOS.find((p) => p.simbolo === simbolo)?.factor ?? 1;
}
