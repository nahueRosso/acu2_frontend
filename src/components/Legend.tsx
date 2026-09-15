"use client";

import { MODELOS, type ModeloKey } from "@/lib/models";

interface Props {
  visibles: Record<ModeloKey, boolean>;
  onToggle: (key: ModeloKey) => void;
}

export default function Legend({ visibles, onToggle }: Props) {
  return (
    <div className="legend">
      {MODELOS.map((m) => {
        if (!m.implementado) {
          return (
            <span key={m.key} className="legend__chip legend__chip--disabled">
              <span
                className="legend__swatch"
                style={{ borderColor: m.color, borderStyle: m.dash ? "dashed" : "solid" }}
              />
              {m.label}
              <span className="legend__badge">PRÓXIMAMENTE</span>
            </span>
          );
        }
        const activo = visibles[m.key];
        return (
          <button
            key={m.key}
            type="button"
            className={`legend__chip${activo ? " legend__chip--active" : ""}`}
            onClick={() => onToggle(m.key)}
          >
            <span
              className="legend__swatch"
              style={{ borderColor: m.color, borderStyle: m.dash ? "dashed" : "solid" }}
            />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
