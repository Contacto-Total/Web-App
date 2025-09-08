import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

export type SuccessDialogData = {
  title?: string;
  message?: string;
  autoCloseMs?: number; // default 1800
};

@Component({
  standalone: true,
  selector: 'app-success-dialog',
  imports: [CommonModule, MatDialogModule],
  template: `
  <div class="wrap">
    <div class="icon">
      <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
        <circle cx="12" cy="12" r="10" class="ring"></circle>
        <path d="M7 12.5l3 3 7-7" class="tick"></path>
      </svg>
    </div>
    <h3 class="title">{{ data.title || 'Listo' }}</h3>
    <p class="msg" *ngIf="data.message">{{ data.message }}</p>
  </div>
  `,
  styles: [`
  .wrap{padding:28px 24px 24px; text-align:center; min-width:260px}
  .icon{display:flex; justify-content:center; margin-bottom:10px}
  .ring{fill:#e8f5ef; stroke:#2ea56a; stroke-width:0.5}
  .tick{fill:none; stroke:#2ea56a; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round}
  .title{margin:8px 0 4px; font-weight:700}
  .msg{margin:0; color:#555}
  `]
})
export class SuccessDialogComponent {
  constructor(
    public ref: MatDialogRef<SuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SuccessDialogData
  ) {
    const ms = data?.autoCloseMs ?? 1800;
    setTimeout(() => this.ref.close(true), ms);
  }
}
