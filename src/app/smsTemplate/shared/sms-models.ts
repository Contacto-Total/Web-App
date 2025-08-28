export type VariableKey = 'nombre' | 'baja30' | 'saldoMora' | 'deudaTotal';

export interface TemplateDef {
  id: number | string;
  name: string;
  template: string;     // texto desde tu BD
}

export interface DynamicQueryRequest {
  variables: VariableKey[];
  tramos?: number[];
  diasVenc?: number[];
  onlyLtde?: boolean;            // (no lo usaremos por ahora, pero lo dejamos)
  excluirPromesas?: boolean;
  excluirCompromisos?: boolean;
  excluirBlacklist?: boolean;
  templateName?: string;         // opcional
  limitPreview?: number;         // default: 1
}

export interface DynamicPreviewResponse {
  values: Record<string, any>;
  previewText?: string;
}

/** catálogo de chips visibles en UI */
export interface VariableChoice {
  key: VariableKey;
  label: string;
}

export const ALL_VARIABLES: VariableChoice[] = [
  { key: 'nombre',     label: 'Nombre' },
  { key: 'baja30',     label: 'BAJA 30' },
  { key: 'saldoMora',  label: 'SALDO MORA' },
  { key: 'deudaTotal', label: 'DEUDA TOTAL' },
];

