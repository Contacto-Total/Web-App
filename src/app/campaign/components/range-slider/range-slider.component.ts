import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CampaignReportRequest } from '@/campaign/model/request/campaign-report.request';
import { CampaignService } from '@/campaign/services/campaign-service/campaign.service';

interface Range {
  min: number;
  max: number;
  isChecked: boolean;
}

@Component({
  selector: 'app-range-slider', 
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputNumberModule, ToastModule, CheckboxModule, TabViewModule, DropdownModule, MultiSelectModule],
  templateUrl: './range-slider.component.html',
  styleUrl: './range-slider.component.css',
  providers: [MessageService]
})
export class RangeSliderComponent implements OnInit{
  @ViewChild('slider', { static: true }) sliderElement!: ElementRef;
  
  step = 100;
  campaignName: string = '';
  tramoOptions = [
    { label: 'Tramo 3', value: 'Tramo 3' },
    { label: 'Tramo 5', value: 'Tramo 5' },
    { label: 'Contacto Total', value: 'CONTACTO_TOTAL' }
  ];

  filterType: string = 'saldoCapital';
  filterTypeOptions = [
    { label: 'Saldo Capital', value: 'saldoCapital' },
    { label: 'Baja 30', value: 'baja30' }
  ];

  dueDatesSelected: string[] = [];
  dueDatesOptions: any[] = [];
  contactoDirectoRanges: Range[] = [];
  contactoIndirectoRanges: Range[] = [];
  promesasRotasRanges: Range[] = [];
  noContactadoRanges: Range[] = [];
  contenido: boolean = true;
  excluirPagadasHoy: boolean = false;
  totalRange = 10000;
  activeIndex: number = 3;

  // Separate error tracking for min and max inputs
  contactoDirectoMinErrors: boolean[] = [];
  contactoDirectoMaxErrors: boolean[] = [];
  contactoIndirectoMinErrors: boolean[] = [];
  contactoIndirectoMaxErrors: boolean[] = [];
  promesasRotasMinErrors: boolean[] = [];
  promesasRotasMaxErrors: boolean[] = [];
  noContactadoMinErrors: boolean[] = [];
  noContactadoMaxErrors: boolean[] = [];

  // Variables para rastrear el último input editado
  private lastEditedRangeIndex: number = -1;
  private lastEditedField: 'min' | 'max' = 'min';

  constructor(private router: Router, private messageService: MessageService, private campañaService: CampaignService) {}

  ngOnInit() {
    this.campañaService.getDueDates().subscribe({
      next: (dates: string[]) => {
        this.dueDatesOptions = dates.map(date => ({ label: date, value: date }));
        console.log('Fechas recibidas:', this.dueDatesOptions);
      },
      error: (err) => {
        console.error('Error al obtener fechas:', err);
      }
    });

    const initialRangesCd = [
      { min: 0, max: 8000, isChecked: true }
    ];
    const initialRangesCi = [
      { min: 0, max: 8000, isChecked: true }
    ];
    const initialRangesPr = [
      { min: 0, max: 8000, isChecked: true }
    ];
    const initialRangesNc = [
      { min: 1000, max: 2000, isChecked: false },
      { min: 2000, max: 3000, isChecked: false },
      { min: 3000, max: 4000, isChecked: false },
      { min: 4000, max: 5000, isChecked: true }
    ];

    this.campaignName = 'Tramo 3';
    this.contenido = true;
    this.contactoDirectoRanges = initialRangesCd.map(range => ({ ...range }));
    this.contactoIndirectoRanges = initialRangesCi.map(range => ({ ...range }));
    this.promesasRotasRanges = initialRangesPr.map(range => ({ ...range }));
    this.noContactadoRanges = initialRangesNc.map(range => ({ ...range }));

    // Inicializar arrays de errores
    this.updateErrorArrays();
  }

  private updateErrorArrays() {
    // Initialize both min and max error arrays for each tab
    this.contactoDirectoMinErrors = new Array(this.contactoDirectoRanges.length).fill(false);
    this.contactoDirectoMaxErrors = new Array(this.contactoDirectoRanges.length).fill(false);
    this.contactoIndirectoMinErrors = new Array(this.contactoIndirectoRanges.length).fill(false);
    this.contactoIndirectoMaxErrors = new Array(this.contactoIndirectoRanges.length).fill(false);
    this.promesasRotasMinErrors = new Array(this.promesasRotasRanges.length).fill(false);
    this.promesasRotasMaxErrors = new Array(this.promesasRotasRanges.length).fill(false);
    this.noContactadoMinErrors = new Array(this.noContactadoRanges.length).fill(false);
    this.noContactadoMaxErrors = new Array(this.noContactadoRanges.length).fill(false);
  }

  private getActiveRanges(): Range[] {
    switch (this.activeIndex) {
      case 0: return this.contactoDirectoRanges;
      case 1: return this.contactoIndirectoRanges;
      case 2: return this.promesasRotasRanges;
      case 3: return this.noContactadoRanges;
      default: return [];
    }
  }

