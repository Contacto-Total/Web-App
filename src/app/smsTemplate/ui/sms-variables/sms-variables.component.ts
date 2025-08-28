import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ALL_VARIABLES, VariableChoice, VariableKey } from '../../shared/sms-models';

@Component({
  selector: 'app-sms-variables',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule],
  templateUrl: './sms-variables.component.html',
  styleUrls: ['./sms-variables.component.css']
})
export class SmsVariablesComponent {
  variables: VariableChoice[] = ALL_VARIABLES;
  selected = new Set<VariableKey>();

  @Output() changed = new EventEmitter<VariableKey[]>();

  toggle(v: VariableKey) {
    this.selected.has(v) ? this.selected.delete(v) : this.selected.add(v);
    this.changed.emit([...this.selected]);
  }

  isSelected(v: VariableKey) { return this.selected.has(v); }
}
