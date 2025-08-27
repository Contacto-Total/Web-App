import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SmsFiltersComponent } from '../ui/sms-filters/sms-filters.component';
import { SmsVariablesComponent } from '../ui/sms-variables/sms-variables.component';
import { SmsPreviewTableComponent } from '../ui/sms-preview-table/sms-preview-table.component';
import { SmsComposerStore } from '../shared/sms-composer.store';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sms-composer-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SmsFiltersComponent,
    SmsVariablesComponent,
    SmsPreviewTableComponent
  ],
  templateUrl: './sms-composer-page.component.html',
  styleUrls: ['./sms-composer-page.component.css']
})
export class SmsComposerPageComponent {
  constructor(private store: SmsComposerStore) {}

  onApply(val: { tramos: number[]; producto: 'AMBOS'|'LTD'|'LTDE'; limite: number }) {
    // días de vencimiento no están en el form de ejemplo; si luego los agregas, pásalos aquí
    this.store.applyFilters({
      tramos: val.tramos,
      producto: val.producto,
      limite: val.limite
    });
  }

  onReset() {
    this.store.applyFilters({ tramos: [], producto: 'AMBOS', limite: 1 });
  }

  download() {
    this.store.download();
  }
}
