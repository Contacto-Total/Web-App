import { Component, inject, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { DynQueryService } from '../../services/dyn-query.service';
import { DynamicQueryRequest, Row } from '../../models/dyn-query';
import { ToolbarComponent } from '@/shared/components/toolbar/toolbar.component';
import { ComboService } from '../../services/combo.service';
import { ComboCreateRequest } from '../../models/combo';
import { Router } from '@angular/router';
import {AlertDialogComponent} from "@/SMS_DYNAMIC/Common/alert-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {finalize} from "rxjs";
import {LoadingDialogComponent} from "@/SMS_DYNAMIC/Common/loading-dialog/loading-dialog.component";
import { debounceTime, map, distinctUntilChanged, startWith } from 'rxjs/operators';
import { computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SuccessDialogComponent } from '@/SMS_DYNAMIC/Common/success-dialog.component';
import {RoundWizardDialogComponent} from "@/SMS_DYNAMIC/Common/round-wizard-dialog.component";


const VAR_PATTERN_I = /\{([A-Z0-9_]+)\}/gi;
const VAR_PATTERN = /\{([A-Z0-9_]+)\}/g;
type VarChip = { key: string; label: string; affectsSelects: boolean };
type VarGroup = { key: 'cliente' | 'financiero' | 'fechas'; title: string; items: VarChip[] };
@Component({
  selector: 'app-dyn-query-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTableModule,
    ToolbarComponent
  ],
  templateUrl: './dyn-query-page.component.html',
  styleUrl: './dyn-query-page.component.css'
})

export class DynQueryPageComponent implements OnInit {
  private api = inject(DynQueryService);
  private comboApi = inject(ComboService);
  private router = inject(Router);
  sampleRow = signal<Row|null>(null);

  @ViewChild('tplArea') tplArea?: ElementRef<HTMLTextAreaElement>;

  /** Inserta texto en la posición del cursor del textarea (o al final si no hay ref). */
  private insertAtCursor(text: string) {
    const ctrl = this.form.controls.plantillaTexto;
    const el = this.tplArea?.nativeElement;

    // Fallback: si no hay ref aún, agrega al final como antes
    if (!el) {
      const cur = ctrl.value ?? '';
      const sep = cur && !cur.endsWith(' ') ? ' ' : '';
      ctrl.setValue(cur + sep + text);
      ctrl.markAsDirty();
      return;
    }

    const val = ctrl.value ?? '';
    const start = el.selectionStart ?? val.length;
    const end   = el.selectionEnd ?? start;

    const before = val.slice(0, start);
    const after  = val.slice(end);

    const needsSpaceBefore = before.length && !/\s$/.test(before);
    const insert = (needsSpaceBefore ? ' ' : '') + text;

    const next = before + insert + after;
    ctrl.setValue(next);
    ctrl.markAsDirty();

    // Deja el cursor justo después del token
    const caret = (before + insert).length;
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = caret;
    }, 0);
  }


  private selects = new Set<string>();
  private condiciones = new Set<string>(); // solo PROMESAS_* visibles



  // GRUPOS
  chipGroups: VarGroup[] = [
    {
      key: 'cliente',
      title: 'Cliente',
      items: [
        { key: 'NOMBRE',         label: 'Nombre',           affectsSelects: true },
        { key: 'NOMBRECOMPLETO', label: 'Nombre completo',  affectsSelects: true },
        { key: 'EMAIL',          label: 'Correo',           affectsSelects: true },
        { key: 'NUMCUENTAPMCP',  label: 'N° de Cuenta',     affectsSelects: true },
      ]
    },
    {
      key: 'financiero',
      title: 'Financiero',
      items: [
        { key: 'LTD',              label: 'LTD',                    affectsSelects: true },
        { key: 'LTDE',             label: 'LTDE',                   affectsSelects: true },
        { key: 'LTD_LTDE',         label: 'LTD y LTDE',             affectsSelects: true },
        { key: 'BAJA30',           label: 'Baja 30',                affectsSelects: true },
        { key: 'MORA',             label: 'Saldo Mora',             affectsSelects: true },
        { key: 'BAJA30_SALDOMORA', label: 'Baja 30 y Saldo Mora',   affectsSelects: true },
        { key: 'PKM',              label: 'PKM',                    affectsSelects: true },
        { key: 'CAPITAL',          label: 'Capital',                affectsSelects: true },
        { key: 'DEUDA_TOTAL',      label: 'Deuda Total',            affectsSelects: true },
      ]
    },
    {
      key: 'fechas',
      title: 'Fechas',
      items: [
        { key: 'DIASMORA', label: 'Días mora', affectsSelects: true },
        { key: 'HOY',      label: 'Hoy',       affectsSelects: false },
        { key: 'MANANA',   label: 'Mañana',    affectsSelects: false },
      ]
    }
  ];

