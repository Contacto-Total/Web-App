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
    plantillaTexto: string;   // el sms con placeholders {LTD} etc.
    plantillaName?: string;   // opcional, si quieres sobreescribir nombre
    importeExtra?: number | null;
  }

