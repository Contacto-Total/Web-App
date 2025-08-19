export interface RangoRequest {
    min: string;
    max: string;
}

export interface CampañaYReporteRequest {
    contactoDirectoRangos: RangoRequest[];
    contactoIndirectoRangos: RangoRequest[];
    promesasRotasRangos: RangoRequest[];
    noContactadoRangos: RangoRequest[];
}