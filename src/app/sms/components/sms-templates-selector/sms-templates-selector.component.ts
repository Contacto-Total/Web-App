import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { CheckboxModule } from 'primeng/checkbox';
import { SmsService } from '../../services/sms/sms.service';

import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { TemplateResponse } from '@/sms/model/response/template.response';
import { GenerateMessagesRequest } from '@/sms/model/request/generate-messages.request';

interface ChecklistItem {
  label: string;
  value: string;
  checked: boolean;
}

@Component({
  selector: 'app-sms-templates-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, ListboxModule, ButtonModule, ToastModule, RippleModule, CheckboxModule],
  templateUrl: './sms-templates-selector.component.html',
  styleUrl: './sms-templates-selector.component.css',
  providers: [MessageService]
})
export class SmsTemplatesSelectorComponent implements OnInit{
  plantillas!: TemplateResponse[];
  selectedTemplate: TemplateResponse | null = null;

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
    this.smsService.getPlantillas().subscribe(
      (data) => {
        this.plantillas = data;
      },
      (error) => {
        console.log('Error fetching plantillas: ', error);
      }
    );
  }

  onTemplateSelect(event: any): void {
    this.selectedTemplate = event.value;

    if (this.selectedTemplate && this.selectedTemplate.tipis) {
      const tipiValues = JSON.parse(this.selectedTemplate.tipis);

      this.checklistItems.forEach(item => {
        item.checked = tipiValues.includes(item.value);
      });
    } else {
      this.checklistItems.forEach(item => {
        item.checked = false;
      });
    }
  }

  createNewTemplate(): void {
    this.router.navigate(['/add/template']);
  }

  getSelectedChecklistsValues(): string[] {
    return this.checklistItems
      .filter(item => item.checked)
      .map(item => item.value);
  }


  generateMessages(): void {
    const selectedChecklistsValues: string[] = this.getSelectedChecklistsValues();

    if (this.selectedTemplate) {
      const generateMessagesRequest: GenerateMessagesRequest = {
        name: this.selectedTemplate?.name,
        tipis: selectedChecklistsValues
      };
      console.log('Payload enviado al backend:', generateMessagesRequest);

      Swal.fire({
        title: 'Procesando...',
        html: 'Generando mensajes...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.smsService.generateMessages(generateMessagesRequest).subscribe(
        (data: Blob) => {
          const url = window.URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'sms-report.xlsx';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          Swal.fire({
            icon: 'success',
            title: 'Exitoso!',
            text: 'Los mensajes han sido generados correctamente.',
          });
        },
        (error) => {
          Swal.close();
          Swal.fire({
            title: 'Error',
            text: 'Error generating messages.',
            icon: 'error'
          });
        }
      );
    } else {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'No has seleccionado ninguna plantilla.'});
    }
  }



  updateTemplate(plantilla: TemplateResponse): void {
    this.smsService.templateCanEdit = true;
    this.router.navigate(['/edit/template'], { state: { plantilla: plantilla } });
  }

  deleteTemplate(plantillaId: number): void {
    if (this.selectedTemplate) {
      Swal.fire({
        title: '¿Estas seguro?',
        text: 'No podras recuperar esta plantilla!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Si, eliminar!',
        cancelButtonText: 'No, mantenerla'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire('Eliminado!', 'Tu plantilla ha sido eliminada.', 'success');
          this.smsService.deletePlantilla(plantillaId).subscribe(
            (data) => {
              this.plantillas = this.plantillas.filter(plantilla => plantilla.id !== this.selectedTemplate?.id);
              this.selectedTemplate = null;
            },
            (error) => {
              console.log('Error deleting plantilla: ', error);
            }
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire('Cancelado', 'Tu plantilla esta segura :)', 'error');
        }
      });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No has seleccionado ninguna plantilla.' });
    }
  }
}
