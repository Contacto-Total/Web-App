export interface CreatePaymentAgreementRequest {
  fechaActual: string,
  nombreTitular: string,
  dni: string,
  cuentaTarjeta: string,
  fechaCompromiso: string,
  deudaTotal: number,
  descuento: number,
  montoAprobado: number,
  formasDePago: string[]
}