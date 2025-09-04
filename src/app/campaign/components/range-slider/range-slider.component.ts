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
import e from 'express';

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
    { label: 'Tramo 5', value: 'Tramo 5' }
  ];
  
  dueDatesSelected: string[] = [];
  dueDatesOptions: any[] = [];
  
  contactoDirectoRanges: Range[] = [];
  contactoIndirectoRanges: Range[] = [];
  promesasRotasRanges: Range[] = [];
  noContactadoRanges: Range[] = [];

  contenido: boolean = true;
  
  totalRange = 10000;
  activeIndex: number = 3;

  rangeErrors: {
    contactoDirecto: string[],
    contactoIndirecto: string[],
    promesasRotas: string[],
    noContactado: string[]
  } = {
    contactoDirecto: [],
    contactoIndirecto: [],
    promesasRotas: [],
    noContactado: []
  };
  
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

    this.campaignName = 'Tramo 3'; // Default campaign name
    this.contenido = true;
  
    this.contactoDirectoRanges = initialRangesCd.map(range => ({ ...range }));
    this.contactoIndirectoRanges = initialRangesCi.map(range => ({ ...range }));
    this.promesasRotasRanges = initialRangesPr.map(range => ({ ...range }));
    this.noContactadoRanges = initialRangesNc.map(range => ({ ...range }));
  }
  
  private getActiveRanges(): Range[] {
    switch (this.activeIndex) {
      case 0:
        return this.contactoDirectoRanges;
      case 1:
        return this.contactoIndirectoRanges;
      case 2:
        return this.promesasRotasRanges;
      case 3:
        return this.noContactadoRanges;
      default:
        return [];
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

    // Ordenar los rangos por min, para evitar desorden
    ranges.sort((a, b) => a.min - b.min);
  }


  
  toggleCheck(index: number) {
    const ranges = this.getActiveRanges();
  
    ranges.forEach((range, i) => {
      if (i !== index) {
        range.isChecked = false;
      }
    });
  }
  
  isAnyChecked(): boolean {
    const ranges = this.getActiveRanges();
    return ranges.some(range => range.isChecked);
  }
  
  deleteRange(index: number) {
    const ranges = this.getActiveRanges();
    ranges.splice(index, 1);
  }
  
  validateRanges(): boolean {
    this.messageService.clear();
    let isValid = true;

    const sections = [
      { name: 'Contacto Directo', ranges: this.contactoDirectoRanges },
      { name: 'Contacto Indirecto', ranges: this.contactoIndirectoRanges },
      { name: 'Promesas Rotas', ranges: this.promesasRotasRanges },
      { name: 'No Contactado', ranges: this.noContactadoRanges },
    ];

    for (const section of sections) {
      const { name, ranges } = section;

      // Ya no ordenamos: evaluamos tal como están
      for (let i = 0; i < ranges.length; i++) {
        const current = ranges[i];

        // Validar que min < max, si no es rango infinito
        if (!current.isChecked && current.min >= current.max) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error en ' + name,
            detail: `El rango ${i + 1} debe tener un mínimo menor que el máximo.`,
          });
          isValid = false;
        }

        // Validar superposición con anterior
        if (i > 0) {
          const prev = ranges[i - 1];

          if (prev.isChecked) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error en ' + name,
              detail: `El rango ${i} tiene un límite superior infinito. No puedes agregar más rangos después.`,
            });
            isValid = false;
          }

          if (!prev.isChecked && prev.max > current.min) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error en ' + name,
              detail: `Los rangos ${i} y ${i + 1} se superponen o están desordenados.`,
            });
            isValid = false;
          }
        }
      }
    }

    return isValid;
  }


  getRangesBySection(section: string): Range[] {
    switch (section) {
      case 'contactoDirecto':
        return this.contactoDirectoRanges;
      case 'contactoIndirecto':
        return this.contactoIndirectoRanges;
      case 'promesasRotas':
        return this.promesasRotasRanges;
      case 'noContactado':
        return this.noContactadoRanges;
      default:
        return [];
    }
  }


  onRangeChange(section: keyof typeof this.rangeErrors): void {
    // Solo validamos esa sección individualmente
    const ranges = this.getRangesBySection(section);
    const errors: string[] = Array(ranges.length).fill('');
    let isValid = true;

    // Validación individual
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      if (!r.isChecked && r.min >= r.max) {
        errors[i] = 'El mínimo debe ser menor al máximo.';
        isValid = false;
      }
    }

    // Validación cruzada
    const sorted = ranges.map((r, i) => ({ ...r, _originalIndex: i })).sort((a, b) => a.min - b.min);

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      if (!current.isChecked && current.max > next.min) {
        errors[current._originalIndex] = 'Este rango se superpone con el siguiente.';
        errors[next._originalIndex] = 'Este rango se superpone con el anterior.';
        isValid = false;
      }

      if (current.isChecked) {
        errors[current._originalIndex] = 'Un rango sin límite superior debe ir al final.';
        isValid = false;
      }
    }

    this.rangeErrors[section] = errors;
  }


  
  onTramoChange() {
    if (this.campaignName === 'Tramo 5') {
      this.dueDatesSelected = [];
      this.contenido = false;
    }
    else {
      this.contenido = true;
    }
    console.log(this.contenido)
  }

  onContenidoChange() {
    console.log(this.contenido)
  }

  isDatesDisabled(): boolean {
    return this.campaignName === 'Tramo 5';
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
      dueDates: this.dueDatesSelected,
      directContactRanges: contactoDirectoRangesToConsult,
      indirectContactRanges: contactoIndirectoRangesToConsult,
      brokenPromisesRanges: promesasRotasRangesToConsult,
      notContactedRanges: noContactadoRangesToConsult,
      content: this.contenido
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