  private getActiveMinErrors(): boolean[] {
    switch (this.activeIndex) {
      case 0: return this.contactoDirectoMinErrors;
      case 1: return this.contactoIndirectoMinErrors;
      case 2: return this.promesasRotasMinErrors;
      case 3: return this.noContactadoMinErrors;
      default: return [];
    }
  }

  private getActiveMaxErrors(): boolean[] {
    switch (this.activeIndex) {
      case 0: return this.contactoDirectoMaxErrors;
      case 1: return this.contactoIndirectoMaxErrors;
      case 2: return this.promesasRotasMaxErrors;
      case 3: return this.noContactadoMaxErrors;
      default: return [];
    }
  }

  addRange() {
    const ranges = this.getActiveRanges();
    if (ranges.length > 0) {
      const lastRange = ranges[ranges.length - 1];
      // Si el último rango es infinito, lo convertimos a uno normal
      if (lastRange.isChecked) {
        lastRange.isChecked = false;
        lastRange.max = lastRange.min + 1000;
      }
      const newRange: Range = {
        min: lastRange.max,
        max: lastRange.max + 1000,
        isChecked: true
      };
      ranges.push(newRange);
    } else {
      const newRange: Range = { min: 0, max: 1000, isChecked: false };
      ranges.push(newRange);
    }
    
    // Ordenar los rangos por min
    ranges.sort((a, b) => a.min - b.min);
    this.updateErrorArrays();
    // Limpiar errores al agregar nuevo rango
    this.clearAllErrors();
  }

  toggleCheck(index: number) {
    const ranges = this.getActiveRanges();
    ranges.forEach((range, i) => {
      if (i !== index) {
        range.isChecked = false;
      }
    });
    
    // Al cambiar checkbox, limpiar errores y validar solo si hay conflicto
    this.lastEditedRangeIndex = index;
    this.validateSpecificRange(index, 'min'); // Default to min for checkbox changes
  }

  isAnyChecked(): boolean {
    const ranges = this.getActiveRanges();
    return ranges.some(range => range.isChecked);
  }

  deleteRange(index: number) {
    const ranges = this.getActiveRanges();
    ranges.splice(index, 1);
    this.updateErrorArrays();
    this.clearAllErrors(); // Limpiar errores al eliminar
  }

  // Limpiar todos los errores
  private clearAllErrors() {
    const minErrors = this.getActiveMinErrors();
    const maxErrors = this.getActiveMaxErrors();
    minErrors.fill(false);
    maxErrors.fill(false);
    this.lastEditedRangeIndex = -1;
  }

  // Validar solo el rango específico que fue editado
  private validateSpecificRange(editedIndex: number, field: 'min' | 'max') {
    const ranges = this.getActiveRanges();
    const minErrors = this.getActiveMinErrors();
    const maxErrors = this.getActiveMaxErrors();
    const editedRange = ranges[editedIndex];

    // Clear errors for the edited range
    minErrors[editedIndex] = false;
    maxErrors[editedIndex] = false;

    // Check if min >= max in the edited range (if not infinite)
    if (!editedRange.isChecked && editedRange.min >= editedRange.max) {
      // Set error only on the field that was just edited
      if (field === 'min') {
        minErrors[editedIndex] = true;
      } else {
        maxErrors[editedIndex] = true;
      }
      return;
    }

    // Check for overlap with other ranges
    let hasOverlap = false;
    for (let i = 0; i < ranges.length; i++) {
      if (i === editedIndex) continue;
      
      const otherRange = ranges[i];
      let overlaps = false;

      if (!editedRange.isChecked && !otherRange.isChecked) {
        // Both ranges have defined limits - check for actual overlap
        // Ranges overlap if: editedRange.min < otherRange.max AND editedRange.max > otherRange.min
        overlaps = (editedRange.min < otherRange.max && editedRange.max > otherRange.min);
      } else if (editedRange.isChecked && !otherRange.isChecked) {
        // editedRange is infinite, otherRange has limit
        // Overlap if otherRange starts before editedRange's min
        overlaps = (otherRange.max > editedRange.min);
      } else if (!editedRange.isChecked && otherRange.isChecked) {
        // editedRange has limit, otherRange is infinite
        // Overlap if editedRange extends beyond otherRange's start
        overlaps = (editedRange.max > otherRange.min);
      } else if (editedRange.isChecked && otherRange.isChecked) {
        // Both are infinite - always overlap
        overlaps = true;
      }

      if (overlaps) {
        hasOverlap = true;
        break;
      }
    }

    // Set error only on the specific field that was edited if there's overlap
    if (hasOverlap) {
      if (field === 'min') {
        minErrors[editedIndex] = true;
      } else {
        maxErrors[editedIndex] = true;
      }
    }
  }

  // Updated methods for handling specific input changes
  onMinInputChange(index: number) {
    this.lastEditedRangeIndex = index;
    this.lastEditedField = 'min';
    setTimeout(() => {
      this.validateSpecificRange(index, 'min');
    }, 0);
  }

