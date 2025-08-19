import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { PrimeNGConfig } from 'primeng/api';
import { BlacklistService } from '../../services/blacklist/blacklist.service';
import { BlacklistRequest } from '../../model/blacklist.model';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

interface Proveedor {
  name: string;
  value: string;
}

@Component({
  selector: 'app-add-blacklist',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownModule, InputTextModule, CalendarModule, ToastModule],
  templateUrl: './add-blacklist.component.html',
  styleUrl: './add-blacklist.component.css',
  providers: [MessageService]
})
export class AddBlacklistComponent implements OnInit{
  @Output() blacklistAdded = new EventEmitter<void>();

  proveedores: Proveedor[] | undefined;

  formGroup: FormGroup = new FormGroup({});

  constructor(private primengConfig: PrimeNGConfig, private blacklistService: BlacklistService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.primengConfig.setTranslation({
      dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    });

    this.proveedores = [
      { name: 'FINANCIERA OH', value: 'FINANCIERA_OH' },
      { name: 'PROVEEDOR', value: 'PROVEEDOR' }
    ];

    this.formGroup = new FormGroup({
      selectedProveedor: new FormControl<Proveedor | null>(null, Validators.required),
      documento: new FormControl<string | null>(null, Validators.required),
      fecha_fin: new FormControl<Date | null>(null, [Validators.required, this.fechaMayorOIgualHoy])
    });
  }

  fechaMayorOIgualHoy(control: FormControl): { [key: string]: boolean } | null {
    const fechaSeleccionada = control.value;
    const fechaHoy = new Date();
    if (fechaSeleccionada && fechaSeleccionada < fechaHoy) {
      return { 'fechaInvalida': true };
    }
    return null;
  }

  insertarBlacklist(): void {
    var temp_cartera = '';
    var temp_subcartera = '';
    var temp_entidad = '';

    const selectedProveedor = this.formGroup.value.selectedProveedor?.value;
    if (selectedProveedor === 'FINANCIERA_OH') {
      temp_cartera = 'FO_TRAMO 5';
      temp_subcartera = 'FO_TRAMO_5';
      temp_entidad = 'FUNO';
    } else if (selectedProveedor === 'PROVEEDOR') {
      temp_cartera = 'PROVEEDOR';
      temp_subcartera = 'PROVEEDOR';
      temp_entidad = 'PROVEEDOR';
    }

    const fechaFin = this.formGroup.value.fecha_fin 
      ? new Date(this.formGroup.value.fecha_fin).toISOString().split('T')[0] 
      : '';

    const fechaActual = new Date().toISOString().split('T')[0];

    const dni = this.formGroup.value.documento;

    const blacklistTemp: BlacklistRequest = {
      empresa: selectedProveedor,
      cartera: temp_cartera,
      subcartera: temp_subcartera,
      documento: this.formGroup.value.documento,
      fechaFin: fechaFin,
      entidad: temp_entidad
    };

    Swal.fire({
      title: 'Procesando...',
      html: 'Generando solicitud...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.blacklistService.insertBlacklist(blacklistTemp).subscribe(
      (response) => {
        this.formGroup.reset();
        this.blacklistAdded.emit();
        Swal.fire({
          icon: 'success',
          title: 'Agregado a Black List',
          html: `<pre>Cliente DNI: ${dni}
Fecha de inicio: ${fechaActual}
Fecha de fin: ${fechaFin}</pre>`
        });
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.message,
        });
      }
    );
  }
}