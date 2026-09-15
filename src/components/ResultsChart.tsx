"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CalculoResponse, ResultadosModelos } from "@/lib/api";
import { NOMBRES_MODELOS } from "@/lib/api";

interface Props {
  datos: CalculoResponse;
}

const COLORES: Record<keyof ResultadosModelos, string> = {
  ley_de_masas: "#2563eb",
  ley_de_masas_corregida: "#16a34a",
  sharp: "#ea580c",
  iso12354: "#9333ea",
  davy: "#dc2626",
};

export default function ResultsChart({ datos }: Props) {
  const claves = Object.keys(datos.resultados) as (keyof ResultadosModelos)[];
  const disponibles = claves.filter((clave) => datos.resultados[clave] !== null);

  const filas = datos.frecuencias.map((f, i) => {
    const fila: Record<string, number | string> = { frecuencia: f };
    for (const clave of disponibles) {
      fila[clave] = datos.resultados[clave]![i];
    }
    return fila;
  });

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filas} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="frecuencia"
            scale="log"
            domain={["auto", "auto"]}
            type="number"
            tickFormatter={(v) => `${v}`}
            label={{ value: "Frecuencia (Hz)", position: "insideBottom", offset: -5 }}
          />
          <YAxis label={{ value: "R (dB)", angle: -90, position: "insideLeft" }} />
          <Tooltip
            formatter={(value, name) => [
              `${Number(value).toFixed(2)} dB`,
              NOMBRES_MODELOS[name as keyof ResultadosModelos],
            ]}
            labelFormatter={(label) => `${label} Hz`}
          />
          <Legend formatter={(value) => NOMBRES_MODELOS[value as keyof ResultadosModelos]} />
          {disponibles.map((clave) => (
            <Line
              key={clave}
              type="monotone"
              dataKey={clave}
              stroke={COLORES[clave]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
