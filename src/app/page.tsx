"use client";

import { useState } from "react";
import PanelForm from "@/components/PanelForm";
import ResultsChart from "@/components/ResultsChart";
import ResultsTable from "@/components/ResultsTable";
import { calcular, exportarExcel, type CalculoResponse, type PanelInput } from "@/lib/api";

export default function Home() {
  const [datos, setDatos] = useState<CalculoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimoPanel, setUltimoPanel] = useState<PanelInput | null>(null);

  async function handleCalcular(panel: PanelInput) {
    setLoading(true);
    setError(null);
    try {
      const resultado = await calcular(panel);
      setDatos(resultado);
      setUltimoPanel(panel);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setDatos(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleExportar() {
    if (!ultimoPanel) return;
    setExportando(true);
    setError(null);
    try {
      const blob = await exportarExcel(ultimoPanel);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aislamiento_${ultimoPanel.nombre_material || "panel"}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-10 px-6">
      <main className="max-w-4xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold">Aislamiento a ruido aéreo — Panel simple</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            TP1 — Acústica y Psicoacústica II. Índice de reducción sonora R por banda de
            tercio de octava, comparando modelos de predicción.
          </p>
        </div>

        <PanelForm onSubmit={handleCalcular} loading={loading} />

        {error && (
          <div className="border border-red-400 bg-red-50 text-red-800 rounded px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {datos && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-medium">Resultados</h2>
              <button
                onClick={handleExportar}
                disabled={exportando}
                className="bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {exportando ? "Exportando..." : "Exportar a Excel"}
              </button>
            </div>

            {(datos.resultados.iso12354 === null || datos.resultados.davy === null) && (
              <p className="text-xs text-zinc-500">
                Nota: ISO 12354-1 y/o Davy todavía no están implementados en el backend
                (formulas pendientes de confirmar) y no aparecen en el gráfico ni la tabla.
              </p>
            )}

            <ResultsChart datos={datos} />
            <ResultsTable datos={datos} />
          </div>
        )}
      </main>
    </div>
  );
}
