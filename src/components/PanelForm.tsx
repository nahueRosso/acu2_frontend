"use client";

import { useEffect, useMemo, useState } from "react";
import MaterialSelect from "@/components/MaterialSelect";
import { fetchMateriales, type Material, type PanelInput } from "@/lib/api";
import { frecuenciaCritica, masaSuperficial } from "@/lib/acoustics";
import { formatInt } from "@/lib/format";

interface Props {
  onSubmit: (panel: PanelInput) => void;
  loading: boolean;
  onValidationChange?: (hayErrores: boolean) => void;
}

interface CamposTexto {
  espesor: string;
  densidad: string;
  modulo_young: string;
  poisson: string;
  factor_perdidas: string;
  lx: string;
  ly: string;
}

const CAMPOS_VACIOS: CamposTexto = {
  espesor: "",
  densidad: "",
  modulo_young: "",
  poisson: "",
  factor_perdidas: "",
  lx: "",
  ly: "",
};

function aNumero(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function validarCampo(campo: keyof CamposTexto, valor: number | null): string | null {
  if (valor === null) return null; // campo vacío: no se muestra error inline, ver required aparte
  switch (campo) {
    case "espesor":
      if (valor <= 0 || valor > 1) return "El espesor debe estar entre 0 y 1 m.";
      return null;
    case "densidad":
      if (valor <= 0) return "La densidad debe ser mayor que 0.";
      return null;
    case "modulo_young":
      if (valor <= 0) return "El módulo de Young debe ser mayor que 0.";
      return null;
    case "poisson":
      if (valor < 0 || valor >= 0.5) return "El coeficiente de Poisson debe estar entre 0 y 0,5.";
      return null;
    case "factor_perdidas":
      if (valor <= 0 || valor > 1) return "El factor de pérdidas debe estar entre 0 y 1.";
      return null;
    case "lx":
    case "ly":
      if (valor <= 0) return "La dimensión debe ser mayor que 0.";
      return null;
    default:
      return null;
  }
}

export default function PanelForm({ onSubmit, loading, onValidationChange }: Props) {
  const [campos, setCampos] = useState<CamposTexto>(CAMPOS_VACIOS);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null);
  const [dimensionesAbiertas, setDimensionesAbiertas] = useState(false);

  useEffect(() => {
    fetchMateriales()
      .then(setMateriales)
      .catch(() => setMateriales([]));
  }, []);

  function actualizarCampo(campo: keyof CamposTexto, valor: string) {
    setCampos((prev) => ({ ...prev, [campo]: valor }));
    setMaterialSeleccionado(null); // editar a mano desvincula el material elegido
  }

  function elegirMaterial(m: Material) {
    setMaterialSeleccionado(m);
    setCampos((prev) => ({
      ...prev,
      densidad: String(m.densidad_kg_m3),
      modulo_young: String(m.modulo_young_Pa),
      poisson: String(m.modulo_poisson),
      factor_perdidas: String(m.factor_perdidas),
    }));
  }

  const valores = useMemo(
    () => ({
      espesor: aNumero(campos.espesor),
      densidad: aNumero(campos.densidad),
      modulo_young: aNumero(campos.modulo_young),
      poisson: aNumero(campos.poisson),
      factor_perdidas: aNumero(campos.factor_perdidas),
      lx: aNumero(campos.lx),
      ly: aNumero(campos.ly),
    }),
    [campos]
  );

  const errores = useMemo(
    () => ({
      espesor: validarCampo("espesor", valores.espesor),
      densidad: validarCampo("densidad", valores.densidad),
      modulo_young: validarCampo("modulo_young", valores.modulo_young),
      poisson: validarCampo("poisson", valores.poisson),
      factor_perdidas: validarCampo("factor_perdidas", valores.factor_perdidas),
      lx: validarCampo("lx", valores.lx),
      ly: validarCampo("ly", valores.ly),
    }),
    [valores]
  );

  const camposRequeridosCompletos =
    valores.espesor !== null &&
    valores.densidad !== null &&
    valores.modulo_young !== null &&
    valores.poisson !== null &&
    valores.factor_perdidas !== null;

  const hayErrores = Object.values(errores).some((e) => e !== null);
  const puedeCalcular = camposRequeridosCompletos && !hayErrores;

  useEffect(() => {
    onValidationChange?.(hayErrores);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hayErrores]);

  const m = useMemo(() => {
    if (valores.densidad === null || valores.espesor === null) return null;
    if (errores.densidad || errores.espesor) return null;
    return masaSuperficial(valores.densidad, valores.espesor);
  }, [valores.densidad, valores.espesor, errores.densidad, errores.espesor]);

  const fc = useMemo(() => {
    if (valores.densidad === null || valores.espesor === null || valores.modulo_young === null || valores.poisson === null)
      return null;
    if (errores.densidad || errores.espesor || errores.modulo_young || errores.poisson) return null;
    return frecuenciaCritica(valores.densidad, valores.espesor, valores.modulo_young, valores.poisson);
  }, [
    valores.densidad,
    valores.espesor,
    valores.modulo_young,
    valores.poisson,
    errores.densidad,
    errores.espesor,
    errores.modulo_young,
    errores.poisson,
  ]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeCalcular) return;
    onSubmit({
      nombre_material: materialSeleccionado?.material,
      espesor: valores.espesor!,
      densidad: valores.densidad!,
      modulo_young: valores.modulo_young!,
      poisson: valores.poisson!,
      factor_perdidas: valores.factor_perdidas!,
      lx: valores.lx ?? undefined,
      ly: valores.ly ?? undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <div className="field__row">
          <span className="field__label">Material (base de datos)</span>
        </div>
        <MaterialSelect
          materiales={materiales}
          valorMostrado={materialSeleccionado?.material ?? "Carga manual"}
          onSelect={elegirMaterial}
        />
      </div>

      <div className="field">
        <div className="field__row">
          <span className="field__label">Espesor</span>
          <span className="field__unit">m</span>
        </div>
        <input
          className={`field__input${errores.espesor ? " field__input--error" : ""}`}
          type="text"
          inputMode="decimal"
          value={campos.espesor}
          onChange={(e) => actualizarCampo("espesor", e.target.value)}
        />
        {errores.espesor && <div className="field__error">▲ {errores.espesor}</div>}
      </div>

      <div className="field">
        <div className="field__row">
          <span className="field__label">Densidad volumétrica</span>
          <span className="field__unit">kg/m³</span>
        </div>
        <input
          className={`field__input${errores.densidad ? " field__input--error" : ""}`}
          type="text"
          inputMode="decimal"
          value={campos.densidad}
          onChange={(e) => actualizarCampo("densidad", e.target.value)}
        />
        {errores.densidad && <div className="field__error">▲ {errores.densidad}</div>}
      </div>

      <div className="field">
        <div className="field__row">
          <span className="field__label">Módulo de Young</span>
          <span className="field__unit">Pa</span>
        </div>
        <input
          className={`field__input${errores.modulo_young ? " field__input--error" : ""}`}
          type="text"
          inputMode="decimal"
          value={campos.modulo_young}
          onChange={(e) => actualizarCampo("modulo_young", e.target.value)}
        />
        {errores.modulo_young && <div className="field__error">▲ {errores.modulo_young}</div>}
      </div>

      <div className="field">
        <div className="field__row-pair">
          <div>
            <div className="field__row">
              <span className="field__label">Poisson ν</span>
              <span className="field__unit">—</span>
            </div>
            <input
              className={`field__input${errores.poisson ? " field__input--error" : ""}`}
              type="text"
              inputMode="decimal"
              value={campos.poisson}
              onChange={(e) => actualizarCampo("poisson", e.target.value)}
            />
          </div>
          <div>
            <div className="field__row">
              <span className="field__label">Pérdidas η</span>
              <span className="field__unit">—</span>
            </div>
            <input
              className={`field__input${errores.factor_perdidas ? " field__input--error" : ""}`}
              type="text"
              inputMode="decimal"
              value={campos.factor_perdidas}
              onChange={(e) => actualizarCampo("factor_perdidas", e.target.value)}
            />
          </div>
        </div>
        {errores.poisson && <div className="field__error">▲ {errores.poisson}</div>}
        {errores.factor_perdidas && <div className="field__error">▲ {errores.factor_perdidas}</div>}
      </div>

      <div className="collapsible">
        <button
          type="button"
          className="collapsible__trigger"
          onClick={() => setDimensionesAbiertas((v) => !v)}
        >
          <span className={`collapsible__caret${dimensionesAbiertas ? " collapsible__caret--open" : ""}`}>▶</span>
          Dimensiones del panel
          <span className="field__unit" style={{ marginLeft: "auto" }}>
            opcional
          </span>
        </button>
        {dimensionesAbiertas && (
          <div className="collapsible__body">
            <div className="field__row-pair">
              <div>
                <div className="field__row">
                  <span className="field__label">Alto (Lx)</span>
                  <span className="field__unit">m</span>
                </div>
                <input
                  className={`field__input${errores.lx ? " field__input--error" : ""}`}
                  type="text"
                  inputMode="decimal"
                  value={campos.lx}
                  onChange={(e) => actualizarCampo("lx", e.target.value)}
                />
              </div>
              <div>
                <div className="field__row">
                  <span className="field__label">Ancho (Ly)</span>
                  <span className="field__unit">m</span>
                </div>
                <input
                  className={`field__input${errores.ly ? " field__input--error" : ""}`}
                  type="text"
                  inputMode="decimal"
                  value={campos.ly}
                  onChange={(e) => actualizarCampo("ly", e.target.value)}
                />
              </div>
            </div>
            {errores.lx && <div className="field__error">▲ {errores.lx}</div>}
            {errores.ly && <div className="field__error">▲ {errores.ly}</div>}
          </div>
        )}
      </div>

      <div className="live-box">
        <div className="live-box__title">Cálculo en vivo</div>
        <div className="live-box__row">
          <span className="live-box__label">Masa superficial m&apos;</span>
          <span className="live-box__value">{m === null ? "—" : `${formatInt(m)} kg/m²`}</span>
        </div>
        <div className="live-box__row">
          <span className="live-box__label">Frec. crítica fc</span>
          <span className="live-box__value live-box__value--accent">
            {fc === null ? "—" : `${formatInt(fc)} Hz`}
          </span>
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={!puedeCalcular || loading}>
        {loading ? "Calculando…" : "Calcular"}
      </button>
    </form>
  );
}
