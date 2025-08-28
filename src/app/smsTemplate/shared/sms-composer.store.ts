import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, of, shareReplay, switchMap } from 'rxjs';
import { DynamicPreviewResponse, DynamicQueryRequest, TemplateDef, VariableKey } from './sms-models';
import { TemplatesService } from './templates.service';
import { PreviewService } from './preview.service';
import { ExportService } from './export.service';
import {calcDiasVencParaHoy, calcDiasVencPorVariables, fuerzaTramo3} from './date-rules';

@Injectable({ providedIn: 'root' })
export class SmsComposerStore {
  // estado básico
  private varsSel$ = new BehaviorSubject<VariableKey[]>([]);
  private excluirPromesas$ = new BehaviorSubject<boolean>(true);
  private excluirCompromisos$ = new BehaviorSubject<boolean>(true);
  private excluirBlacklist$ = new BehaviorSubject<boolean>(true);
  private tramo$ = new BehaviorSubject<number | null>(null); // si hay BAJA30/SaldoMora => 3 forzado
  private plantillaSel$ = new BehaviorSubject<TemplateDef | null>(null);

  // templates desde BD
  readonly templates$ = this.templatesSvc.getAll();

  // templates sugeridas segun chips
  readonly suggestedTemplates$ = combineLatest([this.varsSel$, this.templates$]).pipe(
    map(([vars, templates]) => {
      if (!vars.length) return [];
      return (templates || []).filter(t =>
        vars.every(v => this.hasVarInTpl(t.template, v))
      );
    }),
    shareReplay(1)
  );


  // preview (1 registro)
  readonly preview$ = combineLatest([
    this.varsSel$, this.excluirPromesas$, this.excluirCompromisos$, this.excluirBlacklist$,
    this.tramo$, this.plantillaSel$
  ]).pipe(
    switchMap(([vars, exP, exC, exB, tramo, plantilla]) => {
      if (!vars.length) return of<DynamicPreviewResponse>({ values: {} });

      // regla tramo 3 si baja30 o saldomora
      const must3 = fuerzaTramo3(vars);
      const tramos = must3 ? [3] : (tramo ? [tramo] : undefined);

      // regla de días (±2 alrededor de hoy)
      const diasVenc = must3 ? calcDiasVencPorVariables(vars) : undefined;

      const req: DynamicQueryRequest = {
        variables: vars,
        tramos,
        diasVenc,
        excluirPromesas: exP,
        excluirCompromisos: exC,
        excluirBlacklist: exB,
        templateName: plantilla?.name, // si hay plantilla seleccionada
        limitPreview: 1
      };
      return this.previewSvc.previewDynamic(req);
    }),
    shareReplay(1)
  );

  // habilitar export
  readonly puedeExportar$ = combineLatest([
    this.varsSel$, this.suggestedTemplates$, this.plantillaSel$
  ]).pipe(
    map(([vars, sugeridas, sel]) => {
      const okBase = !!vars.length && sugeridas.length > 0 && !!sel;

      // si hay variables de tramo 3 (baja30 o saldomora), la ventana debe ser NO vacía
      const must3 = fuerzaTramo3(vars);
      // A) usa nullish coalescing para convertir a []
      const ventanaOk = !must3 || (calcDiasVencPorVariables(vars) ?? []).length > 0;


      return okBase && ventanaOk;
    }),
    shareReplay(1)
  );

  private escapeRe(s: string) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  private hasVarInTpl(tpl: string, key: string): boolean {
    const K = (key || '').toLowerCase();

    // alias por variable (acepta con/ sin espacio, mayúsculas, etc.)
    const aliases: Record<string,string[]> = {
      nombre:     ['nombre'],
      baja30:     ['baja30', 'baja 30', 'baja_30', 'baja-30', 'Baja30', 'Baja 30'],
      deudatotal: ['deudatotal', 'deuda total', 'deuda_total', 'deuda-total'],
      saldomora:  ['saldomora', 'saldo mora', 'saldo_mora', 'saldo-mora']
    };

    const list = aliases[K] ?? [K];
    // busca { alias } ignorando espacios y mayúsculas
    return list.some(a => {
      const re = new RegExp(`\\{\\s*${this.escapeRe(a)}\\s*\\}`, 'i');
      return re.test(tpl || '');
    });
  }

  constructor(
    private templatesSvc: TemplatesService,
    private previewSvc: PreviewService,
    private exportSvc: ExportService
  ) {}

  // acciones
  toggleVar(v: VariableKey) {
    const set = new Set(this.varsSel$.value);
    set.has(v) ? set.delete(v) : set.add(v);
    this.varsSel$.next([...set]);

    // si ahora hay BAJA30/SaldoMora => tramo 3 forzado (UI puede mostrarlo deshabilitado)
    if (fuerzaTramo3([...set])) this.tramo$.next(3);
  }

  setVars(v: VariableKey[]) {
    this.varsSel$.next([...new Set(v)]);
    if (fuerzaTramo3(v)) this.tramo$.next(3);
  }

  setExclusions(opts: { promesas?: boolean; compromisos?: boolean; blacklist?: boolean }) {
    if (opts.promesas !== undefined) this.excluirPromesas$.next(opts.promesas);
    if (opts.compromisos !== undefined) this.excluirCompromisos$.next(opts.compromisos);
    if (opts.blacklist !== undefined) this.excluirBlacklist$.next(opts.blacklist);
  }

  setTramo(tramo: number | null) {
    if (fuerzaTramo3(this.varsSel$.value)) {
      this.tramo$.next(3);
    } else {
      this.tramo$.next(tramo);
    }
  }

  pickTemplate(t: TemplateDef | null) { this.plantillaSel$.next(t); }

  export() {
    const vars = this.varsSel$.value;
    if (!vars.length) return;

    const must3 = fuerzaTramo3(vars);
    const diasVenc = must3 ? calcDiasVencPorVariables(vars) : undefined;

    // <<< BLOQUEO si la ventana está vacía >>>
    if (must3 && (!diasVenc || diasVenc.length === 0)) {
      // Puedes mostrar un toast/snackbar si quieres:
      // this.snack.open('Saldo Mora/Baja 30 no aplica hoy (fuera de ventana ±2).', 'OK', { duration: 3000 });
      return;
    }

    const tramos = must3 ? [3] : (this.tramo$.value ? [this.tramo$.value] : undefined);

    const req: DynamicQueryRequest = {
      variables: vars,
      tramos,
      diasVenc, // <<< usa el mismo cálculo que preview
      excluirPromesas: this.excluirPromesas$.value,
      excluirCompromisos: this.excluirCompromisos$.value,
      excluirBlacklist: this.excluirBlacklist$.value,
      templateName: this.plantillaSel$.value?.name
    };

    this.exportSvc.exportDynamic(req).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Mensajes_SMS.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }



}
