import { Component, Inject, ChangeDetectionStrategy  } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './loading-dialog.component.html',
  styleUrl: './loading-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title?: string; subtitle?: string } | null) {}

  // Usa el texto que pasaste; si no, “Generating”
  letters = Array.from('Generando');
}
