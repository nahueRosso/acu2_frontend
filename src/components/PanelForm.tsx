"use client";

import { useState } from "react";
import type { PanelInput } from "@/lib/api";

interface Props {
  onSubmit: (panel: PanelInput) => void;
  loading: boolean;
}

const VALORES_INICIALES: PanelInput = {
  nombre_material: "Placa de yeso 12.5mm",
  espesor: 0.0125,
  densidad: 850,
  modulo_young: 2e9,
  poisson: 0.3,
  factor_perdidas: 0.01,
  lx: 1.2,
  ly: 1.2,
};

type CampoNumerico = "espesor" | "densidad" | "modulo_young" | "poisson" | "factor_perdidas" | "lx" | "ly";

export default function PanelForm({ onSubmit, loading }: Props) {
  const [valores, setValores] = useState<PanelInput>(VALORES_INICIALES);

  function actualizarNumero(campo: CampoNumerico, valor: string) {
    setValores((prev) => ({
      ...prev,
      [campo]: valor === "" ? undefined : Number(valor),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(valores);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-medium">Nombre del material</span>
        <input
          type="text"
          value={valores.nombre_material ?? ""}
          onChange={(e) => setValores((prev) => ({ ...prev, nombre_material: e.target.value }))}
          className="border rounded px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Espesor l [m]</span>
        <input
          type="number"
          step="any"
          required
          value={valores.espesor}
          onChange={(e) => actualizarNumero("espesor", e.target.value)}
          className="border rounded px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Densidad ρ [kg/m³]</span>
        <input
          type="number"
          step="any"
          required
          value={valores.densidad}
          onChange={(e) => actualizarNumero("densidad", e.target.value)}
          className="border rounded px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Módulo de Young E [Pa]</span>
        <input
          type="number"
          step="any"
          required
          value={valores.modulo_young}
          onChange={(e) => actualizarNumero("modulo_young", e.target.value)}
          className="border rounded px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Coeficiente de Poisson σ</span>
        <input
          type="number"
          step="any"
          required
          value={valores.poisson}
          onChange={(e) => actualizarNumero("poisson", e.target.value)}
          className="border rounded px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Factor de pérdidas η</span>
        <input
          type="number"
          step="any"
          required
          value={valores.factor_perdidas}
          onChange={(e) => actualizarNumero("factor_perdidas", e.target.value)}
          className="border rounded px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Lx [m] (opcional)</span>
        <input
          type="number"
          step="any"
          value={valores.lx ?? ""}
          onChange={(e) => actualizarNumero("lx", e.target.value)}
          className="border rounded px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Ly [m] (opcional)</span>
        <input
          type="number"
          step="any"
          value={valores.ly ?? ""}
          onChange={(e) => actualizarNumero("ly", e.target.value)}
          className="border rounded px-2 py-1"
        />
      </label>

      <div className="sm:col-span-2 flex gap-3 mt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Calculando..." : "Calcular"}
        </button>
      </div>
    </form>
  );
}
