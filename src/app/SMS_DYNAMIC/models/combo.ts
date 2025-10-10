// models/combo.ts
export interface RangeDto {
  field: string;
  min?: number;
  max?: number;
  inclusiveMin?: boolean;
  inclusiveMax?: boolean;
}

export interface ComboCreateRequest {
  name: string;
  descripcion: string;
  tramo: '3' | '5';
  selects: string[];
  condiciones: string[];
  restricciones: {
    noContenido: boolean;
    excluirPromesasPeriodoActual: boolean;
    excluirCompromisos: boolean;
    excluirBlacklist: boolean;
  };
  plantillaTexto: string;
  plantillaName?: string;
  importeExtra?: number | null;
  rangos?: RangeDto[];   // ✅ aquí sí
}
