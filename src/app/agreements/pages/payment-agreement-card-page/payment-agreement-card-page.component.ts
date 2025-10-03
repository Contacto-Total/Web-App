import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { CreatePaymentAgreementRequest } from '@/agreements/model/request/create-payment-agreement.request';
import { AgreementsService } from '@/agreements/services/agreement-services/agreements.service';
import { ToolbarComponent } from '@/shared/components/toolbar/toolbar.component';

@Component({
  selector: 'app-payment-agreement-card-page',
  standalone: true,
  imports: [ToolbarComponent, CommonModule, FormsModule, ReactiveFormsModule, DragDropModule ],
  templateUrl: './payment-agreement-card-page.component.html',
  styleUrls: ['./payment-agreement-card-page.component.css']
})
export class PaymentAgreementCardPageComponent implements OnInit {
  
  agreementForm: FormGroup;
  searchForm: FormGroup;

  readonlyInputs = false;

  mostrarObservacion = false;
  observacionTexto = '';

  isLoading = false;

  tramoDetectado = '';

  // Toast notifications
  toasts: Array<{id: number, type: 'error' | 'warning', message: string, icon: string}> = [];
  private toastIdCounter = 0;

  // Nueva propiedad para controlar si se usó el reset
  isDeudaTotalReset = false;
  isBlackoutMode = false; 