// (compat) si aún usas 'chips' en algún lado, lo dejamos como flatten:
  chips = this.chipGroups.flatMap(g => g.items);

  // estado visual de selección
  selectedChips = new Set<string>();

  isSelected(key: string) { return this.selectedChips.has(key); }

  // --- ALIAS de columnas que pueden venir con espacios/underscore ---
  private aliasKeys(raw: string): string[] {
    const k = raw.toUpperCase();
    switch (k) {
      case 'MORA':
      case 'SALDO_MORA':
        return ['SALDO_MORA', 'MORA', 'SALDO MORA'];

      case 'BAJA30':
        return ['BAJA30', 'BAJA_30', 'BAJA 30'];

      case 'BAJA30_SALDOMORA':
        return ['BAJA30_SALDOMORA', 'BAJA30_SALDO_MORA', 'BAJA 30 SALDO MORA'];

      case 'DEUDA_TOTAL':
        return ['DEUDA_TOTAL', 'DEUDA TOTAL'];

      case 'LTD_LTDE':
        return ['LTD_LTDE', 'LTD+LTDE', 'LTD LTDE'];

      case 'NOMBRECOMPLETO':
        return ['NOMBRECOMPLETO', 'NOMBRE COMPLETO'];

      case 'EMAIL':
        return ['EMAIL'];

      case 'NUMCUENTAPMCP':
        return ['NUMCUENTAPMCP', 'NUMCUENTA_PMCP', 'NUM_CUENTA_PMCP', 'NUMCUENTA PMCP', 'N° CUENTA PMCP'];

      case 'DIASMORA':
        return ['DIASMORA', 'DIAS_MORA', 'DIAS MORA'];

      default:
        return [k, k.replace(/\s+/g, '_')];
    }
  }

  // Normaliza nombre de variable de plantilla a su “familia” base
  private mapVar(key: string): string {
    const k = key.toUpperCase();
    if (k === 'MORA') return 'SALDO_MORA';
    return k;
  }

  // Obtiene el valor probando alias
  private getVal(r: Record<string, any>, key: string): any {
    const candidates = this.aliasKeys(this.mapVar(key));
    for (const c of candidates) {
      if (r.hasOwnProperty(c)) return r[c];
    }
    return undefined;
  }

  // Reglas de “valor significativo” (usa getVal + alias)
  private hasMeaningfulValue(row: Record<string, any>, col: string): boolean {
    const v = this.getVal(row, col);
    if (v === null || v === undefined) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    if (typeof v === 'number') return v > 0;
    return true;
  }

  private requiredColumnsForPreview(): string[] {
    const fromChips = Array.from(this.selects);
    const tpl = this.form.controls.plantillaTexto.value ?? '';
    const fromTpl = (tpl.match(VAR_PATTERN) || []).map((m: string) => m.slice(1, -1));

    const all = Array.from(new Set([...fromChips, ...fromTpl])).map(k => this.mapVar(k));

    const candidates = new Set([
      'LTD', 'LTDE', 'LTD_LTDE', 'BAJA30', 'SALDO_MORA',
      'BAJA30_SALDOMORA', 'CAPITAL', 'DEUDA_TOTAL', 'PKM'
    ]);

    // Requeridas: solo las “numéricas/negocio” que marcaste por chip
    return Array.from(new Set(fromChips.map(k => this.mapVar(k))))
      .filter(k => candidates.has(k));
  }

  private preferredColumnsForPreview(): string[] {
    const tpl = this.form.controls.plantillaTexto.value ?? '';
    const fromTpl = (tpl.match(VAR_PATTERN) || []).map((m: string) => this.mapVar(m.slice(1, -1)));
    const req = new Set(this.requiredColumnsForPreview());
    return Array.from(new Set(fromTpl.filter(k => !req.has(k))));
  }

  // === NUEVO: selecciona la “mejor” fila con dos pasos ===
  private pickBestRow(
    rows: Row[],
    required: string[],
    preferred: string[],
  ): Row | null {
    const R = rows as Record<string, any>[];

    // A) filas que cumplen TODAS las requeridas
    const full = R.filter(r => required.every(c => this.hasMeaningfulValue(r, c)));
    if (full.length) {
      // de esas, la que cumple más “preferred”
      full.sort((a, b) => {
        const sa = preferred.reduce((acc, c) => acc + (this.hasMeaningfulValue(a, c) ? 1 : 0), 0);
        const sb = preferred.reduce((acc, c) => acc + (this.hasMeaningfulValue(b, c) ? 1 : 0), 0);
        return sb - sa;
      });
      return full[0] as Row;
    }

    // B) si no hay ninguna “perfecta”, tomar la que más requeridas cumple
    let best: Row | null = null;
    let bestReq = -1;
    let bestPref = -1;

    for (const r of R) {
      const reqCount = required.reduce((acc, c) => acc + (this.hasMeaningfulValue(r, c) ? 1 : 0), 0);
      const prefCount = preferred.reduce((acc, c) => acc + (this.hasMeaningfulValue(r, c) ? 1 : 0), 0);

      if (
        reqCount > bestReq ||
        (reqCount === bestReq && prefCount > bestPref)
      ) {
        best = r as Row;
        bestReq = reqCount;
        bestPref = prefCount;
      }
    }
    return best ?? (rows[0] ?? null);
  }


