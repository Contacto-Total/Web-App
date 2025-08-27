import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmsComposerStore } from '../../shared/sms-composer.store';

@Component({
  selector: 'app-sms-preview-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sms-preview-table.component.html'
})
export class SmsPreviewTableComponent {
  preview$ = this.store.preview$;
  vars$    = this.store.vars$;
  valueOf(values: Record<string, any>, key: string) {
    return values?.[key] ?? '';
  }

  constructor(private store: SmsComposerStore) {}
}
