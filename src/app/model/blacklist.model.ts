export interface BlacklistRequest {
    empresa: string;
    cartera: string;
    subcartera: string;
    documento: string;
    fechaFin: string;
    entidad: string;
}

export interface BlacklistResponse {
    empresa: string;
    cartera: string;
    subcartera: string;
    documento: string;
    email: string;
    telefono: string;
    fechaInicio: string;
    fechaFin: string;
}