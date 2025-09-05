import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { DynQueryService } from '../../services/dyn-query.service';
import { DynamicQueryRequest, Row } from '../../models/dyn-query';
import { ToolbarComponent } from '@/shared/components/toolbar/toolbar.component';
import { ComboService } from '../../services/combo.service';
import { ComboCreateRequest } from '../../models/combo';
import { Router } from '@angular/router';
import {AlertDialogComponent} from "@/SMS_DYNAMIC/Common/alert-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-dyn-query-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTableModule,
    ToolbarComponent
  ],
  templateUrl: './dyn-query-page.component.html',
  styleUrl: './dyn-query-page.component.css'
})
export class DynQueryPageComponent {
  private api = inject(DynQueryService);
  private comboApi = inject(ComboService);
  private router = inject(Router);

  private selects = new Set<string>();
  private condiciones = new Set<string>(); // solo PROMESAS_* visibles

  chips = [
    { key: 'NOMBRE', label: 'Nombre', affectsSelects: false },
    { key: 'LTD', label: 'LTD', affectsSelects: true },
    { key: 'LTDE', label: 'LTDE', affectsSelects: true },
    { key: 'LTD_LTDE', label: 'LTD y LTDE', affectsSelects: true },
    { key: 'BAJA30', label: 'Baja 30', affectsSelects: true },
    { key: 'MORA', label: 'Saldo Mora', affectsSelects: true },
    { key: 'BAJA30_SALDOMORA', label: 'Baja 30 y Saldo Mora', affectsSelects: true },
    { key: 'PKM', label: 'PKM', affectsSelects: true },
    { key: 'CAPITAL', label: 'Capital', affectsSelects: true },
    { key: 'DEUDA_TOTAL', label: 'Deuda Total', affectsSelects: true },
    { key: 'HOY',    label: 'Hoy',    affectsSelects: false },
    { key: 'MANANA', label: 'Mañana', affectsSelects: false },
  ];
  // estado visual de selección
  selectedChips = new Set<string>();

  isSelected(key: string) { return this.selectedChips.has(key); }

// Toggle visual + lógica (insertar solo al seleccionar)
  toggleChip(key: string, affectsSelects = true) {
    if (this.selectedChips.has(key)) {
      this.selectedChips.delete(key);
      if (affectsSelects) this.selects.delete(key);
    } else {
      this.selectedChips.add(key);
      if (affectsSelects) this.selects.add(key);
      this.insertPlaceholderOnce(key);
    }
    if (!this.hasTopUpSelect()) {
      this.form.controls.importeExtra.setValue(0);
    }
  }

  // Inserta {KEY} una sola vez
  private insertPlaceholderOnce(key: string) {
    const ctrl = this.form.controls.plantillaTexto;
    const cur = ctrl.value ?? '';
    const already = new RegExp(`\\{${key}\\}(?!\\w)`).test(cur);
    if (already) return;

    const sep = cur && !cur.endsWith(' ') ? ' ' : '';
    ctrl.setValue(cur + `${sep}{${key}}`);
    ctrl.markAsDirty();
  }

  private hasTopUpSelect(): boolean {
    return (
      this.selectedChips.has('LTD') ||
      this.selectedChips.has('LTDE') ||
      this.selectedChips.has('LTD_LTDE')
    );
  }

  form = inject(FormBuilder).nonNullable.group({
    tramo: '3' as '3' | '5',
    excluirPromesasPeriodoActual: true,
    excluirCompromisos: true,
    excluirBlacklist: true,
    limit: 1000,

    // estos tres siguen siendo string
    nombre: inject(FormBuilder).nonNullable.control<string>(''),
    plantillaTexto: inject(FormBuilder).nonNullable.control<string>(''),
    descripcion: inject(FormBuilder).nonNullable.control<string>(''),

    // 👇 TIPAR COMO NÚMERO
    importeExtra: inject(FormBuilder).nonNullable.control<number>(0),
  });

  rows = signal<Row[]>([]);
  cols = signal<string[]>([]);

  // change de checkbox con inserción solo al marcar
  onSelectChange(ev: Event, key: string) {
    const input = ev.target as HTMLInputElement;
    if (input.checked) {
      this.selects.add(input.value);
      this.insertPlaceholder(key);
    } else {
      this.selects.delete(input.value);
    }
  }

  // change de condiciones (solo PROMESAS)
  toggleCond(ev: Event, key: 'PROMESAS_HOY'|'PROMESAS_MANANA'|'PROMESAS_ROTAS') {
    const input = ev.target as HTMLInputElement;
    if (input.checked) this.condiciones.add(key);
    else this.condiciones.delete(key);
  }

