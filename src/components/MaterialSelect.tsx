"use client";

import { useEffect, useRef, useState } from "react";
import type { Material } from "@/lib/api";

interface Props {
  materiales: Material[];
  valorMostrado: string;
  onSelect: (material: Material) => void;
}

export default function MaterialSelect({ materiales, valorMostrado, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    searchRef.current?.focus();
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const filtrados = materiales.filter((m) => m.material.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="material-select" ref={rootRef}>
      <button
        type="button"
        className="material-select__button"
        onClick={() => {
          setQuery("");
          setOpen((v) => !v);
        }}
      >
        <span>{valorMostrado}</span>
        <span className="material-select__caret">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="material-select__popover">
          <div className="material-select__search">
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar material…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="material-select__list">
            {filtrados.length === 0 && <div className="material-select__empty">Sin resultados</div>}
            {filtrados.map((m) => (
              <button
                key={m.id}
                type="button"
                className="material-select__item"
                onClick={() => {
                  onSelect(m);
                  setOpen(false);
                }}
              >
                <span>{m.material}</span>
                <span className="material-select__item-meta">ρ = {m.densidad_kg_m3} kg/m³</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
