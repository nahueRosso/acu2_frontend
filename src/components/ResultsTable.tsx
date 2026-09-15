"use client";

import { useState } from "react";
import type { ResultadosModelos } from "@/lib/api";
import { formatDb, formatFreqFull } from "@/lib/format";
import { MODELOS } from "@/lib/models";

interface Props {
  frecuencias: number[];
  resultados: ResultadosModelos;
}

export default function ResultsTable({ frecuencias, resultados }: Props) {
  const [abierta, setAbierta] = useState(true);

  return (
    <div className="table-wrap">
      <div className="section-heading">
        <button
          type="button"
          className="collapsible__trigger"
          style={{ width: "auto" }}
          onClick={() => setAbierta((v) => !v)}
        >
          <span className={`collapsible__caret${abierta ? " collapsible__caret--open" : ""}`}>▶</span>
          03 · Tabla de valores
        </button>
        <span className="section-heading__right">dB</span>
      </div>

      {abierta && (
        <div className="table-scroll">
          <table className="results-table">
            <thead>
              <tr>
                <th>f (Hz)</th>
                {MODELOS.map((m) => (
                  <th key={m.key}>{m.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {frecuencias.map((f, i) => (
                <tr key={f}>
                  <td>{formatFreqFull(f)}</td>
                  {MODELOS.map((m) => {
                    const valores = resultados[m.key];
                    return (
                      <td key={m.key} className={valores ? undefined : "td--muted"}>
                        {valores ? formatDb(valores[i]) : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
