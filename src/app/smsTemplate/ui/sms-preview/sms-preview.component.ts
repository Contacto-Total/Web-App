import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicPreviewResponse } from '../../shared/sms-models';

@Component({
  selector: 'app-sms-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sms-preview.component.html',
  styleUrls: ['./sms-preview.component.css']
})
export class SmsPreviewComponent {
  @Input() data: DynamicPreviewResponse | null = null;
  @Input() orderedVars: string[] = [];

  keys(obj: Record<string, any> | undefined) { return obj ? Object.keys(obj) : []; }
}
