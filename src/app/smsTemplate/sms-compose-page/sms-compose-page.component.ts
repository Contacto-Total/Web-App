import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { SmsVariablesComponent } from '../ui/sms-variables/sms-variables.component';
import { SmsFiltersComponent } from '../ui/sms-filters/sms-filters.component';
import { SmsTemplatesComponent } from '../ui/sms-templates/sms-templates.component';
import { SmsPreviewComponent } from '../ui/sms-preview/sms-preview.component';

import { SmsComposerStore } from '../shared/sms-composer.store';
import { VariableKey } from '../shared/sms-models';
import { fuerzaTramo3 } from '../shared/date-rules';
import {ToolbarComponent} from "@/shared/components/toolbar/toolbar.component";



@Component({
  selector: 'app-sms-composer-page',
  standalone: true,
  imports: [
    CommonModule, MatToolbarModule, MatButtonModule,
    SmsVariablesComponent, SmsFiltersComponent, SmsTemplatesComponent, SmsPreviewComponent, ToolbarComponent
  ],
  templateUrl: './sms-compose-page.component.html',
  styleUrls: ['./sms-compose-page.component.css']
})
export class SmsComposerPageComponent {
  // señales locales para UI
  private vars = signal<VariableKey[]>([]);
  forceTramo3 = computed(() => fuerzaTramo3(this.vars()));
  selectedTpl = signal<any>(null);
  varsOrder = signal<string[]>([]);

  puedeExportar$ = this.store.puedeExportar$;

  constructor(public store: SmsComposerStore) {}

  onVarsChanged(v: VariableKey[]) {
    this.vars.set(v);
    this.varsOrder.set(v);
    this.store.setVars(v);
    // limpiar plantilla seleccionada si ya no coincide
    this.selectedTpl.set(null);
    this.store.pickTemplate(null);
  }

  onFilters(e: { tramo: number | null; promesas: boolean; compromisos: boolean; blacklist: boolean }) {
    if (this.forceTramo3()) {
      this.store.setTramo(3);
    } else {
      this.store.setTramo(e.tramo);
    }
    this.store.setExclusions({
      promesas: e.promesas,
      compromisos: e.compromisos,
      blacklist: e.blacklist
    });
  }

  pickTemplate(t: any) {
    this.selectedTpl.set(t);
    this.store.pickTemplate(t);
  }
}
