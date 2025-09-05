import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export type AlertData = { title?: string; message: string };

@Component({
  standalone: true,
  selector: 'app-alert-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
  <h2 mat-dialog-title>{{ data.title || 'Aviso' }}</h2>
  <mat-dialog-content>
    <p style="white-space:pre-wrap">{{ data.message }}</p>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button color="primary" (click)="close()">Aceptar</button>
  </mat-dialog-actions>
  `,
})
export class AlertDialogComponent {
  private dialogRef = inject(MatDialogRef<AlertDialogComponent>);
  data = inject<AlertData>(MAT_DIALOG_DATA);
  close() { this.dialogRef.close(); }
}
