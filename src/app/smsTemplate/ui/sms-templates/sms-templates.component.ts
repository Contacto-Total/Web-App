import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from "@angular/common";
import { MatChipsModule } from "@angular/material/chips";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { SmsComposerStore } from "@/smsTemplate/shared/sms-composer.store";
import { TemplatesService } from '../../shared/templates.service';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-sms-templates',
  standalone: true,
  imports: [CommonModule, AsyncPipe, MatCardModule, MatChipsModule, MatButtonModule],
  templateUrl: './sms-templates.component.html',
  styleUrls: ['./sms-templates.component.css']
})
export class SmsTemplatesComponent {

  // Cada vez que cambien las variables seleccionadas, pedimos las plantillas compatibles
  templates$ = this.store.selectedVariables$.pipe(
    // si VariableKey = string, este map sobra; si NO, lo mantenemos para castear
    map(vars => vars as unknown as string[]),
    // evita llamadas repetidas con el mismo contenido
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    switchMap(vars => this.templatesSvc.getCompatibleTemplates(vars))
  );

  private selectedName: string|null = null;

  constructor(private templatesSvc: TemplatesService, private store: SmsComposerStore) {}

  isSelected(idOrName: any) {
    return this.selectedName === idOrName;
  }

  toggle(name: string) {
    this.selectedName = this.selectedName === name ? null : name;
    this.store.setTemplateName(this.selectedName);
  }
}
