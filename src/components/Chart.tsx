"use client";

import { useMemo, useState } from "react";
import type { ResultadosModelos } from "@/lib/api";
import { formatDb, formatFreqAxis, formatFreqFull } from "@/lib/format";
import { MODELOS, type ModeloKey } from "@/lib/models";
import { useElementSize } from "@/lib/useElementSize";

interface Props {
  frecuencias: number[];
  resultados: ResultadosModelos;
  visibles: Record<ModeloKey, boolean>;
  fc: number | null;
}

const X_MIN = 20;
const X_MAX = 20000;
const Y_MIN = 0;
const Y_MAX = 80;
const X_TICKS = [31.5, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const Y_TICKS = [0, 20, 40, 60, 80];
const PAD = { left: 40, right: 14, top: 14, bottom: 28 };

function logPos(f: number): number {
  return (Math.log10(f) - Math.log10(X_MIN)) / (Math.log10(X_MAX) - Math.log10(X_MIN));
}

export default function Chart({ frecuencias, resultados, visibles, fc }: Props) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = size.width || 640;
  const height = size.height || 360;
  const plotW = Math.max(width - PAD.left - PAD.right, 10);
  const plotH = Math.max(height - PAD.top - PAD.bottom, 10);

  const xScale = (f: number) => PAD.left + logPos(f) * plotW;
  const yScale = (db: number) => PAD.top + (1 - (db - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;

  const curvas = useMemo(
    () =>
      MODELOS.filter((m) => visibles[m.key] && resultados[m.key]).map((m) => {
        const valores = resultados[m.key] as number[];
        const d = frecuencias
          .map((f, i) => `${i === 0 ? "M" : "L"} ${xScale(f).toFixed(2)} ${yScale(valores[i]).toFixed(2)}`)
          .join(" ");
        return { meta: m, valores, d };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frecuencias, resultados, visibles, width, height]
  );

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const frac = (px - PAD.left) / plotW;
    if (frac < -0.02 || frac > 1.02) {
      setHoverIdx(null);
      return;
    }
    const f = Math.pow(10, Math.log10(X_MIN) + frac * (Math.log10(X_MAX) - Math.log10(X_MIN)));
    let best = 0;
    let bestDist = Infinity;
    frecuencias.forEach((bf, i) => {
      const dist = Math.abs(Math.log10(bf) - Math.log10(f));
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setHoverIdx(best);
  }

  const hoverF = hoverIdx !== null ? frecuencias[hoverIdx] : null;
  const hoverX = hoverF !== null ? xScale(hoverF) : null;
  const flip = hoverX !== null && hoverX / width > 0.58;

  return (
    <div className="chart-wrap" ref={ref}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* grilla horizontal + eje Y */}
        {Y_TICKS.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={yScale(t)}
              y2={yScale(t)}
              stroke="var(--grid)"
              strokeWidth={1}
            />
            <text x={PAD.left - 8} y={yScale(t)} textAnchor="end" dominantBaseline="middle" className="chart-axis-label">
              {t}
            </text>
          </g>
        ))}

        {/* eje X */}
        {X_TICKS.map((t) => (
          <text
            key={t}
            x={xScale(t)}
            y={height - PAD.bottom + 16}
            textAnchor="middle"
            className="chart-axis-label"
          >
            {formatFreqAxis(t)}
          </text>
        ))}

        {/* línea vertical en fc */}
        {fc !== null && fc >= X_MIN && fc <= X_MAX && (
          <g>
            <line
              x1={xScale(fc)}
              x2={xScale(fc)}
              y1={PAD.top}
              y2={height - PAD.bottom}
              stroke="var(--muted)"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
            <text x={xScale(fc) + 4} y={PAD.top + 10} className="chart-fc-label">
              fc
            </text>
          </g>
        )}

        {/* recorte: los valores pueden superar el rango 0-80 dB del eje (paneles
            muy pesados a alta frecuencia, o valores negativos a f muy baja) */}
        <defs>
          <clipPath id="plot-clip">
            <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        <g clipPath="url(#plot-clip)">
          {/* curvas */}
          {curvas.map(({ meta, d }) => (
            <path
              key={meta.key}
              d={d}
              fill="none"
              stroke={meta.color}
              strokeWidth={meta.strokeWidth}
              strokeDasharray={meta.dash}
            />
          ))}

          {/* guía de hover + puntos */}
          {hoverX !== null && (
            <g>
              <line
                x1={hoverX}
                x2={hoverX}
                y1={PAD.top}
                y2={height - PAD.bottom}
                stroke="var(--accent)"
                strokeWidth={1}
              />
              {curvas.map(({ meta, valores }) => (
                <circle
                  key={meta.key}
                  cx={hoverX}
                  cy={yScale(valores[hoverIdx!])}
                  r={3.2}
                  fill={meta.color}
                  stroke="var(--panel)"
                  strokeWidth={1}
                />
              ))}
            </g>
          )}
        </g>
      </svg>

      {hoverIdx !== null && hoverX !== null && (
        <div
          className="chart-tooltip"
          style={{
            top: 8,
            left: flip ? undefined : Math.min(hoverX + 10, width - 12),
            right: flip ? width - hoverX + 10 : undefined,
          }}
        >
          <div className="chart-tooltip__title">{formatFreqFull(frecuencias[hoverIdx])} Hz</div>
          {MODELOS.map((m) => (
            <div className="chart-tooltip__row" key={m.key}>
              <span
                className="chart-tooltip__swatch"
                style={{ background: m.implementado ? m.color : "var(--line)" }}
              />
              <span className="chart-tooltip__name">{m.label}</span>
              <span className="chart-tooltip__value">
                {m.implementado && resultados[m.key] ? formatDb((resultados[m.key] as number[])[hoverIdx]) : "n/d"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
