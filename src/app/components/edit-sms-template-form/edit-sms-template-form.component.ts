import { Component, Input, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { CheckboxModule } from 'primeng/checkbox';
import { Router } from '@angular/router';
import { PlantillaResponse, PlantillaToUpdateRequest } from '../../model/plantilla.model';
import { SmsService } from '../../services/sms/sms.service';
import { CommonModule } from '@angular/common';

interface TemplateVariable {
  label: string;
  value: string;
}

interface ChecklistItem {
  label: string;
  value: string;
  checked: boolean;
}

@Component({
  selector: 'app-edit-sms-template-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputTextareaModule, ButtonModule, ToastModule, RippleModule, CheckboxModule],
  templateUrl: './edit-sms-template-form.component.html',
  styleUrl: './edit-sms-template-form.component.css',
  providers: [MessageService]
})
export class EditSmsTemplateFormComponent implements OnInit{
  @Input() template!: PlantillaResponse;
  templateName: string = '';
  templateContent: string = '';
  variables: TemplateVariable[] = [
    { label: 'DNI', value: 'documento' },
    { label: 'Nombre', value: 'nombre' },
    { label: 'Celular', value: 'telefonoCelular' },
    { label: 'Deuda Total', value: 'deudaTotal' },
    { label: 'LTD', value: 'ltd' },
    { label: 'Dia', value: 'dia' }
  ];

  checklistItems: ChecklistItem[] = [
    { label: 'FUERA DE SERVICIO - NO EXISTE', value: 'FUERA DE SERVICIO - NO EXISTE', checked: false },
    { label: 'APAGADO', value: 'APAGADO', checked: false },
    { label: 'NO CONTESTA', value: 'NO CONTESTA', checked: false },
    { label: 'MSJ VOZ - SMS - WSP - BAJO PUERTA', value: 'MSJ VOZ - SMS - WSP - BAJO PUERTA', checked: false },
    { label: 'EQUIVOCADO', value: 'EQUIVOCADO', checked: false },
    { label: 'CONTACTO CON TERCEROS', value: 'CONTACTO CON TERCEROS', checked: false },
    { label: 'CONTACTO CON TITULAR O ENCARGADO', value: 'CONTACTO CON TITULAR O ENCARGADO', checked: false },
    { label: 'OPORTUNIDAD DE PAGO', value: 'OPORTUNIDAD DE PAGO', checked: false },
    { label: 'FRACCIONADO O ARMADAS', value: 'FRACCIONADO O ARMADAS', checked: false },
    { label: 'PROMESA DE PAGO', value: 'PROMESA DE PAGO', checked: false },
    { label: 'RECORDATORIO DE PAGO', value: 'RECORDATORIO DE PAGO', checked: false },
    { label: 'CONFIRMACION DE ABONO', value: 'CONFIRMACION DE ABONO', checked: false },
    { label: 'CANCELACION PARCIAL', value: 'CANCELACION PARCIAL', checked: false },
    { label: 'CANCELACION TOTAL', value: 'CANCELACION TOTAL', checked: false },
    { label: 'CANCELACION NO REPORTADAS O APLICADAS', value: 'CANCELACION NO REPORTADAS O APLICADAS', checked: false },
    { label: 'FALLECIDO', value: 'FALLECIDO', checked: false }
  ];

  constructor(private router: Router, private messageService: MessageService, private smsService: SmsService) {}

  ngOnInit(): void {
    if (this.template) {
      this.templateName = this.template.name;
      this.templateContent = this.template.template;
      const tipiValues = JSON.parse(this.template.tipis);
  
      this.checklistItems.forEach(item => {
        item.checked = tipiValues.includes(item.value);
      });
    }
  }

  insertVariable(variable: string) {
    const insertion = `{${variable}}`;
    const textArea = document.getElementById('templateContent') as HTMLTextAreaElement;
    
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const text = textArea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      
      this.templateContent = `${before}${insertion}${after}`;
      textArea.focus();
      textArea.setSelectionRange(start + insertion.length, start + insertion.length);
    } else {
      this.templateContent += insertion;
    }
  }

  getSelectedChecklistsValues(): string[] {
    return this.checklistItems
      .filter(item => item.checked)
      .map(item => item.value);
  }

  onSubmit() {
    const selectedChecklistsValues: string[] = this.getSelectedChecklistsValues();

    if (this.templateName && this.templateContent) {
      const plantillaToUpdate: PlantillaToUpdateRequest = {
        id: this.template.id,
        name: this.templateName,
        template: this.templateContent,
        tipis: selectedChecklistsValues
      };

      this.smsService.updatePlantilla(plantillaToUpdate).subscribe(
        () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'La plantilla ha sido actualizada.' });
          this.router.navigate(['/sms']);
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
        }
      );
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debes completar el formulario.' });
    }
  }

  onCancel() {
    this.router.navigate(['/sms']);
  }
}
