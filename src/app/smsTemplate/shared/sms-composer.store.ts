import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { DynamicPreviewResponse, DynamicQueryRequest, VariableKey } from './sms-models';
import { PreviewService } from './preview.service';
import { ExportService } from './export.service';

@Injectable({ providedIn: 'root' })
export class SmsComposerStore {
  // --- estado
  private variablesSel$ = new BehaviorSubject<VariableKey[]>([]);
  private tramos$       = new BehaviorSubject<number[]>([]);
  private diasVenc$     = new BehaviorSubject<number[]>([]);
  private onlyLtde$     = new BehaviorSubject<boolean | undefined>(undefined);
  private limitPrev$    = new BehaviorSubject<number>(1);

  // --- lectura para componentes
  readonly vars$    = this.variablesSel$.asObservable();
  readonly preview$ = new BehaviorSubject<DynamicPreviewResponse>({ values: {} });

  constructor(
    private previewSvc: PreviewService,
    private exportSvc:  ExportService
  ) {}

  // ============== helpers =================
  private buildRequest(limitPreview?: number): DynamicQueryRequest {
    const vars = this.variablesSel$.value;
    const tr   = this.tramos$.value;
    const dv   = this.diasVenc$.value;
    const ltde = this.onlyLtde$.value;

    return {
      variables: vars,
      tramos: tr.length ? tr : undefined,
      diasVenc: dv.length ? dv : undefined,
      onlyLtde: ltde,
      excluirPromesas: true,
      excluirCompromisos: true,
      excluirBlacklist: true,
      ...(limitPreview ? { limitPreview } : {})
    };
  }

  // ============== acciones =================
  toggleVar(v: VariableKey) {
    const set = new Set(this.variablesSel$.value);
    set.has(v) ? set.delete(v) : set.add(v);
    this.variablesSel$.next([...set]);
  }

  setVariables(v: VariableKey[]) {
    this.variablesSel$.next(v ?? []);
  }

  applyFilters(opts: { tramos?: number[]; diasVenc?: number[]; producto?: 'AMBOS'|'LTD'|'LTDE'; limite?: number }) {
    this.tramos$.next(opts.tramos ?? []);
    this.diasVenc$.next(opts.diasVenc ?? []);
    this.onlyLtde$.next(
      opts.producto === 'LTDE' ? true :
        opts.producto === 'LTD'  ? false : undefined
    );
    this.limitPrev$.next(opts.limite ?? 1);
  }

  /** Dispara el preview (usar en el botón “Aplicar”) */
  loadPreview() {
    const vars = this.variablesSel$.value;
    if (!vars.length) {
      this.preview$.next({ values: {} });
      return;
    }
    const req = this.buildRequest(this.limitPrev$.value || 1);
    this.previewSvc.previewDynamic(req).subscribe({
      next: (resp) => this.preview$.next(resp),
      error: () => this.preview$.next({ values: {} })
    });
  }

  /** Descarga el Excel con todas las filas (sin límite) */
  download() {
    const req = this.buildRequest(/* sin limitPreview */);
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

  /** Limpia estado y preview */
  reset() {
    this.variablesSel$.next([]);
    this.tramos$.next([]);
    this.diasVenc$.next([]);
    this.onlyLtde$.next(undefined);
    this.limitPrev$.next(1);
    this.preview$.next({ values: {} });
  }
}
