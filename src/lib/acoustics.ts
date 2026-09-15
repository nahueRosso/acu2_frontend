// Fórmulas físicas usadas para el cálculo en vivo del lado del cliente
// (masa superficial y frecuencia crítica). Deben mantenerse consistentes
// con backend/app/models/bands.py (misma fuente normativa AYUDA_TP1).

const C0 = 343; // velocidad del sonido en aire [m/s]

export function masaSuperficial(densidad: number, espesor: number): number {
  return densidad * espesor;
}

export function rigidezFlexion(modulo_young: number, espesor: number, poisson: number): number {
  return (modulo_young * espesor ** 3) / (12 * (1 - poisson ** 2));
}

export function frecuenciaCritica(
  densidad: number,
  espesor: number,
  modulo_young: number,
  poisson: number
): number {
  const m = masaSuperficial(densidad, espesor);
  const b = rigidezFlexion(modulo_young, espesor, poisson);
  return (C0 ** 2 / (2 * Math.PI)) * Math.sqrt(m / b);
}
