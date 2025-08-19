import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { PrimeNGConfig } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Table } from 'primeng/table';
import { SortEvent } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import Swal from 'sweetalert2';

import { RecordingDownloadRequest } from '@/recordings/model/request/recording-download.request';
import { HistoricalRecordingsByDocumentRequest } from '@/recordings/model/request/historical-recordings-by-document.request';
import { HistoricalRecordingsByPhoneRequest } from '@/recordings/model/request/historical-recordings-by-phone.request';
import { HistoricalRecordingsService } from '@/recordings/services/historical-recordings-service/historical-recordings.service';
import { RecordingDownloadService } from '@/recordings/services/recording-download-service/recording-download.service';
import { RecordingEvaluationReportService } from '@/recordings/services/recording-evaluation-report-service/recording-evaluation-report.service';
import { CreateRecordingEvaluationReportRequest } from '@/recordings/model/request/create-recording-evaluation-report.request';

@Component({
  selector: 'app-recordings-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, CalendarModule, TagModule, DropdownModule, ToastModule, InputTextModule, ProgressSpinnerModule],
  templateUrl: './recordings-tracker.component.html',
  styleUrl: './recordings-tracker.component.css',
  providers: [MessageService]
})
export class RecordingsTrackerComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  gestiones: any[] = [];
  initialValue: any[] = [];

  isSorted: boolean | null = null;

  startDate: Date | null = null;
  endDate: Date | null = null;
  documento: string | null = null;
  telefono: string | null = null;
  errorMessage: string | null = null;

  resultados!: any[];

  tipoBusqueda = [
    { label: 'Fechas', value: 'fechas' },
    { label: 'Documento', value: 'documento' },
    { label: 'Telefono', value: 'telefono' }
  ];

  selectedTipoBusqueda: any;

  isLoading: boolean = false;

  constructor(private gestionHistoricaAudiosService: HistoricalRecordingsService, private ftpService: RecordingDownloadService, private audioEvaluacionService: RecordingEvaluationReportService, private primengConfig: PrimeNGConfig, private messageService: MessageService) {}

  ngOnInit(): void {
    this.primengConfig.setTranslation({
      dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    });

    this.resultados = [
      { label: 'FUERA DE SERVICIO - NO EXISTE', value: 'FUERA DE SERVICIO - NO EXISTE' },
      { label: 'APAGADO', value: 'APAGADO' },
      { label: 'NO CONTESTA', value: 'NO CONTESTA' },
      { label: 'MSJ VOZ - SMS - WSP - BAJO PUERTA', value: 'MSJ VOZ - SMS - WSP - BAJO PUERTA' },
      { label: 'EQUIVOCADO', value: 'EQUIVOCADO' },
      { label: 'CONTACTO CON TERCEROS', value: 'CONTACTO CON TERCEROS' },
      { label: 'CONTACTO CON TITULAR O ENCARGADO', value: 'CONTACTO CON TITULAR O ENCARGADO' },
      { label: 'OPORTUNIDAD DE PAGO', value: 'OPORTUNIDAD DE PAGO' },
      { label: 'FRACCIONADO O ARMADAS', value: 'FRACCIONADO O ARMADAS' },
      { label: 'PROMESA DE PAGO', value: 'PROMESA DE PAGO' },
      { label: 'RECORDATORIO DE PAGO', value: 'RECORDATORIO DE PAGO' },
      { label: 'CONFIRMACION DE ABONO', value: 'CONFIRMACION DE ABONO' },
      { label: 'CANCELACION PARCIAL', value: 'CANCELACION PARCIAL' },
      { label: 'CANCELACION TOTAL', value: 'CANCELACION TOTAL' },
      { label: 'CANCELACION NO REPORTADAS O APLICADAS', value: 'CANCELACION NO REPORTADAS O APLICADAS' },
      { label: 'FALLECIDO', value: 'FALLECIDO' }
    ];

    this.selectedTipoBusqueda = this.tipoBusqueda[0];
  }

  changeTypeSearch() {
    if (this.selectedTipoBusqueda.value === 'fechas') {
      this.startDate = null;
      this.endDate = null;
    } else if (this.selectedTipoBusqueda.value === 'documento') {
      this.documento = null;
    } else if (this.selectedTipoBusqueda.value === 'telefono'){
      this.telefono = null;
    }
  }

  validateDates() {
    this.errorMessage = null;

    if (this.startDate && this.endDate) {
      if (this.startDate > this.endDate) {
        this.errorMessage = "La fecha de inicio debe ser anterior a la fecha de fin.";
        return;
      }

      const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 2) {
        this.errorMessage = "La diferencia entre las fechas no puede ser mayor a 2 días.";
      }
    } else {
      this.errorMessage = "Por favor, selecciona ambas fechas.";
    }
  }

  searchByDates() {
    if (!this.startDate || !this.endDate) {
      return this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, selecciona ambas fechas.' });
    }

    if (this.errorMessage) {
      return this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Verificar la validacion de las fechas.' });
    }

    this.isLoading = true;

    const dateRangeRequest = {
      startDate: this.startDate.toISOString().split('T')[0],
      endDate: this.endDate.toISOString().split('T')[0]
    };

    this.gestionHistoricaAudiosService.getGestionHistoricaAudiosByDateRange(dateRangeRequest).subscribe(
      (data: any) => {
        this.gestiones = data;
        this.initialValue = [...data];
        this.dt.filteredValue = [...data];
        this.isLoading = false;
      },
      (error: any) => {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los datos.' });
        this.isLoading = false;
      }
    );
  }

  searchByDocumento() {
    if (!this.documento) {
      return this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, ingresa un documento.' });
    }

    this.isLoading = true;

    const documentoRequest: HistoricalRecordingsByDocumentRequest = {
      documento: this.documento
    };

    this.gestionHistoricaAudiosService.getGestionHistoricaAudiosByDocumento(documentoRequest).subscribe(
      (data: any) => {
        this.gestiones = data;
        this.initialValue = [...data];
        this.dt.filteredValue = [...data];
        this.isLoading = false;
      },
      (error: any) => {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los datos.' });
        this.isLoading = false;
      }
    );
  }

  searchByTelefono() {
    if (!this.telefono) {
      return this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, ingresa un teléfono.' });
    }

    this.isLoading = true;

    const telefonoRequest: HistoricalRecordingsByPhoneRequest = {
      telefono: this.telefono
    };

    this.gestionHistoricaAudiosService.getGestionHistoricaAudiosByTelefono(telefonoRequest).subscribe(
      (data: any) => {
        this.gestiones = data;
        this.initialValue = [...data];
        this.dt.filteredValue = [...data];
        this.isLoading = false;
      },
      (error: any) => {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los datos.' });
        this.isLoading = false;
      }
    );
  }

  customSort(event: SortEvent) {
    if (this.isSorted == null || this.isSorted === undefined) {
      this.isSorted = true;
      this.sortTableData(event);
    } else if (this.isSorted == true) {
      this.isSorted = false;
      this.sortTableData(event);
    } else if (this.isSorted == false) {
      this.isSorted = null;
      this.gestiones = [...this.initialValue];
      this.dt.reset();
    }
  }

  sortTableData(event: SortEvent) {
    if (event.data && event.field) {
      const order = event.order !== undefined ? event.order : 1;
        
      event.data.sort((data1, data2) => {
        let value1 = data1[event.field as string];
        let value2 = data2[event.field as string];
        let result = 0;

        if (value1 == null && value2 != null) result = -1;
        else if (value1 != null && value2 == null) result = 1;
        else if (value1 == null && value2 == null) result = 0;
        else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
        else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

        return order * result;
      });
    } else {
      console.error("No hay datos para ordenar o el campo no está definido.");
    }
  }

  downloadAudio(gestion: any) {
    const anio_chain = typeof gestion.anio === 'string' ? gestion.anio.split(',') : gestion.anio;
    const mes_chain = typeof gestion.mes === 'string' ? gestion.mes.split(',') : gestion.mes;
    const dia_chain = typeof gestion.dia === 'string' ? gestion.dia.split(',') : gestion.dia;
    const nombre_chain = typeof gestion.nombre === 'string' ? gestion.nombre.split(',') : gestion.nombre;

    for (let i = 0; i < anio_chain.length; i++) {
      const newFechaGestion = gestion.fechagestion.replace(/-/g, "");

      const downloadHistoricoAudioRequest: RecordingDownloadRequest = {
        anio: anio_chain[i],
        mes: mes_chain[i],
        dia: dia_chain[i],
        nombre: nombre_chain[i],
        fecha: newFechaGestion,
        resultado: gestion.resultado,
        telefono: gestion.telefono, 
        documento: gestion.documento,
        cliente: gestion.cliente,
        asesor: gestion.usuarioregistra
      };

      this.ftpService.downloadGestionHistoricaAudioFileByName(downloadHistoricoAudioRequest).subscribe(
        (data: Blob) => {
          const url = window.URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          if (i > 0) {
            a.download = `audio-${newFechaGestion}-${gestion.resultado}-${gestion.telefono}-${gestion.documento}-${gestion.cliente}-${gestion.usuarioregistra}(${i}).WAV`;
          } else {
            a.download = `audio-${newFechaGestion}-${gestion.resultado}-${gestion.telefono}-${gestion.documento}-${gestion.cliente}-${gestion.usuarioregistra}.WAV`;
          }
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        (error: any) => {
          this.messageService.add({ severity: 'error', summary: 'Gestion Seleccionada', detail: "No se encontro el audio." });
          console.log(error);
        }
      );
    }
  }

  downloadReport(gestion: any) {
    const createAudioEvaluacionFileRequest: CreateRecordingEvaluationReportRequest = {
      dni: gestion.documento,
      cliente: gestion.cliente,
      telefono: gestion.telefono,
      fecha: gestion.fechagestion,
      asesor: gestion.usuarioregistra,
      resultado: gestion.resultado,
      gestionHistoricaAudioIdx: gestion.idx
    };

    const newFechaGestion = gestion.fechagestion.replace(/-/g, "");

    this.audioEvaluacionService.downloadGestionHistoricaReporteFile(createAudioEvaluacionFileRequest).subscribe(
      (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${newFechaGestion}-${gestion.resultado}-${gestion.telefono}-${gestion.documento}-${gestion.cliente}-${gestion.usuarioregistra}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Gestion Seleccionada', detail: "No se encontro el reporte en la base de datos." });
        console.log(error);
      }
    );
  }

  massiveDownloadAudios() {
    var audiosToDownload = this.dt.filteredValue;

    if(audiosToDownload == null || audiosToDownload.length == 0) {
      audiosToDownload = this.gestiones;
      if(audiosToDownload == null || audiosToDownload.length == 0) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No hay datos para descargar.' });
        return;
      }
    }

    Swal.fire({
      title: 'Procesando...',
      html: 'Descargando audios...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const downloadHistoricoAudioRequests: RecordingDownloadRequest[] = [];

    audiosToDownload.forEach((gestion: any) => {
      const anio_chain = typeof gestion.anio === 'string' ? gestion.anio.split(',') : gestion.anio;
      const mes_chain = typeof gestion.mes === 'string' ? gestion.mes.split(',') : gestion.mes;
      const dia_chain = typeof gestion.dia === 'string' ? gestion.dia.split(',') : gestion.dia;
      const nombre_chain = typeof gestion.nombre === 'string' ? gestion.nombre.split(',') : gestion.nombre;

      for (let i = 0; i < anio_chain.length; i++) {
        const newFechaGestion = gestion.fechagestion.replace(/-/g, "");

        const downloadHistoricoAudioRequest: RecordingDownloadRequest = {
          anio: anio_chain[i],
          mes: mes_chain[i],
          dia: dia_chain[i],
          nombre: nombre_chain[i],
          fecha: newFechaGestion,
          resultado: gestion.resultado,
          telefono: gestion.telefono, 
          documento: gestion.documento,
          cliente: gestion.cliente,
          asesor: gestion.usuarioregistra
        };

        downloadHistoricoAudioRequests.push(downloadHistoricoAudioRequest);
      }
    });

    this.ftpService.downloadGestionHistoricaAudioFiles(downloadHistoricoAudioRequests).subscribe(
      (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audios.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        Swal.fire({
          icon: 'success',
          title: 'Exitoso!',
          text: 'Los audios fueron descargados.',
        });
      },
      (error: any) => {
        console.log(error);

        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Un error ha ocurrido al realizar la descarga.',
        });
      }
    );
  }

  massiveDownloadReports() {
    var reportsToDownload = this.dt.filteredValue;
    
    if(reportsToDownload == null || reportsToDownload.length == 0) {
      reportsToDownload = this.gestiones;
      if(reportsToDownload == null || reportsToDownload.length == 0) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No hay datos para descargar.' });
        return;
      }
    }

    Swal.fire({
      title: 'Procesando...',
      html: 'Descargando reportes...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const createAudioEvaluacionFileRequests: CreateRecordingEvaluationReportRequest[] = [];

    reportsToDownload.forEach((gestion: any) => {
      const createAudioEvaluacionFileRequest = {
        dni: gestion.documento,
        cliente: gestion.cliente,
        telefono: gestion.telefono,
        fecha: gestion.fechagestion,
        asesor: gestion.usuarioregistra,
        resultado: gestion.resultado,
        gestionHistoricaAudioIdx: gestion.idx
      };

      createAudioEvaluacionFileRequests.push(createAudioEvaluacionFileRequest);
    });

    this.audioEvaluacionService.downloadGestionHistoricaReporteFiles(createAudioEvaluacionFileRequests).subscribe(
      (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reportes.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        Swal.fire({
          icon: 'success',
          title: 'Exitoso!',
          text: 'Los reportes fueron descargados.',
        });
      },
      (error: any) => {
        console.log(error);

        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Un error ha ocurrido al realizar la descarga.',
        });
      }
    );
  }
}
