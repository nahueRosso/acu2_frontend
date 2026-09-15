"use client";

import { useState } from "react";
import Chart from "@/components/Chart";
import Legend from "@/components/Legend";
import PanelForm from "@/components/PanelForm";
import ResultsTable from "@/components/ResultsTable";
import StateBox from "@/components/StateBox";
import { frecuenciaCritica } from "@/lib/acoustics";
import { calcular, exportarExcel, type CalculoResponse, type PanelInput } from "@/lib/api";
import { MODELOS, type ModeloKey } from "@/lib/models";
import { useTheme } from "@/lib/theme";

type Estado = "vacio" | "calculando" | "con-datos" | "error";

const VISIBLES_INICIAL = Object.fromEntries(MODELOS.map((m) => [m.key, true])) as Record<ModeloKey, boolean>;

export default function Home() {
  const { theme, toggle } = useTheme();
  const [estado, setEstado] = useState<Estado>("vacio");
  const [datos, setDatos] = useState<CalculoResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ultimoPanel, setUltimoPanel] = useState<PanelInput | null>(null);
  const [exportando, setExportando] = useState(false);
  const [visibles, setVisibles] = useState<Record<ModeloKey, boolean>>(VISIBLES_INICIAL);
  const [formInvalido, setFormInvalido] = useState(false);

  async function handleCalcular(panel: PanelInput) {
    setEstado("calculando");
    setErrorMsg(null);
    setUltimoPanel(panel);
    try {
      const resultado = await calcular(panel);
      setDatos(resultado);
      setEstado("con-datos");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Error desconocido");
      setEstado("error");
    }
  }

  async function handleExportar() {
    if (!ultimoPanel) return;
    setExportando(true);
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
      setErrorMsg(e instanceof Error ? e.message : "Error al exportar");
    } finally {
      setExportando(false);
    }
  }

  function toggleVisible(key: ModeloKey) {
    setVisibles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const fc =
    datos && datos.entrada.poisson < 1
      ? frecuenciaCritica(datos.entrada.densidad, datos.entrada.espesor, datos.entrada.modulo_young, datos.entrada.poisson)
      : null;

  const nModelosImplementados = MODELOS.filter((m) => m.implementado).length;

  // Un error de validación en el formulario tiene prioridad visual sobre
  // el último resultado calculado (ver ESPECIFICACION.md: la cabecera debe
  // indicar "entrada inválida" y el gráfico se reemplaza en el momento).
  const estadoMostrado: Estado = formInvalido ? "error" : estado;

  // Davy e ISO 12354-1 están implementados pero necesitan Lx/Ly (eficiencia
  // de radiación); si faltan, el backend devuelve null para esos modelos y
  // sin este aviso parecería que están "rotos" en vez de "falta un dato".
  const faltanDimensiones = datos !== null && (datos.entrada.lx == null || datos.entrada.ly == null);
  const modelosSinCurvaPorDimensiones =
    estadoMostrado === "con-datos" && datos !== null && faltanDimensiones
      ? MODELOS.filter((m) => (m.key === "davy" || m.key === "iso12354") && datos.resultados[m.key] === null)
      : [];

  return (
    <>
      <header className="app-header">
        <div className="app-header__title-row">
          <span className="app-header__mark">R</span>
          <div className="app-header__text">
            <div className="app-header__title">Predicción de aislamiento acústico — panel simple</div>
            <div className="app-header__subtitle">
              R (dB) vs. frecuencia · bandas de 1/3 de octava · 20 Hz – 20 kHz
            </div>
          </div>
        </div>
        <button type="button" className="theme-toggle" onClick={toggle} suppressHydrationWarning>
          {theme === "dark" ? "☾ Oscuro" : "☀ Claro"}
        </button>
      </header>

      <main className="app-main">
        <div className="layout-grid">
          <section className="panel">
            <div className="section-heading">
              <span>01 · Entrada</span>
              <span className="section-heading__right">panel simple</span>
            </div>
            <PanelForm
              onSubmit={handleCalcular}
              loading={estado === "calculando"}
              onValidationChange={setFormInvalido}
            />
          </section>

          <section className="panel">
            <div className="results-header">
              <div className="section-heading" style={{ marginBottom: 0 }}>
                <span>
                  02 · Resultados
                  {datos && (
                    <span className="section-heading__right" style={{ marginLeft: 10 }}>
                      m&apos; {Math.round(datos.entrada.densidad * datos.entrada.espesor)} kg/m² · fc{" "}
                      {fc !== null ? Math.round(fc) : "—"} Hz
                    </span>
                  )}
                </span>
              </div>
              <button
                type="button"
                className="btn-secondary"
                disabled={estadoMostrado !== "con-datos" || exportando}
                onClick={handleExportar}
              >
                ↓ {exportando ? "Exportando…" : "Exportar a Excel"}
              </button>
            </div>

            {estadoMostrado === "vacio" && <StateBox variant="vacio" />}
            {estadoMostrado === "calculando" && <StateBox variant="calculando" nModelos={nModelosImplementados} />}
            {estadoMostrado === "error" && (
              <StateBox
                variant="error"
                mensaje={formInvalido ? undefined : (errorMsg ?? undefined)}
              />
            )}
            {estadoMostrado === "con-datos" && datos && (
              <Chart frecuencias={datos.frecuencias} resultados={datos.resultados} visibles={visibles} fc={fc} />
            )}

            <Legend visibles={visibles} onToggle={toggleVisible} />

            {modelosSinCurvaPorDimensiones.length > 0 && (
              <p className="field__unit" style={{ marginTop: 8 }}>
                ▲ {modelosSinCurvaPorDimensiones.map((m) => m.label).join(" y ")} no{" "}
                {modelosSinCurvaPorDimensiones.length > 1 ? "tienen curva" : "tiene curva"} porque faltan las
                dimensiones del panel — completá <strong style={{ color: "var(--ink)" }}>Lx</strong> y{" "}
                <strong style={{ color: "var(--ink)" }}>Ly</strong> en &quot;Dimensiones del panel&quot; y
                volvé a calcular.
              </p>
            )}

            <ResultsTable
              frecuencias={datos?.frecuencias ?? []}
              resultados={
                datos?.resultados ?? {
                  ley_de_masas: null,
                  ley_de_masas_corregida: null,
                  sharp: null,
                  davy: null,
                  iso12354: null,
                }
              }
            />
          </section>
        </div>
      </main>
    </>
  );
}
