export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface PanelInput {
  nombre_material?: string;
  espesor: number;
  densidad: number;
  modulo_young: number;
  poisson: number;
  factor_perdidas: number;
  lx?: number;
  ly?: number;
}

export interface ResultadosModelos {
  ley_de_masas: number[] | null;
  ley_de_masas_corregida: number[] | null;
  iso12354: number[] | null;
  sharp: number[] | null;
  davy: number[] | null;
}

export interface CalculoResponse {
  frecuencias: number[];
  resultados: ResultadosModelos;
  entrada: PanelInput;
}

export interface Material {
  id: number;
  material: string;
  densidad_kg_m3: number;
  modulo_young_Pa: number;
  factor_perdidas: number;
  modulo_poisson: number;
}

async function extraerError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data?.detail) {
      return typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    }
  } catch {
    // ignorar, usamos el mensaje genérico
  }
  return `Error ${res.status} al comunicarse con el backend`;
}

export async function calcular(panel: PanelInput): Promise<CalculoResponse> {
  const res = await fetch(`${API_URL}/calcular`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(panel),
  });
  if (!res.ok) {
    throw new Error(await extraerError(res));
  }
  return res.json();
}

export async function exportarExcel(panel: PanelInput): Promise<Blob> {
  const res = await fetch(`${API_URL}/exportar-excel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(panel),
  });
  if (!res.ok) {
    throw new Error(await extraerError(res));
  }
  return res.blob();
}

export async function fetchMateriales(): Promise<Material[]> {
  const res = await fetch(`${API_URL}/materiales`);
  if (!res.ok) {
    throw new Error(await extraerError(res));
  }
  return res.json();
}
