"use client";

import type { CalculoResponse, ResultadosModelos } from "@/lib/api";
import { NOMBRES_MODELOS } from "@/lib/api";

interface Props {
  datos: CalculoResponse;
}

export default function ResultsTable({ datos }: Props) {
  const claves = Object.keys(datos.resultados) as (keyof ResultadosModelos)[];
  const disponibles = claves.filter((clave) => datos.resultados[clave] !== null);

  return (
    <div className="overflow-x-auto max-h-96 border rounded">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-3 py-2 text-left">Frecuencia (Hz)</th>
            {disponibles.map((clave) => (
              <th key={clave} className="px-3 py-2 text-right">
                {NOMBRES_MODELOS[clave]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.frecuencias.map((f, i) => (
            <tr key={f} className="border-t">
              <td className="px-3 py-1">{f}</td>
              {disponibles.map((clave) => (
                <td key={clave} className="px-3 py-1 text-right">
                  {datos.resultados[clave]![i].toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
