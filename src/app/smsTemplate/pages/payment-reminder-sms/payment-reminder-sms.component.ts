import { Component, OnInit } from '@angular/core';
import {ToolbarComponent} from "@/shared/components/toolbar/toolbar.component";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatStep, MatStepLabel, MatStepper, MatStepperNext} from "@angular/material/stepper";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import { CommonModule } from '@angular/common';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import { MatNativeDateModule } from '@angular/material/core';
import {MatIcon} from "@angular/material/icon";
import { FormArray, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {SmsTemplateServiceService} from "@/smsTemplate/services/sms-template-service.service";

@Component({
  selector: 'app-payment-reminder-sms',
  standalone: true,
  imports: [
    ToolbarComponent,
    MatTabGroup,
    MatTab,
    MatStepper,
    MatStep,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    CommonModule,
    MatButton,
    MatStepLabel,
    MatStepperNext,
    MatInput,
    MatNativeDateModule,
    MatIcon,
    MatError,
    MatIconButton,
    FormsModule,
    MatIconModule,
    MatDatepickerModule,
    MatRadioGroup,
    MatRadioButton,
  ],
  templateUrl: './payment-reminder-sms.component.html',
  styleUrl: './payment-reminder-sms.component.css'
})
export class PaymentReminderSmsComponent implements OnInit {

  fechasForm!: FormGroup;
  tipoMensaje: 'A' | 'B' | null = null;
  hoy = new Date();
  opcionForm!: FormGroup;

  constructor(private fb: FormBuilder, private smsTemplateServiceService: SmsTemplateServiceService) {}

  ngOnInit() {
    this.fechasForm = this.fb.group({
      fechas: this.fb.array([ this.nuevaFecha() ])
    }, { validators: this.fechasValidator.bind(this) });

    // Detecta automáticamente si es mensaje A o B
    this.fechasForm.valueChanges.subscribe(() => {
      const totalFechas = this.fechasArray.length;
      this.tipoMensaje = totalFechas === 1 ? 'A' : (totalFechas > 1 ? 'B' : null);
    });

    this.fechasForm = this.fb.group({
      fechas: this.fb.array([ this.nuevaFecha() ])
    }, { validators: this.fechasValidator.bind(this) });

    this.opcionForm = this.fb.group({
      opcion: [null, Validators.required]
    });

    this.fechasForm.valueChanges.subscribe(() => {
      const totalFechas = this.fechasArray.length;
      this.tipoMensaje = totalFechas === 1 ? 'A' : (totalFechas > 1 ? 'B' : null);
    });
  }

  generateTramo5() {
    const selectedOption = this.opcionForm.get('opcion')?.value;
    const onlyLtde = selectedOption === 'solo_ltde';

    this.smsTemplateServiceService.generateTramo5(onlyLtde).subscribe({
      next: (response) => {
        const blob = response.body;

        if (!blob) {
          console.error('No se recibió ningún archivo');
          return;
        }

        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'archivo.csv';

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) {
            filename = match[1];
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error descargando archivo CSV', err);
      }
    });
  }

  get fechasArray(): FormArray {
    return this.fechasForm.get('fechas') as FormArray;
  }

  nuevaFecha(): FormGroup {
    return this.fb.group({
      fecha: [null, Validators.required]
    });
  }

  addFecha() {
    this.fechasArray.push(this.nuevaFecha());
  }

  removeFecha(index: number) {
    this.fechasArray.removeAt(index);
  }

  fechasValidator(form: FormGroup) {
    const fechas = (form.get('fechas') as FormArray).controls
      .map(ctrl => ctrl.value.fecha)
      .filter(f => !!f);

    if (fechas.length === 1) {
      const rawFecha = fechas[0];
      const fecha = rawFecha instanceof Date ? rawFecha : new Date(rawFecha);

      if (isNaN(fecha.getTime())) {
        return { fechaInvalida: true };
      }

      // Normalizar a UTC (solo año/mes/día)
      const hoy = new Date();
      const fechaUTC = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
      const hoyUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

      const diffDias = Math.floor((fechaUTC - hoyUTC) / (1000 * 60 * 60 * 24));

      return Math.abs(diffDias) <= 2 ? null : { fechaInvalida: true };
    }

    if (fechas.length > 1) {
      return null; // válido
    }

    return { sinFechas: true };
  }



  editarMensaje() {
    // Aquí podrías abrir un diálogo para editar el mensaje
    console.log("Editar mensaje...");
  }

  generarMensaje() {
    console.log("Mensaje generado:", this.tipoMensaje);
  }




}