  private buildBody(limitForPreview: boolean): DynamicQueryRequest {
    const v = this.form.getRawValue();

    const selects = Array.from(this.selects).map(s => (s === 'MORA' ? 'SALDO_MORA' : s));
    const PROMESAS = new Set(['PROMESAS_HOY', 'PROMESAS_MANANA', 'PROMESAS_ROTAS']);
    const condiciones = Array.from(this.condiciones).filter(c => PROMESAS.has(c));

    // sólo lo mandamos si aplica y es > 0
    const importeExtraAplica =
      this.hasTopUpSelect() && Number(v.importeExtra) > 0
        ? Math.trunc(Number(v.importeExtra))
        : null;

    return {
      selects,
      tramo: v.tramo,
      condiciones,
      restricciones: {
        excluirPromesasPeriodoActual: !!v.excluirPromesasPeriodoActual,
        excluirCompromisos: !!v.excluirCompromisos,
        excluirBlacklist: !!v.excluirBlacklist
      },
      limit: limitForPreview ? Number(v.limit || 1000) : null,
      importeExtra: importeExtraAplica,
      selectAll: true,
      // << NUEVO: lo añadimos aquí para el precheck
      plantillaTexto: v.plantillaTexto ?? ''
    };
  }

  ejecutar() {
    const body = this.buildBody(true);
    this.api.run(body).subscribe(rs => {
      this.rows.set(rs);
      this.cols.set(rs.length ? Object.keys(rs[0]) : []);
    });
  }

  private matDialog = inject(MatDialog);

  // helper para mostrar pop-up
  private alert(message: string, title = 'Aviso') {
    this.matDialog.open(AlertDialogComponent, {
      width: '420px',
      data: { title, message }
    });
  }

  exportar() {
    const bodyForExport = this.buildBody(false);
    const template = this.form.controls.plantillaTexto.value ?? '';

    // 1) Precheck: envía { query, template }
    this.api.precheck(bodyForExport, template).subscribe({
      next: (res) => {
        if (!res.ok) {
          // Pop-up con detalle del porqué no pasa el límite
          const peor = res.peor
            ? `\n\nPeor caso: ${res.peor.len} chars (${res.peor.segments} SMS)` +
            (res.peor.documento ? ` • Doc: ${res.peor.documento}` : '')
            : '';

          const ejemplos = (res.ejemplos ?? [])
            .map(e => `• ${e.len} chars${e.documento ? ` • Doc ${e.documento}` : ''}`)
            .join('\n');

          this.alert(
            `No se puede exportar: ${res.excedidos} filas superan el límite de ${res.limite} caracteres.` +
            peor + (ejemplos ? `\n\nEjemplos:\n${ejemplos}` : ''),
            'SMS demasiado largo'
          );
          return;
        }

        // 2) Exportar todo (limit = null)
        const payload = { ...bodyForExport, limit: null as any };
        this.api.export(payload).subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resultado_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
          },
          error: (err) => {
            // 422 => backend detectó “sin filas para exportar”
            const msg =
              err?.status === 422
                ? (err?.error?.message || 'No hay filas para exportar con los filtros seleccionados.')
                : (err?.error?.message || err?.message || 'Ocurrió un error al exportar.');
            this.alert(msg, err?.status === 422 ? 'Sin resultados' : 'Error');
          }
        });
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'No se pudo validar el SMS.';
        this.alert(msg, 'Error en precheck');
      }
    });
  }




  // inserta {KEY} al final del textarea
  insertPlaceholder(key: string) {
    const ctrl = this.form.controls.plantillaTexto;
    const cur = ctrl.value ?? '';
    const sep = cur && !cur.endsWith(' ') ? ' ' : '';
    ctrl.setValue(cur + `${sep}{${key}}`);
    ctrl.markAsDirty();
  }

  guardarCombo() {
    const v = this.form.getRawValue();

    const payload: ComboCreateRequest = {
      name: v.nombre,
      plantillaName: v.nombre,
      descripcion: v.descripcion,
      tramo: v.tramo,
      selects: Array.from(this.selects),
      condiciones: Array.from(this.condiciones),
      restricciones: {
        excluirPromesasPeriodoActual: !!v.excluirPromesasPeriodoActual,
        excluirCompromisos: !!v.excluirCompromisos,
        excluirBlacklist: !!v.excluirBlacklist
      },
      // crea también la plantilla si viene el texto
      plantillaTexto: v.plantillaTexto
    };

    this.comboApi.createCombo(payload).subscribe(_id => {
      // reset suave
      this.form.reset({
        tramo: '3',
        excluirPromesasPeriodoActual: true,
        excluirCompromisos: true,
        excluirBlacklist: true,
        limit: 1000,
        nombre: '',
        plantillaTexto: '',
        descripcion: ''
      });
      this.selects.clear();
      this.condiciones.clear();
      this.rows.set([]);
      this.cols.set([]);
    });
  }

  Cancel() {
    this.router.navigate(['/List-sms']);
  }

  protected readonly Math = Math;
}
