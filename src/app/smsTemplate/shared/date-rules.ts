/** Normaliza placeholders de una plantilla a claves lower-case sin espacios */
export function extractVarsFromTemplate(tpl: string): string[] {
  const re = /\{([^}]+)\}/g;
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(tpl)) !== null) {
    out.add(normalizeVar(m[1]));
  }
  return [...out];
}

/** nombre -> nombre | baja30 | saldomora | deudatotal */
export function normalizeVar(v: string): string {
  const x = v.toLowerCase().replace(/\s+/g, '');
  if (x === 'baja30' || x === 'baja_30') return 'baja30';
  if (x === 'saldomora' || x === 'saldo_mora') return 'saldomora';
  if (x === 'deudatotal' || x === 'deuda_total') return 'deudatotal';
  if (x === 'nombre') return 'nombre';
  if (x === 'dia') return 'dia'; // especial, no chip
  return x;
}

/** Días fijos del negocio */
const DIAS_FIJOS = [1, 3, 5, 15, 25];

/** Aplica regla ±2 días alrededor del hoy y devuelve los días fijos válidos */
export function calcDiasVencParaHoy(date = new Date()): number[] {
  const hoy = date.getDate();
  const dentroVentana = (d: number) => Math.abs(d - hoy) <= 2;
  return DIAS_FIJOS.filter(dentroVentana);
}

/** Selección de días según variables elegidas */
export function calcDiasVencPorVariables(vars: string[], date = new Date()): number[] | undefined {
  const norm = vars.map(v => normalizeVar(v));
  const hasBaja30   = norm.includes('baja30');
  const hasSaldomora= norm.includes('saldomora');
  const ventana = calcDiasVencParaHoy(date);

  if (hasSaldomora && !hasBaja30) {
    // SALDO MORA -> solo días dentro de ventana
    return ventana;
  }
  if (hasBaja30 && !hasSaldomora) {
    // BAJA 30 -> todos menos los de la ventana
    return DIAS_FIJOS.filter(d => !ventana.includes(d));
  }
  // si ambas o ninguna, no forzamos días
  return undefined;
}


/** Helper: hoy (número día) como string */
export function hoyNumero(): string {
  return String(new Date().getDate());
}

/** ¿Incluye BAJA 30 o SALDO MORA en las variables? */
export function fuerzaTramo3(vars: string[]): boolean {
  const s = new Set(vars.map(v => normalizeVar(v)));
  return s.has('baja30') || s.has('saldomora');
}
