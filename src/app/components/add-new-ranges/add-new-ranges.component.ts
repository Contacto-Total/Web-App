import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FormsModule, FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

interface Range {
  min_value: number; // O string, si prefieres mantenerlo como string
  max_value: string; // Siempre será "infinito" o un valor numérico como string
}

@Component({
  selector: 'app-add-new-ranges',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, DropdownModule, InputNumberModule, ButtonModule],
  templateUrl: './add-new-ranges.component.html',
  styleUrl: './add-new-ranges.component.css'
})
export class AddNewRangesComponent {
  sparePartForm: FormGroup;
  higherToVisible: boolean = false;
  activeRangeIndex: number | null = null; // Índice del rango activo

  constructor(private router: Router, private fb: FormBuilder) {
    this.sparePartForm = this.fb.group({
      ranges: this.fb.array([this.createRange()]),
      higher_value: [''] // Campo adicional para el valor "Higher To"
    });

    // Subscribe to form changes to enable/disable buttons
    this.sparePartForm.valueChanges.subscribe(() => {
      this.checkFormValidity();
    });
  }

  get ranges(): FormArray {
    return this.sparePartForm.get('ranges') as FormArray;
  }

  createRange(): FormGroup {
    return this.fb.group({
      min_value: ['', [Validators.required, Validators.min(0)]],
      max_value: ['', [Validators.required, Validators.min(0)]]
    }, { validators: this.minMaxValidator });
  }

  addRange(): void {
    // Desactivar los campos anteriores
    this.activeRangeIndex = this.ranges.length; // Establecer el nuevo índice activo
    this.ranges.push(this.createRange());
    this.checkFormValidity(); // Verifica la validez del formulario
  }

  toggleHigherTo(): void {
    // Desactivar los campos anteriores
    this.activeRangeIndex = this.ranges.length; // Establecer el nuevo índice activo
    this.higherToVisible = !this.higherToVisible; // Alterna la visibilidad del campo Higher To
    this.checkFormValidity();
  }

  onSubmit() {
    if (this.sparePartForm.valid) {
      const rangesArray: Range[] = this.ranges.value.map((range: Range) => ({
        min_value: String(range.min_value), // Convertimos a string
        max_value: range.max_value ? String(range.max_value) : "infinito" // Aseguramos que sea "infinito" si no hay valor
      }));
  
      if (this.higherToVisible) {
        const higherValue = this.sparePartForm.get('higher_value')?.value;
        if (higherValue) {
          rangesArray.push({ min_value: higherValue.toString(), max_value: "infinito" });
        }
      }
  
      console.log(rangesArray);
  
      this.sparePartForm.reset();
      this.sparePartForm.setControl('ranges', this.fb.array([this.createRange()]));
      this.higherToVisible = false; // Ocultar el campo Higher To después de enviar
      this.activeRangeIndex = null; // Reiniciar el índice activo
    } else {
      this.sparePartForm.markAllAsTouched();
    }
  }  

  minMaxValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const minValue = control.get('min_value')?.value;
    const maxValue = control.get('max_value')?.value;
    return minValue !== undefined && maxValue !== undefined && minValue > maxValue ? { 'minMaxError': true } : null;
  };

  checkFormValidity() {
    // Verifica la validez del formulario y ajusta el estado del botón
    this.sparePartForm.markAllAsTouched();
  }

  isFieldDisabled(index: number): boolean {
    return this.activeRangeIndex !== null && index < this.activeRangeIndex; // Desactiva campos anteriores
  }
}