  onMaxInputChange(index: number) {
    this.lastEditedRangeIndex = index;
    this.lastEditedField = 'max';
    setTimeout(() => {
      this.validateSpecificRange(index, 'max');
    }, 0);
  }

  // Full validation for submission (keep original logic)
  validateRanges(): boolean {
    this.messageService.clear();
    let isValid = true;

    const sections = [
      { 
        ranges: this.contactoDirectoRanges, 
        minErrors: this.contactoDirectoMinErrors, 
        maxErrors: this.contactoDirectoMaxErrors 
      },
      { 
        ranges: this.contactoIndirectoRanges, 
        minErrors: this.contactoIndirectoMinErrors, 
        maxErrors: this.contactoIndirectoMaxErrors 
      },
      { 
        ranges: this.promesasRotasRanges, 
        minErrors: this.promesasRotasMinErrors, 
        maxErrors: this.promesasRotasMaxErrors 
      },
      { 
        ranges: this.noContactadoRanges, 
        minErrors: this.noContactadoMinErrors, 
        maxErrors: this.noContactadoMaxErrors 
      },
    ];

    for (const section of sections) {
      const { ranges, minErrors, maxErrors } = section;
      minErrors.fill(false);
      maxErrors.fill(false);

      for (let i = 0; i < ranges.length; i++) {
        const current = ranges[i];
        
        // Error if min >= max (if not infinite range)
        if (!current.isChecked && current.min >= current.max) {
          minErrors[i] = true;
          maxErrors[i] = true;
          isValid = false;
          continue;
        }

        // Check overlap only with subsequent ranges
        for (let j = i + 1; j < ranges.length; j++) {
          const other = ranges[j];
          let hasOverlap = false;

          if (!current.isChecked && !other.isChecked) {
            hasOverlap = (current.min < other.max && current.max > other.min);
          } else if (current.isChecked && !other.isChecked) {
            hasOverlap = (other.min < current.min);
          } else if (!current.isChecked && other.isChecked) {
            hasOverlap = (current.max > other.min);
          } else if (current.isChecked && other.isChecked) {
            hasOverlap = true;
          }

          if (hasOverlap) {
            minErrors[i] = true;
            maxErrors[i] = true;
            minErrors[j] = true;
            maxErrors[j] = true;
            isValid = false;
          }
        }
      }
    }

    if (!isValid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'Por favor, corrige los rangos marcados en rojo antes de continuar.'
      });
    }

    return isValid;
  }

  onTramoChange() {
    if (this.campaignName === 'Tramo 5' || this.campaignName === 'CONTACTO_TOTAL') {
      this.dueDatesSelected = [];
      this.contenido = false;
      this.filterType = 'saldoCapital'
    } else {
      this.contenido = true;
    }
  }

  onContenidoChange() {
    console.log(this.contenido);
  }

  isDatesDisabled(): boolean {
    return this.campaignName === 'Tramo 5' || this.campaignName === 'CONTACTO_TOTAL';
  }

  getSelectedDatesLabel(): string {
    const count = this.dueDatesSelected.length;
    if (count === 0) {
      return 'Fechas de vencimiento';
    }
    return count === 1 ? '1 fecha seleccionada' : `${count} fechas seleccionadas`;
  }

  printRanges() {
    if (!this.validateRanges()) {
      return;
    }

    const contactoDirectoRangesToConsult = this.contactoDirectoRanges.map(range => ({
      min: range.min.toString(),
      max: range.isChecked ? '+' : range.max.toString()
    }));

    const contactoIndirectoRangesToConsult = this.contactoIndirectoRanges.map(range => ({
      min: range.min.toString(),
      max: range.isChecked ? '+' : range.max.toString()
    }));

    const promesasRotasRangesToConsult = this.promesasRotasRanges.map(range => ({
      min: range.min.toString(),
      max: range.isChecked ? '+' : range.max.toString()
    }));

    const noContactadoRangesToConsult = this.noContactadoRanges.map(range => ({
      min: range.min.toString(),
      max: range.isChecked ? '+' : range.max.toString()
    }));

    const campañaYReporteRequest: CampaignReportRequest = {
      campaignName: this.campaignName,
      filterType: this.filterType,
      dueDates: this.dueDatesSelected,
      directContactRanges: contactoDirectoRangesToConsult,
      indirectContactRanges: contactoIndirectoRangesToConsult,
      brokenPromisesRanges: promesasRotasRangesToConsult,
      notContactedRanges: noContactadoRangesToConsult,
      content: !this.contenido,
      excluirPagadasHoy: this.excluirPagadasHoy
    };

    console.log(campañaYReporteRequest);

    Swal.fire({
      title: 'Procesando...',
      html: 'Insertando rangos, consultando y generando reporte...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.campañaService.getFileToCampaña(campañaYReporteRequest).subscribe(
      (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output-files.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        Swal.fire({
          icon: 'success',
          title: 'Exitoso!',
          text: 'Los rangos han sido procesados correctamente.',
        });
      },
      (error) => {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Un error ha ocurrido al procesar los rangos.',
        });
      }
    );
  }
}