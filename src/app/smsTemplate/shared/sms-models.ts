// sms-models.ts

// ===== Backend dynamic query =====
export type VariableKey =
  | 'nombre'
  | 'baja30'
  | 'saldoMora'
  | 'deudaTotal';

// Petición al backend (swagger que venimos usando)
export interface DynamicQueryRequest {
  variables: VariableKey[];   // p.ej. ['nombre','baja30','deudaTotal']
  tramos?: number[];          // [3] o [3,5]
  diasVenc?: number[];        // [1,3,5,15]
  onlyLtde?: boolean;         // true => LTDE; false => LTD; undefined => ambos
  excluirPromesas?: boolean;
  excluirCompromisos?: boolean;
  excluirBlacklist?: boolean;
  limitPreview?: number;      // default 1
  templateName?: string;      // opcional
}

export interface DynamicPreviewResponse {
  values: Record<string, any>;  // ej: { nombre:'Jose', baja30: 123, deudaTotal: 456 }
  previewText?: string;         // mensaje renderizado si se indicó templateName
}

// ===== UI (chips) =====
export interface VariableChoice {
  key: VariableKey;
  label: string;
  description?: string;
}

// Lista que muestra la UI para seleccionar variables
export const ALL_VARIABLES: ReadonlyArray<VariableChoice> = [
  { key: 'nombre',     label: 'Nombre' },
  { key: 'baja30',     label: 'Baja 30' },
  { key: 'saldoMora',  label: 'Saldo Mora' },
  { key: 'deudaTotal', label: 'Deuda Total' },
];

// ===== (Opcional) Catálogo de variables del backend =====
// Úsalo sólo si realmente necesitas describir tipos de variables que vienen de BD.
// Si no lo usas, elimínalo para no confundir.
export type VarType = 'text' | 'number' | 'date';
export interface BackendVariableDef {
  name: string;           // ej. 'deudaTotal'
  type: VarType;          // ej. 'number'
  description?: string;
  example?: string | number;
}

// ===== (Opcional) Plantillas “humanas” para UI, no usado en el swagger =====
export interface TemplateDef {
  id: string;
  name: string;
  requiredVars: string[];
  conditions?: string[];
  text: string;
  count?: number;
}