  formaPagoSeleccionadaIndex: number | null = null;
  formaPagoTemporal: FormGroup = this.fb.group({
    fechaPago: [''],
    montoPago: [0]
  });

  
  constructor(
    private fb: FormBuilder,
    private agreementsService: AgreementsService
  ) {
    this.agreementForm = this.createForm();

    this.searchForm = this.fb.group({
      dniBusqueda: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]]
    });
  }

  ngOnInit() {
    // Escuchar cambios en los campos de deuda para recalcular automáticamente
    this.agreementForm.get('deudaTotal')?.valueChanges.subscribe(() => {
      if (!this.isDeudaTotalReset) {
        this.calculateDiscount();
      }
    });
    
    this.agreementForm.get('descuento')?.valueChanges.subscribe(() => {
      if (!this.isDeudaTotalReset) {
        this.calculateDiscount();
      }
    });

    this.agreementForm.get('montoAprobado')?.valueChanges.subscribe(() => {
      if (!this.isDeudaTotalReset) {
        this.calculateDiscount();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      fechaActual: [this.formatDate(new Date()), Validators.required],
      nombreTitular: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      cuentaTarjeta: ['', [Validators.required, Validators.minLength(10)]],
      fechaCompromiso: [this.formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), Validators.required],
      deudaTotal: [0, [Validators.required, Validators.min(0.01)]],
      descuento: [0, [Validators.required, Validators.min(0)]],
      montoAprobado: [0, [Validators.required, Validators.min(0.01)]],
      formasDePago: this.fb.array([] as FormGroup[])
    });
  }

  createFormaPago(): FormGroup {
    return this.fb.group({
      fechaPago: [this.formatDate(new Date()), Validators.required],
      montoPago: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  get formasDePagoArray(): FormArray {
    return this.agreementForm.get('formasDePago') as FormArray;
  }

  addFormaPago(): void {
    if (this.formasDePagoArray.length >= 10) return;
    this.formasDePagoArray.push(this.createFormaPago());
  }

  removeFormaPago(index: number): void {
    this.formasDePagoArray.removeAt(index);
  }

  toggleBlackoutMode(): void {
    if (this.isBlackoutMode) {
      // Revertir al modo normal
      if (confirm('¿Desea volver a mostrar los campos de deuda total y descuento?')) {
        this.isBlackoutMode = false;
        // Opcional: puedes mantener los valores o resetearlos
        // Si quieres resetear:
        // this.agreementForm.patchValue({ 
        //   deudaTotal: 0,
        //   descuento: 0
        // });
      }
    } else {
      // Activar modo blackout
      const montoAprobado = this.agreementForm.get('montoAprobado')?.value || 0;
      
      if (montoAprobado <= 0) {
        alert('Primero debe ingresar un monto aprobado válido.');
        return;
      }

      if (confirm('¿Está seguro que desea usar el monto aprobado como deuda total? Esto pondrá el descuento en 0.')) {
        this.isDeudaTotalReset = true;
        this.isBlackoutMode = true;
        
        this.agreementForm.patchValue({ 
          deudaTotal: montoAprobado,
          descuento: 0
        }, { emitEvent: false });

        setTimeout(() => {
          this.isDeudaTotalReset = false;
        }, 100);
      }
    }
  }

  // Método para obtener el icono dinámicamente
  getToggleIcon(): string {
    return this.isBlackoutMode ? '↶' : '×';
  }

  // Método para obtener el título dinámicamente
  getToggleTitle(): string {
    return this.isBlackoutMode 
      ? 'Volver a mostrar deuda total y descuento' 
      : 'Usar monto aprobado como deuda total';
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDisplayDate(dateString: string): string {
    if (!dateString) return '';

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const formatted = date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return formatted.replace('septiembre', 'setiembre');
  }

  calculateDiscount(): void {
    const deudaTotal = this.agreementForm.get('deudaTotal')?.value || 0;
    const montoAprobado = this.agreementForm.get('montoAprobado')?.value || 0;

    // Calcular descuento automáticamente
    let descuento = deudaTotal - montoAprobado;
    if (descuento < 0) descuento = 0;

    // Actualizar sin emitir eventos para evitar loop
    this.agreementForm.patchValue({ descuento: Number(descuento.toFixed(2)) }, { emitEvent: false });
  }

  calculateFromPercentage(): void {
    const deudaTotal = this.agreementForm.get('deudaTotal')?.value || 0;
    if (deudaTotal <= 0) {
      alert('Por favor, ingrese primero el monto de la deuda total.');
      return;
    }
    
    const percentage = prompt('Ingrese el porcentaje de descuento (ej: 30 para 30%)');
    if (percentage && !isNaN(Number(percentage)) && Number(percentage) >= 0 && Number(percentage) <= 100) {
      const descuento = (deudaTotal * Number(percentage)) / 100;
      const montoAprobado = deudaTotal - descuento;
      
      this.agreementForm.patchValue({ 
        descuento: Number(descuento.toFixed(2)),
        montoAprobado: Number(montoAprobado.toFixed(2))
      });
    } else if (percentage !== null) {
      alert('Por favor, ingrese un porcentaje válido entre 0 y 100.');
    }
  }

  buscarPorDni(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const dni = this.searchForm.get('dniBusqueda')?.value;

    this.isLoading = true;
    this.tramoDetectado = '';
    this.toasts = [];

    this.agreementsService.getAgreementData(dni).subscribe({
      next: (response) => {
        this.agreementForm.patchValue({
          fechaActual: response.fechaActual,
          nombreTitular: response.nombreDelTitular,
          dni: this.searchForm.get('dniBusqueda')?.value,
          cuentaTarjeta: response.cuentaTarjeta,
          fechaCompromiso: response.fechaCompromiso
        });

        this.readonlyInputs = true;
        this.tramoDetectado = response.tramo;

        this.observacionTexto = `Deuda total: ${response.deudaTotal}\nSaldo capital asignado: ${response.saldoCapitalAsig}\nLTD:${response.ltd}\nLTDE:${response.ltde}\nAsesor:${response.asesor}\nTipificación: ${response.observacion}`;
        this.mostrarObservacion = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al buscar datos:', error);
        this.isLoading = false;
        this.readonlyInputs = false; // Desbloquear inputs en caso de error

        if (error.status === 404) {
          this.showToast('error', 'Cliente no encontrado en la base de datos. Verifique el DNI ingresado.');
        } else if (error.status === 422) {
          this.showToast('warning', 'El cliente existe pero no tiene promesa de pago u oportunidad de pago registrada.');
        } else {
          this.showToast('error', 'Error al obtener datos del cliente. Por favor, intente nuevamente.');
        }
      }
    });
  }

  onSubmit(): void {
    if (this.agreementForm.valid) {
      // Validar que la suma de pagos coincida con el monto aprobado
      const sumaPagos = this.formasDePagoArray.controls
        .reduce((acc, control) => acc + Number(control.get('montoPago')?.value || 0), 0);

      const montoAprobado = this.agreementForm.get('montoAprobado')?.value || 0;

      if (sumaPagos !== montoAprobado) {
        alert(`La suma de los montos de las formas de pago (${sumaPagos.toFixed(2)}) no coincide con el monto aprobado (${montoAprobado.toFixed(2)}). Por favor, ajuste los montos.`);
        return;
      }

      this.isLoading = true;

      const formValue = this.agreementForm.value;

      // MODIFICACIÓN: Si se usó el reset, enviar montoAprobado como deudaTotal
      const deudaTotalParaEnvio = this.isBlackoutMode ? formValue.montoAprobado : formValue.deudaTotal;


      const request: CreatePaymentAgreementRequest = {
        fechaActual: this.formatDisplayDate(formValue.fechaActual),
        nombreTitular: formValue.nombreTitular,
        dni: formValue.dni,
        cuentaTarjeta: formValue.cuentaTarjeta,
        fechaCompromiso: this.formatDisplayDate(formValue.fechaCompromiso),
        deudaTotal: deudaTotalParaEnvio, // Aquí se envía el valor correcto
        descuento: formValue.descuento,
        montoAprobado: formValue.montoAprobado,
        formasDePago: this.formasDePagoArray.controls.map((control, index) => {
          const fecha: string = control.get('fechaPago')?.value;
          const monto: number = control.get('montoPago')?.value;

          const [yyyy, mm, dd] = fecha.split('-');
          const fechaFormateada = `${dd}/${mm}`;

          return `${index + 1}${this.getOrdinalSuffix(index + 1)} PAGO - ${fechaFormateada} - ${monto} SOLES`;
        }),
      };

      this.agreementsService.downloadAgreementCard(request).subscribe({
        next: (blob) => {
          this.downloadFile(blob, `ACUERDO DE PAGO ${request.dni}.pdf`);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al generar el documento:', error);
          alert('Error al generar el documento. Por favor, inténtelo nuevamente.');
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.scrollToFirstError();
      alert('Por favor, complete todos los campos requeridos correctamente.');
    }
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.agreementForm.controls).forEach(key => {
      const control = this.agreementForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormArray) {
        control.controls.forEach(c => c.markAsTouched());
      }
    });
  }

  private scrollToFirstError(): void {
    setTimeout(() => {
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        (firstError as HTMLInputElement).focus();
      }
    }, 100);
  }

  resetForm(): void {
    if (confirm('¿Está seguro que desea limpiar todos los campos?')) {
      this.agreementForm.reset();
      
      // Limpiar el array de formas de pago
      while (this.formasDePagoArray.length !== 0) {
        this.formasDePagoArray.removeAt(0);
      }
      
      // Resetear flags y observación
      this.isDeudaTotalReset = false;
      this.mostrarObservacion = false;
      this.observacionTexto = '';
      this.readonlyInputs = false;
      this.isBlackoutMode = false;
      this.tramoDetectado = '';
      this.toasts = [];
      
      // Restablecer fechas por defecto
      this.agreementForm.patchValue({
        fechaActual: this.formatDate(new Date()),
        fechaCompromiso: this.formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        deudaTotal: 0,
        descuento: 0,
        montoAprobado: 0
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.agreementForm.get(fieldName);
    return !!(field?.invalid && (field?.touched || field?.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.agreementForm.get(fieldName);
    if (field?.errors && (field?.touched || field?.dirty)) {
      if (field.errors['required']) {
        return this.getFieldLabel(fieldName) + ' es requerido';
      }
      if (field.errors['pattern']) {
        if (fieldName === 'dni') {
          return 'DNI debe tener exactamente 8 dígitos';
        }
        return this.getFieldLabel(fieldName) + ' tiene un formato inválido';
      }
      if (field.errors['minLength']) {
        return this.getFieldLabel(fieldName) + ` debe tener al menos ${field.errors['minLength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return this.getFieldLabel(fieldName) + ` debe ser mayor a ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  abrirEditorFormaPago(index: number): void {
    this.formaPagoSeleccionadaIndex = index;
    const forma = this.formasDePagoArray.at(index) as FormGroup;
    this.formaPagoTemporal.setValue({
      fechaPago: forma.get('fechaPago')?.value,
      montoPago: forma.get('montoPago')?.value
    });
  }

  guardarEdicionFormaPago(): void {
    if (this.formaPagoSeleccionadaIndex !== null) {
      const forma = this.formasDePagoArray.at(this.formaPagoSeleccionadaIndex) as FormGroup;
      forma.patchValue({
        fechaPago: this.formaPagoTemporal.get('fechaPago')?.value,
        montoPago: this.formaPagoTemporal.get('montoPago')?.value
      });
      this.formaPagoSeleccionadaIndex = null;
    }
  }

  cerrarEditor(): void {
    this.formaPagoSeleccionadaIndex = null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'fechaActual': 'Fecha actual',
      'nombreTitular': 'Nombre del titular',
      'dni': 'DNI',
      'cuentaTarjeta': 'Número de cuenta tarjeta',
      'fechaCompromiso': 'Fecha de compromiso',
      'deudaTotal': 'Deuda total',
      'descuento': 'Descuento',
      'montoAprobado': 'Monto aprobado'
    };
    return labels[fieldName] || fieldName;
  }

  // Método para validar DNI mientras se escribe
  onDniInput(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Solo números
    if (value.length > 8) {
      value = value.substring(0, 8);
    }
    this.agreementForm.patchValue({ dni: value });
  }

  // Método para formatear números mientras se escriben
  onNumberInput(event: any, fieldName: string): void {
    let value = event.target.value;
    if (value !== '' && !isNaN(value)) {
      value = parseFloat(value);
      this.agreementForm.patchValue({ [fieldName]: value });
    }
  }

  getOrdinalSuffix(n: number): string {
    const suffixes = ['ER', 'DO', 'ER', 'TO', 'TO', 'TO', 'MO', 'VO', 'NO', 'MO'];
    return n <= 10 ? suffixes[n - 1] : '';
  }

  // Métodos para Toast
  showToast(type: 'error' | 'warning', message: string): void {
    const icon = type === 'error' ? '❌' : '⚠️';
    const id = this.toastIdCounter++;
    this.toasts.push({ id, type, message, icon });

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      this.removeToast(id);
    }, 5000);
  }

  removeToast(id: number): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
  }
}