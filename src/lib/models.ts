import type { ResultadosModelos } from "@/lib/api";

export type ModeloKey = keyof ResultadosModelos;

export interface ModeloMeta {
  key: ModeloKey;
  label: string;
  color: string;
  dash?: string;
  strokeWidth: number;
  implementado: boolean;
}

// Orden y estilos fijos (no derivan del tema claro/oscuro), ver ESPECIFICACION.md.
export const MODELOS: ModeloMeta[] = [
  { key: "ley_de_masas", label: "Ley de masas", color: "#8d979f", dash: "3 4", strokeWidth: 1.8, implementado: true },
  {
    key: "ley_de_masas_corregida",
    label: "Ley de masas corregida",
    color: "#5b8fd4",
    strokeWidth: 2.2,
    implementado: true,
  },
  { key: "sharp", label: "Sharp", color: "#d79a43", strokeWidth: 2.6, implementado: true },
  { key: "davy", label: "Davy", color: "#b07ac4", strokeWidth: 2.2, implementado: true },
  { key: "iso12354", label: "ISO 12354-1", color: "#5fa87e", strokeWidth: 2.2, implementado: true },
];
