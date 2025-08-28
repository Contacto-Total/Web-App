import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TemplateDef } from '../../shared/sms-models';
import { extractVarsFromTemplate } from '../../shared/date-rules';

@Component({
  selector: 'app-sms-templates',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule],
  templateUrl: './sms-templates.component.html',
  styleUrls: ['./sms-templates.component.css']
})
export class SmsTemplatesComponent {
  @Input() templates: TemplateDef[] = [];
  @Input() selected: TemplateDef | null = null;
  @Output() pick = new EventEmitter<TemplateDef>();

  varsOf(t: TemplateDef) { return extractVarsFromTemplate(t.template); }

  isSelected(t: TemplateDef) { return this.selected?.id === t.id; }

  choose(t: TemplateDef) { this.pick.emit(t); }
}