// Toggle visual + lógica (insertar solo al seleccionar)
  toggleChip(key: string, affectsSelects = true) {
    const wasActive = this.selectedChips.has(key);

    if (wasActive) {
      // Quitar selección normal
      this.selectedChips.delete(key);
      if (affectsSelects) this.selects.delete(key);
      this.removePlaceholder(key);
    } else {
      // 🔒 Reglas de exclusión existentes (BAJA30/MORA ↔ BAJA30_SALDOMORA)
      if (key === 'BAJA30' || key === 'MORA') {
        if (this.selectedChips.has('BAJA30_SALDOMORA')) {
          this.selectedChips.delete('BAJA30_SALDOMORA');
          this.selects.delete('BAJA30_SALDOMORA');
          this.removePlaceholder('BAJA30_SALDOMORA');
        }
      }
      if (key === 'BAJA30_SALDOMORA') {
        if (this.selectedChips.has('BAJA30')) {
          this.selectedChips.delete('BAJA30');
          this.selects.delete('BAJA30');
          this.removePlaceholder('BAJA30');
        }
        if (this.selectedChips.has('MORA')) {
          this.selectedChips.delete('MORA');
          this.selects.delete('MORA');
          this.removePlaceholder('MORA');
        }
      }

      // 🔒 NUEVO: Reglas de exclusión para LTD / LTDE ↔ LTD_LTDE
      if (key === 'LTD' || key === 'LTDE') {
        this.forceDeselect('LTD_LTDE');
      }
      if (key === 'LTD_LTDE') {
        this.forceDeselect('LTD');
        this.forceDeselect('LTDE');
      }

      // Selección normal
      this.selectedChips.add(key);
      if (affectsSelects) this.selects.add(key);
      this.insertPlaceholderOnce(key);
    }

    if (!this.hasTopUpSelect()) {
      this.form.controls.importeExtra.setValue(0);
    }
    this.fetchSampleRow();
  }



  previewText = computed(() => {
    const tpl = this.tplSig();
    const row = this.sampleRow();
    return this.renderTemplate(tpl, row);
  });

  // 1) Helper: normaliza claves del row
  private normalizeRow(row: any): Record<string, any> {
    const out: Record<string, any> = {};
    Object.keys(row || {}).forEach(k => {
      const key = k.replace(/\s+/g, '_').toUpperCase(); // ej: 'deuda total' -> 'DEUDA_TOTAL'
      out[key] = (row as any)[k];
    });
    return out;
  }

  // 2) Pide la fila de muestra con fallback y normalización
  private fetchSampleRow() {
    // En modo AUTO: dispara la vista previa inmediatamente (como antes)
    if (this.previewMode() === 'auto') {
      this.triggerPreview();
    }
    // En modo MANUAL: no hace nada; quedará el indicador de "cambios sin aplicar"
  }




  private renderTemplate(tpl: string, row: Row | null): string {
    if (!tpl) return '';
    if (!row) return tpl;

    const r = this.normalizeRow(row as any);

    const firstName = (s: any) => String(s ?? '').trim().split(/\s+/)[0] || '';
    const fmtInt = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.trunc(n).toLocaleString('es-PE') : '';
    };
    const hoy = new Date();
    const manana = new Date(hoy.getTime() + 24 * 60 * 60 * 1000);
    const fmtDate = (d: Date) =>
      d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit'});

    return tpl.replace(VAR_PATTERN, (_m, key: string) => {
      switch (key) {
        case 'NOMBRE': return firstName(this.getVal(r, 'NOMBRE'));
        case 'HOY':    return fmtDate(hoy);
        case 'MANANA': return fmtDate(manana);

        // numéricas esperadas (todas pasan por getVal para soportar alias)
        case 'DIASMORA':
        case 'LTD':
        case 'LTDE':
        case 'LTD_LTDE':
        case 'BAJA30':
        case 'SALDO_MORA':
        case 'BAJA30_SALDOMORA':
        case 'CAPITAL':
        case 'DEUDA_TOTAL':
        case 'PKM':
          return fmtInt(this.getVal(r, key));

        default:
          const v = this.getVal(r, key);
          return v === undefined ? '' : String(v);
      }
    });
  }

  private expandWithAliases(keys: string[]): string[] {
    const out = new Set<string>();
    keys.forEach(k => this.aliasKeys(k).forEach(a => out.add(a)));
    return Array.from(out);
  }

  ngOnInit() {
    // ➊ stream con lo que afecta al sample
    const form$ = this.form.valueChanges.pipe(
      startWith(this.form.getRawValue()),
      debounceTime(300),
      map(v => ({
        tramo: v.tramo,
        importeExtra: v.importeExtra,
        plantillaTexto: v.plantillaTexto,
        // convierto tu Set a array estable
        selects: Array.from(this.selects),
        condiciones: Array.from(this.condiciones),
      })),
      // evita llamadas si no cambia nada importante
      distinctUntilChanged((a,b) => JSON.stringify(a) === JSON.stringify(b)),
    );

    form$.subscribe(() => {
      this.syncChipsWithTemplate();
      if (this.previewMode() === 'auto') this.triggerPreview();
    });


    this.form.controls.plantillaTexto.valueChanges
      .pipe(debounceTime(200))
      .subscribe(() => {
        this.syncChipsWithTemplate();
        if (this.previewMode() === 'auto') this.triggerPreview();
      });

    // primera carga
    this.syncChipsWithTemplate();
    if (this.previewMode() === 'auto') this.triggerPreview();
  }

  // Inserta {KEY} una sola vez
  private insertPlaceholderOnce(key: string) {
    const ctrl = this.form.controls.plantillaTexto;
    const cur = ctrl.value ?? '';
    const re = new RegExp(`\\{${key}\\}(?!\\w)`, 'i'); // respeta tu lógica anterior
    if (re.test(cur)) return;
    this.insertAtCursor(`{${key}}`);
  }

  private hasTopUpSelect(): boolean {
    return (
      this.selectedChips.has('LTD') ||
      this.selectedChips.has('LTDE') ||
      this.selectedChips.has('LTD_LTDE')
    );
  }

  form = inject(FormBuilder).nonNullable.group({
    tramo: '3' as '3' | '5',
    noContenido: false,
    excluirPromesasPeriodoActual: true,
    excluirCompromisos: true,
    excluirBlacklist: true,
    limit: 1000,

    // estos tres siguen siendo string
    nombre: inject(FormBuilder).nonNullable.control<string>(''),
    plantillaTexto: inject(FormBuilder).nonNullable.control<string>(''),
    descripcion: inject(FormBuilder).nonNullable.control<string>(''),

    // 👇 TIPAR COMO NÚMERO
    importeExtra: inject(FormBuilder).nonNullable.control<number>(0),
  });

  tplSig = toSignal(
    this.form.controls.plantillaTexto.valueChanges.pipe(
      startWith(this.form.controls.plantillaTexto.value ?? '')
    ),
    { initialValue: this.form.controls.plantillaTexto.value ?? '' }
  );

  rows = signal<Row[]>([]);
  cols = signal<string[]>([]);

  // change de checkbox con inserción solo al marcar
  onSelectChange(ev: Event, key: string) {
    const input = ev.target as HTMLInputElement;
    if (input.checked) {
      this.selects.add(input.value);
      this.insertPlaceholder(key);
    } else {
      this.selects.delete(input.value);
      this.removePlaceholder(key);
    }
  }

  // change de condiciones (solo PROMESAS)
  toggleCond(ev: Event, key: 'PROMESAS_HOY'|'PROMESAS_MANANA'|'PROMESAS_MANANA2'|'PROMESAS_ROTAS') {
    const input = ev.target as HTMLInputElement;
    if (input.checked) this.condiciones.add(key);
    else this.condiciones.delete(key);
    this.fetchSampleRow();
  }

  private buildBody(limitForPreview: boolean): DynamicQueryRequest {
    const v = this.form.getRawValue();

    // base desde chips (normalizando MORA -> SALDO_MORA)
    let selects = Array.from(this.selects)
      .map(s => (s === 'MORA' ? 'SALDO_MORA' : s));

    const PROMESAS = new Set(['PROMESAS_HOY','PROMESAS_MANANA','PROMESAS_MANANA2','PROMESAS_ROTAS']);
    const condiciones = Array.from(this.condiciones).filter(c => PROMESAS.has(c));

    // añade variables que están escritas en el texto y que afectan selects
    const tokens = Array.from(this.extractTokens());
    const fromText = tokens.filter(t => this.affectsMap.get(t));
    selects = Array.from(new Set([...selects, ...fromText]));

    const importeExtraAplica =
      this.hasTopUpSelect() && Number(v.importeExtra) > 0
        ? Math.trunc(Number(v.importeExtra))
        : null;

    return {
      selects,
      tramo: v.tramo,
      condiciones,
      restricciones: {
        noContenido: !!v.noContenido,
        excluirPromesasPeriodoActual: !!v.excluirPromesasPeriodoActual,
        excluirCompromisos: !!v.excluirCompromisos,
        excluirBlacklist: !!v.excluirBlacklist,
      },
      limit: limitForPreview ? Number(v.limit || 1000) : undefined,
      importeExtra: importeExtraAplica,
    } as any;
  }


  ejecutar() {
    const body = this.buildBody(true);
    this.api.run(body).subscribe(rs => {
      this.rows.set(rs);
      this.cols.set(rs.length ? Object.keys(rs[0]) : []);
    });
  }

  private matDialog = inject(MatDialog);

  // helper para mostrar pop-up
  private alert(message: string, title = 'Aviso') {
    this.matDialog.open(AlertDialogComponent, {
      width: '420px',
      data: { title, message }
    });
  }

  /** Borra claves que el backend no quiere ver si están null/undefined */
  private compactQuery<T extends Record<string, any>>(q: T): T {
    const c: any = { ...q };
    if (c.limit == null) delete c.limit;
    if (c.importeExtra == null) delete c.importeExtra;
    delete c.plantillaTexto;
    return c;
  }


  exportar() {
    const rawQuery = this.buildBody(false);
    const query = this.compactQuery(rawQuery);           // base limpia
    const queryAll = { ...query, selectAll: true };      // ✅ TODAS las columnas en pruebas
    const template = (this.form.controls.plantillaTexto.value ?? '').trim();
    if (!template) {
      this.alert('Ingresa un texto de SMS antes de exportar.', 'Falta texto');
      return;
    }

    const dlg = this.matDialog.open(LoadingDialogComponent, {
      disableClose: true,
      data: { title: 'Generando Excel…', subtitle: 'Preparando datos y creando archivo' },
      panelClass: 'loading-dialog-panel',
      backdropClass: 'blur-dialog-backdrop',
      width: '320px',       // Opcional: 280–320 queda bien
      autoFocus: false
    });

    // ✅ Precheck usando TODAS las columnas
    this.api.precheck(queryAll as any, template).subscribe({
      next: (res) => {
        if (!res.ok) {
          dlg.close();
          const header = `${res.excedidos} ${res.excedidos === 1 ? 'fila' : 'filas'} superan ${res.limite} caracteres.`;
          const ejemplosTxt = (res.ejemplos ?? [])
            .map((e) => `• ${e.len} caracteres — DNI: ${e.documento || '(sin DNI)'}`)
            .join('\n');
          this.alert(`${header}\n\nPrimeros ${Math.min((res.ejemplos ?? []).length, 3)} casos:\n${ejemplosTxt}`, 'Mensaje demasiado largo');
          return;
        }

        // ✅ Export también con TODAS las columnas
        this.api.export(queryAll, template)
          .pipe(finalize(() => dlg.close()))
          .subscribe({
            next: (blob) => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `sms report ${new Date().toISOString().slice(0, 10)}.xlsx`;
              document.body.appendChild(a); a.click(); a.remove();
              URL.revokeObjectURL(url);
              this.showSuccess('Exportación exitosa', 'Tu archivo se generó correctamente.').subscribe();
            },
            error: (err) => {
              const msg =
                err?.status === 422
                  ? (err?.error?.message || 'No hay filas para exportar con los filtros seleccionados.')
                  : (err?.error?.message || err?.message || 'Ocurrió un error al exportar.');
              this.alert(msg, err?.status === 422 ? 'Sin resultados' : 'Error');
            }
          });
      },
      error: (err) => {
        dlg.close();
        const msg = err?.error?.message || err?.message || 'No se pudo validar el SMS.';
        this.alert(msg, 'Error en precheck');
      }
    });
  }




  // inserta {KEY} al final del textarea
  insertPlaceholder(key: string) {
    this.insertAtCursor(`{${key}}`);
  }

  guardarCombo() {
    const v = this.form.getRawValue();
    const importeExtraAplica =
      this.hasTopUpSelect() && Number(v.importeExtra) > 0
        ? Math.trunc(Number(v.importeExtra))
        : null;

    const payload: ComboCreateRequest = {
      name: v.nombre,
      plantillaName: v.nombre,
      descripcion: v.descripcion,
      tramo: v.tramo,
      selects: Array.from(this.selects),
      condiciones: Array.from(this.condiciones),
      restricciones: {
        noContenido: !!v.noContenido,
        excluirPromesasPeriodoActual: !!v.excluirPromesasPeriodoActual,
        excluirCompromisos: !!v.excluirCompromisos,
        excluirBlacklist: !!v.excluirBlacklist
      },
      // crea también la plantilla si viene el texto
      plantillaTexto: v.plantillaTexto,
      importeExtra: importeExtraAplica,
    };

    this.comboApi.createCombo(payload).subscribe({
      next: (_id) => {
        // reset suave (tal cual lo tenías)
        this.form.reset({
          tramo: '3',
          excluirPromesasPeriodoActual: true,
          excluirCompromisos: true,
          excluirBlacklist: true,
          limit: 1000,
          nombre: '',
          plantillaTexto: '',
          descripcion: ''
        });
        this.selects.clear();
        this.condiciones.clear();
        this.rows.set([]);
        this.cols.set([]);

        // ✅ dialog bonito + navegar
        this.showSuccess('Guardado', 'El combo se guardó correctamente.')
          .subscribe(() => this.router.navigate(['/List-sms']));
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'No se pudo guardar el combo.';
        this.alert(msg, 'Error');
      }
    });


  }

  Cancel() {
    this.router.navigate(['/List-sms']);
  }

  protected readonly Math = Math;


  // Borra {KEY} del textarea (todas las apariciones) y limpia espacios
  private removePlaceholder(key: string) {
    const ctrl = this.form.controls.plantillaTexto;
    const cur = ctrl.value ?? '';

    // Coincide exactamente {KEY} (no afecta {KEY_ALGO} porque cerramos con })
    const re = new RegExp(`\\{${key}\\}`, 'g');

    // quita tokens, colapsa espacios y bordes
    let next = cur.replace(re, '');
    next = next.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim();

    if (next !== cur) {
      ctrl.setValue(next);
      ctrl.markAsDirty();
    }
  }

  private showSuccess(title: string, message?: string, ms = 1800) {
    return this.matDialog.open(SuccessDialogComponent, {
      data: { title, message, autoCloseMs: ms },
      panelClass: 'dialog-success',
      disableClose: true
    }).afterClosed();
  }

  private forceDeselect(key: string, affectsSelects = true) {
    if (!this.selectedChips.has(key)) return;
    this.selectedChips.delete(key);
    if (affectsSelects) this.selects.delete(key);
    this.removePlaceholder(key);
  }

  isChipDisabled(key: string): boolean {
    // si ya está activo (por chip o por token en texto), no deshabilites
    if (this.isActive(key)) return false;

    // LTD/LTDE ↔ LTD_LTDE
    if (key === 'LTD_LTDE') return this.isActive('LTD') || this.isActive('LTDE');
    if (key === 'LTD' || key === 'LTDE') return this.isActive('LTD_LTDE');

    // BAJA30/MORA ↔ BAJA30_SALDOMORA
    if (key === 'BAJA30_SALDOMORA') return this.isActive('BAJA30') || this.isActive('MORA');
    if (key === 'BAJA30' || key === 'MORA') return this.isActive('BAJA30_SALDOMORA');

    return false;
  }

  private tokensInText = signal<Set<string>>(new Set());

  // mapa de si un chip afecta selects (sale de tu definición de grupos)
  private affectsMap = new Map<string, boolean>(
    this.chipGroups.flatMap(g =>
      g.items.map(i => [this.mapVar(i.key), i.affectsSelects !== false] as [string, boolean])
    )
  );

  // extrae {TOKENS} del textarea normalizados (MORA -> SALDO_MORA)
  private extractTokens(): Set<string> {
    const tpl = this.form.controls.plantillaTexto.value ?? '';
    const ks = (tpl.match(VAR_PATTERN) || []).map(m => this.mapVar(m.slice(1, -1)));
    return new Set(ks);
  }

