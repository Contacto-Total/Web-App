export interface ComboResponse {
  id: number;
  name: string;
  descripcion?: string | null;
  plantillaSmsId: number;
  plantillaTexto?: string | null;
  selects: string[];
  tramo: '3' | '5';
  condiciones: string[];
  restricciones: {
    noContenido: boolean;
    excluirPromesasPeriodoActual: boolean;
    excluirCompromisos: boolean;
    excluirBlacklist: boolean;
  };

  isActive: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  importeExtra?: number | null;
}
