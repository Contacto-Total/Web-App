import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { SmsComposerStore } from '../../shared/sms-composer.store';
import { ALL_VARIABLES, VariableChoice, VariableKey } from '../../shared/sms-models';

@Component({
  selector: 'app-sms-variables',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule],
  templateUrl: './sms-variables.component.html',
  styleUrls: ['./sms-variables.component.css']
})
export class SmsVariablesComponent {
  variables: VariableChoice[] = [...ALL_VARIABLES];
  private selected: VariableKey[] = [];
  isSelected(k: VariableKey) { return this.selected.includes(k); }
  toggle(k: VariableKey) { this.selected = this.isSelected(k) ? this.selected.filter(x=>x!==k) : [...this.selected, k]; }

  constructor(private store: SmsComposerStore) {
    this.store.vars$.subscribe(v => this.selected = v ?? []);
  }
}