// sincroniza chips/sets con el contenido del textarea
  private syncChipsWithText() {
    const tokens = this.extractTokens();
    this.tokensInText.set(tokens);

    // podas automáticas: si ya no está el token, des-selecciona
    for (const k of Array.from(this.selectedChips)) {
      const norm = this.mapVar(k);
      const affects = this.affectsMap.get(norm) ?? true;
      if (affects && !tokens.has(norm)) {
        this.selectedChips.delete(k);
        // ojo con el mapeo MORA -> SALDO_MORA en selects
        this.selects.delete(k === 'MORA' ? 'SALDO_MORA' : k);
      }
    }
  }

  // “activo” si está seleccionado o si el token existe en el texto
  isActive(key: string): boolean {
    return this.selectedChips.has(key) || this.tokensInText().has(this.mapVar(key));
  }

  // devuelve el meta del chip
  private chipMeta(key: string) {
    for (const g of this.chipGroups) {
      const f = g.items.find(i => i.key === key);
      if (f) return f;
    }
    return undefined;
  }
  private affectsSelects(key: string) {
    return this.chipMeta(key)?.affectsSelects !== false;
  }

  /** Mantiene chips y selects en sincronía con lo que realmente hay escrito en el textarea */
  private syncChipsWithTemplate() {
    const tpl = this.form.controls.plantillaTexto.value ?? '';

    const tokens = new Set<string>();
    for (const m of tpl.matchAll(VAR_PATTERN_I)) tokens.add(String(m[1]).toUpperCase());

    if (tokens.has('SALDO_MORA')) tokens.add('MORA');
    if (tokens.has('MORA'))      tokens.add('SALDO_MORA');

    // 🔁 mantener señal sincronizada para isActive()
    this.tokensInText.set(new Set(tokens));

    const want = (k: string) => tokens.has(k.toUpperCase());

    const activate = (k: string) => {
      if (!this.selectedChips.has(k)) {
        this.selectedChips.add(k);
        if (this.affectsSelects(k)) this.selects.add(k === 'MORA' ? 'SALDO_MORA' : k);
      }
    };
    const deactivate = (k: string) => {
      if (this.selectedChips.has(k)) {
        this.selectedChips.delete(k);
        if (this.affectsSelects(k)) this.selects.delete(k === 'MORA' ? 'SALDO_MORA' : k);
      }
    };

    // 2) reglas exclusivas (primero las combinadas)
    if (want('BAJA30_SALDOMORA')) {
      activate('BAJA30_SALDOMORA'); deactivate('BAJA30'); deactivate('MORA');
    } else {
      deactivate('BAJA30_SALDOMORA');
      want('BAJA30') ? activate('BAJA30') : deactivate('BAJA30');
      want('MORA')   ? activate('MORA')   : deactivate('MORA');
    }

    if (want('LTD_LTDE')) {
      activate('LTD_LTDE'); deactivate('LTD'); deactivate('LTDE');
    } else {
      deactivate('LTD_LTDE');
      want('LTD')  ? activate('LTD')  : deactivate('LTD');
      want('LTDE') ? activate('LTDE') : deactivate('LTDE');
    }

    // 3) resto de chips (no exclusivos)
    const alreadyHandled = new Set(['BAJA30','MORA','BAJA30_SALDOMORA','LTD','LTDE','LTD_LTDE']);
    for (const g of this.chipGroups) {
      for (const c of g.items) {
        if (alreadyHandled.has(c.key)) continue;
        want(c.key) ? activate(c.key) : deactivate(c.key);
      }
    }

    // 4) coherencia del importe extra
    if (!this.hasTopUpSelect()) this.form.controls.importeExtra.setValue(0);
  }

  generarGuiado() {
    const template = (this.form.controls.plantillaTexto.value ?? '').trim();
    if (!template) { this.alert('Ingresa un texto de SMS antes de generar.', 'Falta texto'); return; }

    // base de consulta (sin limit ni nulls molestos)
    const raw = this.buildBody(false);
    const query: any = this.compactQuery(raw);
    // aseguramos selects que estén en el texto (por si el user sólo escribió {BAJA30})
    const tokens = Array.from(this.extractTokens());
    const textVars = tokens.filter(t => this.affectsMap.get(t));
    query.selects = Array.from(new Set([...(query.selects || []), ...textVars]));

    // candidatas por defecto (puedes parametrizarlo)
    const candidatas = [
      'BAJA30','SALDO_MORA','BAJA30_SALDOMORA',
      'LTD','LTDE','LTD_LTDE',
      'PKM','CAPITAL'
    ];

    const loadingDlg = this.matDialog.open(LoadingDialogComponent, {
      disableClose: true,
      data: { title: 'Preparando cohorte…', subtitle: 'Calculando variables candidatas' },
      panelClass: 'loading-dialog-panel',
      width: '320px',
      autoFocus: false
    });

    this.api.previewInit(query, template, candidatas).subscribe({
      next: (init) => {
        loadingDlg.close();
        this.matDialog.open(RoundWizardDialogComponent, {
          width: '820px',
          data: { sessionId: init.sessionId, init, template },
          disableClose: false
        });
      },
      error: (err) => {
        loadingDlg.close();
        const msg = err?.error?.message || err?.message || 'No se pudo iniciar el guiado.';
        this.alert(msg, 'Error');
      }
    });
  }

  private triggerPreview() {
    const base = this.currentQueryForPreview();
    const h = this.hash(base);
    if (h === this.lastHash() && this.sampleRow()) return; // evita refetch

    this.lastHash.set(h);
    this.loadingPreview.set(true);

    const required = this.requiredColumnsForPreview();
    const preferred = this.preferredColumnsForPreview();

    this.api.run(base).subscribe({
      next: (rows) => {
        const pick = this.pickBestRow(rows || [], required, preferred);
        this.sampleRow.set(pick ?? null);
        this.loadingPreview.set(false);
      },
      error: () => { this.sampleRow.set(null); this.loadingPreview.set(false); }
    });
  }

  refreshPreview(){ this.triggerPreview(); }


  // --- Modo de vista previa: auto / manual (sin backend)
  previewMode = signal<'auto'|'manual'>('manual');  // ← arranca en manual
  loadingPreview = signal(false);
  private lastHash = signal<string>('');

