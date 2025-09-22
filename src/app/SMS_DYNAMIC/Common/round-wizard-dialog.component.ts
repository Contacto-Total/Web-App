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
      <h2>¿Completar con otro importe?</h2>
    </header>

    <section class="dlg__body">
      <!-- STATS -->
      <div class="group-card">
        <div class="group-title">Progreso</div>
        <div class="stats">
          <div class="stat"><span>Total</span><b>{{ state().total }}</b></div>
          <div class="stat"><span>Resueltas</span><b class="ok">{{ state().resueltas }}</b></div>
          <div class="stat"><span>Pendientes</span><b class="warn">{{ state().pendientes }}</b></div>
        </div>
      </div>

      <!-- CANDIDATAS -->
      <div class="group-card">
        <div class="group-title">Opciones</div>

        <ng-container *ngIf="state().candidatas?.length; else noCand">
          <div class="chip-container">
            <button type="button" class="chip"
                    *ngFor="let c of state().candidatas"
                    (click)="choose(c.variable)">
              <span class="chip__var">{{ pretty(c.variable) }}</span>
              <span class="chip__count">{{ c.filasQueResuelve }} casos</span>
            </button>
          </div>
        </ng-container>
        <ng-template #noCand>
          <div class="muted">No existen casos para resolver.</div>
        </ng-template>
      </div>

      <!-- PREVIEW -->
      <div class="group-card">
        <div class="group-title">Previsualización</div>
        <div class="preview-list">
          <div class="pv-item" *ngFor="let p of (state().muestraPreview || [])">
            <div class="pv-left">
              <div class="pv-doc">{{ p.documento || '(sin doc.)' }}</div>
              <div class="pv-nom muted">{{ p.nombre }}</div>
              <div class="pv-meta">
                <span>Usada: <b>{{ pretty(p.variableUsada) || '—' }}</b></span>
                <span>Valor: <b>{{ p.valorUsado ?? '—' }}</b></span>
              </div>
            </div>
            <div class="pv-sms preview-box">{{ p.sms }}</div>
          </div>
        </div>
      </div>
    </section>

    <footer class="dlg__foot">
      <button mat-button type="button" (click)="skip()" [disabled]="loading()">Omitir</button>
      <span class="spacer"></span>
      <button mat-raised-button color="primary" type="button" (click)="download()" [disabled]="loading()">
        Terminar y descargar
      </button>
    </footer>
  </div>
  `,
  styles: [`
  /* Reutiliza el mismo look del otro diálogo */
  .dlg{
    width: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    max-height: 80vh;          /* conserva el alto */
  }


  .dlg__head{
    display:flex; align-items:center; gap:22px;
    padding:14px 18px; border-bottom:1px solid #e5e7eb;
    justify-content: center;
  }
  .dlg__head h2{ margin:0; font-size:1.2rem; font-weight:700; }
  .icon-btn{ border:none; background:transparent; font-size:18px; margin-left:auto; cursor:pointer; }

  .dlg__body{
    flex: 1 1 auto;            /* llena el ancho/alto disponible */
    overflow: auto;
  }
  .dlg__foot{
    padding:12px 18px; border-top:1px solid #e5e7eb; background:#fff;
    box-shadow: 0 -6px 12px -10px rgba(0,0,0,.12);
    display:flex; align-items:center; gap:10px;
  }
  .spacer{ flex:1; }

  /* Cards / grupos (idéntico al editar) */
  .group-card{
    border:1px solid #e5e7eb; background:#fff; border-radius:12px; padding:12px;
    margin-top:20px;margin-left: 15px;margin-right: 15px;
  }
  .group-title{
    margin:0 0 10px 0; font-size:14px; font-weight:600; color:#374151;
  }

  /* Stats */
  .stats{
    display:grid; grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); gap:10px;
  }
  .stat{
    border:1px solid #e5e7eb; border-radius:10px; padding:10px 12px; background:#fafafa;
    display:flex; align-items:center; justify-content:space-between;
  }
  .stat span{ color:#6b7280; font-size:.9rem; }
  .stat b{ font-size:1rem; }
  .stat b.ok{ color:#059669; }
  .stat b.warn{ color:#b45309; }

  /* Chips de candidatas (mismo estilo) */
  .chip-container{ display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
  .chip{
    appearance:none; border:1px solid #dfe3ee; background:#f8f9fc; color:#111827;
    border-radius:999px; padding:8px 14px; font-weight:600; line-height:1.1;
    cursor:pointer; transition: background .15s, border-color .15s, transform .04s;
    box-shadow: 0 1px 0 rgba(0,0,0,.02);
  }
  .chip:hover{ background:#f8fafc; }
  .chip:active{ transform: translateY(1px); }
  .chip:focus-visible{ outline:2px solid #6366f1; outline-offset:2px; }
  .chip__var{ margin-right:8px; }
  .chip__count{ font-size:12px; color:#4b5563; }

  /* Preview items (alineado al estilo) */
  .preview-list{ display:flex; flex-direction:column; gap:10px; }
  .pv-item{
    display:grid; grid-template-columns: 260px 1fr; gap:12px;
    border:1px solid #e5e7eb; border-radius:12px; padding:12px; background:#fff;
  }
  .pv-left{ display:flex; flex-direction:column; gap:4px; }
  .pv-doc{ font-weight:600; font-size:13px; }
  .pv-meta{ display:flex; gap:12px; font-size:12px; color:#334155; }
  .muted{ color:#6b7280; }

  /* SMS box igual que el preview del otro diálogo */
  .preview-box{
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color:#fff; padding:12px; border-radius:12px; min-height:85px;
    font-family: monospace; font-size:14px; line-height:1.5; white-space:pre-wrap;
  }

  /* más aire entre secciones directas del diálogo */
  .dlg__body > * + * {
    margin-top: 16px;   /* prueba 16/20/24px */
  }

  /* si quieres aún más aire entre bloques dentro de .adv */
  .adv .grid > * + * {
    margin-top: 12px;
  }

  /* cards/grupos con separación vertical consistente */
  .group-card + .group-card {
    margin-top: 16px;
  }

  /* listas: separaciones internas */
  .cand-list { gap: 12px; }
  .preview-list { gap: 12px; }
  .pv-item { padding: 12px; }  /* un poco más de padding */


  @media (max-width: 720px){
    .pv-item{ grid-template-columns: 1fr; }
  }
  `]
})
export class RoundWizardDialogComponent {
  private dialogRef = inject(MatDialogRef<RoundWizardDialogComponent>);
  private api = inject(DynQueryService);

  // dentro de RoundWizardDialogComponent
  private prettyMap: Record<string, string> = {
    // Siglas que deben quedar en mayúsculas
    'LTD': 'LTD',
    'LTDE': 'LTDE',
    'PKM': 'PKM',

    // Finanzas legibles
    'SALDO_MORA': 'Saldo Mora',
    'BAJA30': 'Baja 30',
    'BAJA30_SALDOMORA': 'Baja 30 + Mora',
    'CAPITAL': 'Capital',
    'DEUDA_TOTAL': 'Deuda Total',

    // Otros (por si aparecen en preview)
    'NOMBRECOMPLETO': 'Nombre completo',
    'NUMCUENTAPMCP': 'N° de Cuenta',
    'DIASMORA': 'Días mora',
    'LTD_LTDE': 'LTD + LTDE'
  };

  pretty(v: string | null | undefined): string {
    const key = (v ?? '').toUpperCase();
    if (!key) return '';
    if (this.prettyMap[key]) return this.prettyMap[key];

    // Default: "SALDO_EXTRA" -> "Saldo Extra"
    return key
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\p{L}/gu, m => m.toUpperCase());
  }


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
    this.api.previewDownloadBase(this.data.sessionId).subscribe({
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
