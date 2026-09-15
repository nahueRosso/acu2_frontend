"use client";

interface Props {
  variant: "vacio" | "calculando" | "error";
  nBandas?: number;
  nModelos?: number;
  mensaje?: string;
}

export default function StateBox({ variant, nBandas = 31, nModelos, mensaje }: Props) {
  if (variant === "calculando") {
    return (
      <div className="state-box">
        <div className="spinner" />
        <div className="state-box__body mono">
          Resolviendo {nBandas} bandas × {nModelos ?? "N"} modelos…
        </div>
        <div className="progress-indeterminate" />
      </div>
    );
  }

  if (variant === "error") {
    return (
      <div className="state-box state-box--error">
        <div className="state-box__icon">▲</div>
        <div className="state-box__title">Entrada inválida</div>
        <div className="state-box__body">{mensaje ?? "Revisá los campos marcados en el formulario."}</div>
      </div>
    );
  }

  return (
    <div className="state-box">
      <div className="state-box__icon mono">R</div>
      <div className="state-box__title">Todavía no hay resultados</div>
      <div className="state-box__body">
        Completá las propiedades del material en el panel izquierdo — o elegilo de la base de datos — y
        presioná <strong>Calcular</strong> para trazar las curvas de R.
      </div>
    </div>
  );
}
