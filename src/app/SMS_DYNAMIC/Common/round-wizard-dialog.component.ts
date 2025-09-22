import { Component, Inject, inject, signal, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  DynQueryService,
  PreviewCandidate,
  PreviewItem,
  PreviewStepResp
} from '@/SMS_DYNAMIC/services/dyn-query.service';

export type RoundWizardData = {
  sessionId: string;
  init: PreviewStepResp; // estado inicial
  template: string;
};

@Component({
  selector: 'app-round-wizard-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
  <div class="dlg">
    <header class="dlg__head">
      <h2>Resolver por rondas</h2>
      <button class="icon-btn" (click)="close()">✕</button>
    </header>

    <section class="dlg__body">
      <div class="stats">
        <div><b>Total:</b> {{ state().total }}</div>
        <div><b>Resueltas:</b> {{ state().resueltas }}</div>
        <div><b>Pendientes:</b> {{ state().pendientes }}</div>
      </div>

      <div class="candidates" *ngIf="state().candidatas?.length; else noCand">
        <h3>Variables candidatas</h3>
        <div class="cand-list">
          <button class="cand-btn"
                  *ngFor="let c of state().candidatas"
                  (click)="choose(c.variable)">
            <div class="cand-var">{{ c.variable }}</div>
            <div class="cand-count">{{ c.filasQueResuelve }} filas</div>
          </button>
        </div>
      </div>
      <ng-template #noCand>
        <p>No hay variables que resuelvan filas pendientes.</p>
      </ng-template>

      <h3>Preview (muestra)</h3>
      <div class="preview-list">
        <div class="pv-item" *ngFor="let p of (state().muestraPreview || [])">
          <div class="pv-left">
            <div class="pv-doc">{{ p.documento || '(sin doc.)' }}</div>
            <div class="pv-nom">{{ p.nombre }}</div>
            <div class="pv-meta">
              <span>Usada: <b>{{ p.variableUsada || '—' }}</b></span>
              <span>Valor: <b>{{ p.valorUsado ?? '—' }}</b></span>
            </div>
          </div>
          <div class="pv-sms">{{ p.sms }}</div>
        </div>
      </div>
    </section>

    <footer class="dlg__foot">
      <button mat-button (click)="skip()" [disabled]="loading()">Omitir ronda</button>
      <span class="spacer"></span>
      <button mat-button (click)="download()" class="btn-primary" [disabled]="loading()">Terminar y descargar</button>
    </footer>
  </div>
  `,
  styles: [`
  .dlg{ width: 760px; max-width: 92vw; display:flex; flex-direction:column; max-height: 86vh; }
  .dlg__head{ display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #2a2a2a; padding:12px 8px; }
  .icon-btn{ border:none; background:transparent; font-size:18px; cursor:pointer; }
  .dlg__body{ padding:12px 8px; overflow:auto; display:flex; flex-direction:column; gap:12px; }
  .stats{ display:flex; gap:16px; flex-wrap:wrap; }
  .candidates .cand-list{ display:flex; gap:10px; flex-wrap:wrap; }
  .cand-btn{ color:white; border:1px solid #444; background:#1e1e1e; border-radius:10px; padding:10px 12px; cursor:pointer; min-width:140px; text-align:left; }
  .cand-var{ font-weight:600; }
  .cand-count{ font-size:12px; opacity:.8; }
  .preview-list{ display:flex; flex-direction:column; gap:8px; }
  .pv-item{ display:flex; gap:12px; padding:10px; border:1px solid #303030; border-radius:10px; }
  .pv-left{ min-width:220px; display:flex; flex-direction:column; gap:4px; }
  .pv-doc{ font-weight:600; font-size:13px; }
  .pv-nom{ opacity:.9; }
  .pv-meta{ display:flex; gap:12px; font-size:12px; opacity:.85; }
  .pv-sms{ white-space:pre-wrap; border-left:1px dashed #333; padding-left:10px; flex:1; }
  .dlg__foot{ padding:10px 8px; display:flex; align-items:center; gap:10px; border-top:1px solid #2a2a2a; }
  .spacer{ flex:1; }
  .btn-primary{ background:#2d63ff; color:white; }
  `]
})
export class RoundWizardDialogComponent {
  private dialogRef = inject(MatDialogRef<RoundWizardDialogComponent>);
  private api = inject(DynQueryService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: RoundWizardData) {}

  state = signal<PreviewStepResp>(this.data.init);
  loading = signal(false);

  choose(variable: string) {
    this.loading.set(true);
    this.api.previewChoose(this.data.sessionId, variable).subscribe({
      next: (res) => { this.state.set(res); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  skip() {
    this.loading.set(true);
    this.api.previewSkip(this.data.sessionId).subscribe({
      next: (res) => { this.state.set(res); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  download() {
    this.loading.set(true);
    this.api.previewDownload(this.data.sessionId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sms_report_${new Date().toISOString().slice(0,10)}.xlsx`;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
        this.loading.set(false);
        this.dialogRef.close(true);
      },
      error: () => this.loading.set(false)
    });
  }

  close(){ this.dialogRef.close(false); }
}
