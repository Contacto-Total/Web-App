import {Component, inject, OnInit, signal} from '@angular/core';
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


const VAR_PATTERN = /\{([A-Z0-9_]+)\}/g;
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


  private selects = new Set<string>();
  private condiciones = new Set<string>(); // solo PROMESAS_* visibles

  chips = [
    { key: 'NOMBRE', label: 'Nombre', affectsSelects: false },
    { key: 'LTD', label: 'LTD', affectsSelects: true },
    { key: 'LTDE', label: 'LTDE', affectsSelects: true },
    { key: 'LTD_LTDE', label: 'LTD y LTDE', affectsSelects: true },
    { key: 'BAJA30', label: 'Baja 30', affectsSelects: true },
    { key: 'MORA', label: 'Saldo Mora', affectsSelects: true },
    { key: 'BAJA30_SALDOMORA', label: 'Baja 30 y Saldo Mora', affectsSelects: true },
    { key: 'PKM', label: 'PKM', affectsSelects: true },
    { key: 'CAPITAL', label: 'Capital', affectsSelects: true },
    { key: 'DEUDA_TOTAL', label: 'Deuda Total', affectsSelects: true },
    { key: 'HOY',    label: 'Hoy',    affectsSelects: false },
    { key: 'MANANA', label: 'Mañana', affectsSelects: false },
  ];
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
    if (this.selectedChips.has(key)) {
      this.selectedChips.delete(key);
      if (affectsSelects) this.selects.delete(key);
      this.removePlaceholder(key);
    } else {
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
    const base = this.buildBody(true);

    // Trae un batch más grande para aumentar probabilidad de BAJA30, etc.
    const PREVIEW_BATCH = 100;
    base.limit = PREVIEW_BATCH;

    // Asegúrate de pedir también las columnas que aparecen en la plantilla
    const tpl = this.form.controls.plantillaTexto.value ?? '';
    const needed = Array.from(new Set(
      (tpl.match(VAR_PATTERN) || []).map((m: string) => this.mapVar(m.slice(1, -1)))
    ));

    base.selects = Array.from(new Set([...(base.selects || []), ...needed]));
    const expanded = this.expandWithAliases(base.selects || []);
    base.selects = Array.from(new Set([...(base.selects || []), ...expanded]));

    const required = this.requiredColumnsForPreview();
    const preferred = this.preferredColumnsForPreview();

    this.api.run(base).subscribe({
      next: (rows) => {
        const pick = this.pickBestRow(rows || [], required, preferred);
        this.sampleRow.set(pick ?? null);
      },
      error: () => this.sampleRow.set(null),
    });
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

    form$.subscribe(() => this.fetchSampleRow());

    this.form.controls.plantillaTexto.valueChanges
      .pipe(debounceTime(200))
      .subscribe(() => this.fetchSampleRow());

    // primera carga
    this.fetchSampleRow();
  }

  // Inserta {KEY} una sola vez
  private insertPlaceholderOnce(key: string) {
    const ctrl = this.form.controls.plantillaTexto;
    const cur = ctrl.value ?? '';
    const already = new RegExp(`\\{${key}\\}(?!\\w)`).test(cur);
    if (already) return;

    const sep = cur && !cur.endsWith(' ') ? ' ' : '';
    ctrl.setValue(cur + `${sep}{${key}}`);
    ctrl.markAsDirty();
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
  toggleCond(ev: Event, key: 'PROMESAS_HOY'|'PROMESAS_MANANA'|'PROMESAS_ROTAS') {
    const input = ev.target as HTMLInputElement;
    if (input.checked) this.condiciones.add(key);
    else this.condiciones.delete(key);
    this.fetchSampleRow();
  }

  private buildBody(limitForPreview: boolean): DynamicQueryRequest {
    const v = this.form.getRawValue();

    const selects = Array.from(this.selects).map(s => (s === 'MORA' ? 'SALDO_MORA' : s));
    const PROMESAS = new Set(['PROMESAS_HOY', 'PROMESAS_MANANA', 'PROMESAS_ROTAS']);
    const condiciones = Array.from(this.condiciones).filter(c => PROMESAS.has(c));

    const importeExtraAplica =
      this.hasTopUpSelect() && Number(v.importeExtra) > 0
        ? Math.trunc(Number(v.importeExtra))
        : null;

    // ⚠️ sin selectAll, sin plantillaTexto
    return {
      selects,
      tramo: v.tramo,
      condiciones,
      restricciones: { /* ... tus flags reales ... */ },
      limit: limitForPreview ? Number(v.limit || 1000) : undefined,
      importeExtra: importeExtraAplica,
      selectAll: true
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
        this.api.export(queryAll)
          .pipe(finalize(() => dlg.close()))
          .subscribe({
            next: (blob) => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `resultado_${new Date().toISOString().slice(0, 10)}.xlsx`;
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
    const ctrl = this.form.controls.plantillaTexto;
    const cur = ctrl.value ?? '';
    const sep = cur && !cur.endsWith(' ') ? ' ' : '';
    ctrl.setValue(cur + `${sep}{${key}}`);
    ctrl.markAsDirty();
  }

  guardarCombo() {
    const v = this.form.getRawValue();

    const payload: ComboCreateRequest = {
      name: v.nombre,
      plantillaName: v.nombre,
      descripcion: v.descripcion,
      tramo: v.tramo,
      selects: Array.from(this.selects),
      condiciones: Array.from(this.condiciones),
      restricciones: {
        excluirPromesasPeriodoActual: !!v.excluirPromesasPeriodoActual,
        excluirCompromisos: !!v.excluirCompromisos,
        excluirBlacklist: !!v.excluirBlacklist
      },
      // crea también la plantilla si viene el texto
      plantillaTexto: v.plantillaTexto
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

}
