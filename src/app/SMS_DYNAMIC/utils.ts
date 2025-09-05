export function fmtFecha(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

function normalizeToken(s: string) {
  return s
    .trim()
    .toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
}

/** Rellena la plantilla con valores de la fila + {HOY}/{MANANA} */
export function renderPreviewMessage(tpl: string, row: Record<string, any>) {
  if (!tpl) return '';
  const dict: Record<string, string> = {
    HOY: fmtFecha(new Date()),
    MANANA: fmtFecha(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  };
  for (const [k, v] of Object.entries(row || {})) {
    dict[normalizeToken(k)] = String(v ?? '');
  }
  if (!dict['MORA'] && dict['SALDO_MORA']) dict['MORA'] = dict['SALDO_MORA'];
  if (!dict['BAJA30'] && dict['BAJA_30'])   dict['BAJA30'] = dict['BAJA_30'];

  return tpl.replace(/\{([^}]+)\}/g, (_, raw) => {
    const key = normalizeToken(raw);
    return key in dict ? dict[key] : `{${raw}}`;
  });
}

export function smsSegmentsLen(text: string) {
  const n = (text || '').length;
  if (n === 0) return { chars: 0, segs: 0 };
  if (n <= 160) return { chars: n, segs: 1 };
  return { chars: n, segs: Math.ceil(n / 153) };
}