// Cambiar modo
  setMode(m: 'auto'|'manual') {
    this.previewMode.set(m);
    if (m === 'auto') this.triggerPreview(); // al pasar a auto, refresca
  }

// Hash estable del “query” que afecta la fila de muestra
  private hash(q: DynamicQueryRequest): string {
    const key = {
      tramo: q.tramo,
      selects: [...(q.selects || [])].sort(),
      condiciones: [...(q.condiciones || [])].sort(),
      restricciones: q.restricciones,
      importeExtra: q.importeExtra ?? null
    };
    return JSON.stringify(key);
  }

// Construye el body para la PREVIEW (incluye tokens/aliases como ya hacías)
  private currentQueryForPreview(): DynamicQueryRequest {
    const base = this.buildBody(true);

    const tpl = this.form.controls.plantillaTexto.value ?? '';
    const needed = Array.from(new Set(
      (tpl.match(VAR_PATTERN) || []).map(m => this.mapVar(m.slice(1, -1)))
    ));
    base.selects = Array.from(new Set([...(base.selects || []), ...needed]));
    base.selects = Array.from(new Set([...(base.selects || []), ...this.expandWithAliases(base.selects || [])]));
    return base as DynamicQueryRequest;
  }

// Flag para avisar que, en manual, hay cambios no aplicados
  pendingPreview = computed(() =>
    this.previewMode() === 'manual' &&
    this.hash(this.currentQueryForPreview()) !== this.lastHash()
  );


}
