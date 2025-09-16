import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToolbarComponent } from '@/shared/components/toolbar/toolbar.component';
import { ComboService } from '../../services/combo.service';
import { ComboResponse } from '../../models/combo-response';
import {toSignal} from "@angular/core/rxjs-interop";
import {finalize, startWith} from "rxjs";
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import {Row} from "@/SMS_DYNAMIC/models/dyn-query";
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {EditComboDialogComponent} from "@/SMS_DYNAMIC/pages/edit-combo-dialog/edit-combo-dialog.component";
import { renderPreviewMessage, smsSegmentsLen } from '../../utils';
import {AlertDialogComponent} from "@/SMS_DYNAMIC/Common/alert-dialog.component";
import {LoadingDialogComponent} from "@/SMS_DYNAMIC/Common/loading-dialog/loading-dialog.component";


type ChipKey =
  | 'NOMBRE'
  | 'LTD'
  | 'LTDE'
  | 'LTD_LTDE'
  | 'BAJA30'
  | 'SALDO_MORA'
  | 'BAJA30_SALDOMORA'
  | 'PKM'
  | 'CAPITAL'
  | 'DEUDA_TOTAL'
  | 'HOY'
  | 'MANANA'
  | 'NOMBRECOMPLETO'
  | 'EMAIL'
  | 'NUMCUENTAPMCP'
  | 'DIASMORA';


@Component({
  selector: 'app-combo-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    ToolbarComponent,
    MatDialogModule
  ],
  templateUrl: './combo-list-page.component.html',
  styleUrl: './combo-list-page.component.css'
})
export class ComboListPageComponent {
  private api = inject(ComboService);
  fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private router = inject(Router);


  previewSms = signal<string | null>(null);
  smsLen = (t: string) => smsSegmentsLen(t);


  openEdit(c: ComboResponse) {
    this.dialog.open(EditComboDialogComponent, {
      data: c,
      width: '650px',
      maxWidth: '92vw',
      autoFocus: false,
      panelClass: 'combo-dialog'   // para estilos del contenedor
    }).afterClosed().subscribe(ok => ok && this.load());
  }

  selectedCombo = signal<ComboResponse | null>(null);

  // ---- Preview (side sheet) ----
  previewOpen = signal(false);
  previewTitle = signal<string>('');
  previewRow = signal<Row | null>(null);
  previewLoading = signal(false);

  // orden/alias visual para las claves más comunes
  private previewOrder: Array<keyof Row> = [
    'DOCUMENTO', 'TELEFONOCELULAR', 'NOMBRE', 'BAJA30', 'DEUDA_TOTAL'
  ];
  private labelOf(k: string) {
    // alias visuales
    if (k === 'TELEFONOCELULAR') return 'TELÉFONO';
    if (k === 'DEUDA_TOTAL') return 'DEUDA TOTAL';
    return k.replaceAll('_',' ').toUpperCase();
  }

  preview(c: ComboResponse) {
    this.lockBodyScroll(true);
    this.previewOpen.set(true);
    this.previewTitle.set(`${c.name}`);
    this.previewLoading.set(true);
    this.previewRow.set(null);
    this.previewSms.set(null);
    this.selectedCombo.set(c);

    // 1) Traer filas (preview)
    this.api.previewFromCombo(c.id, 1000).subscribe({
      next: rows => {
        const first = rows?.[0] ?? {};
        this.previewRow.set(first);

        const renderYMostrar = (tpl: string) => {
          const rendered = renderPreviewMessage(tpl || '', first);
          this.previewSms.set(rendered || '(sin texto)');
          this.previewLoading.set(false);
        };

        // 2) Obtener texto de plantilla
        //   - si ya vino embebido en el combo, úsalo
        if ((c as any).plantillaTexto) {
          renderYMostrar((c as any).plantillaTexto as string);
        } else if (c.plantillaSmsId) {
          this.api.getPlantillaTexto(c.plantillaSmsId).subscribe({
            next: (res: any) => renderYMostrar(typeof res === 'string' ? res : (res?.template ?? '')),
            error: _ => { this.previewSms.set('(no se pudo cargar el texto)'); this.previewLoading.set(false); }
          });
        } else {
          // sin plantilla: al menos cierra el loading
          this.previewSms.set('(sin texto de SMS)');
          this.previewLoading.set(false);
        }
      },
      error: _ => {
        this.previewLoading.set(false);
        this.previewSms.set('(error al obtener preview)');
      }
    });
  }


  // estado
  all = signal<ComboResponse[]>([]);
  loading = signal(false);

  // filtros
  chips: { key: ChipKey; label: string }[] = [
    { key: 'NOMBRE', label: 'Nombre' },
    { key: 'LTD', label: 'LTD' },
    { key: 'LTDE', label: 'LTDE' },
    { key: 'LTD_LTDE', label: 'LTD + LTDE' },     // solo visual
    { key: 'BAJA30', label: 'Baja 30' },
    { key: 'SALDO_MORA', label: 'Mora' },
    { key: 'BAJA30_SALDOMORA', label: 'Baja30 + Mora' },
    { key: 'PKM', label: 'PKM'},
    { key: 'CAPITAL', label: 'Capital' },
    { key: 'DEUDA_TOTAL', label: 'Deuda Total' },
    { key: 'MANANA', label: 'Mañana'},
    { key: 'HOY',    label: 'Hoy'},
    { key: 'NOMBRECOMPLETO', label: 'Nombre Completo' },
    { key: 'EMAIL', label: 'Correo' },
    { key: 'NUMCUENTAPMCP', label: 'Número de Cuenta'},
    { key: 'DIASMORA',    label: 'Días Mora'},

  ];

  selected = signal<Set<ChipKey>>(new Set());

  form = this.fb.nonNullable.group({
    q: '',
    tramo: 'ALL' as 'ALL' | '3' | '5',
    soloActivos: true
  });

  filtersSig = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() }
  );

  // derivado: lista filtrada
  filtered = computed(() => {
    const { q, tramo, soloActivos } = this.filtersSig();
    const keys = this.selected();

    const qn = (q ?? '').trim().toLowerCase();

    return this.all().filter(c => {
      if (soloActivos && !c.isActive) return false;
      if (tramo !== 'ALL' && c.tramo !== tramo) return false;

      if (keys.size) {
        const s = new Set(c.selects);
        for (const k of keys) {
          if (k === 'NOMBRE') continue; // no filtra por selects
          if (!s.has(k)) return false;
        }
      }

      if (qn) {
        const hay = (c.name ?? '').toLowerCase().includes(qn) ||
          (c.plantillaTexto ?? '').toLowerCase().includes(qn);
        if (!hay) return false;
      }

      return true;
    });
  });

  displayedColumns = ['name','selects','acciones'];

  constructor(private bottomSheet: MatBottomSheet, private matDialog: MatDialog,) { this.load(); effect(() => this.filtered()); }

  load() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: rs => { this.all.set(rs ?? []); this.loading.set(false); },
      error: _ =>  { this.all.set([]);     this.loading.set(false); }
    });
  }

  trackById(_i: number, r: ComboResponse) { return r.id; }

  // chips
  isSelected(key: ChipKey) { return this.selected().has(key); }
  toggleChip(key: ChipKey) {
    const set = new Set(this.selected());
    set.has(key) ? set.delete(key) : set.add(key);
    this.selected.set(set); // filtered() se recalcula
  }
  clearChips() { this.selected.set(new Set()); }

  /** Pop-up reutilizable */
  private alert(message: string, title = 'Aviso') {
    this.matDialog.open(AlertDialogComponent, {
      width: '420px',
      data: { title, message }
    });
  }

  export(c: ComboResponse) {
    const id = c.id;

    // Abre el loader (hamster)
    const dlg = this.matDialog.open(LoadingDialogComponent, {
      disableClose: true,
      data: { title: 'Generando Excel…', subtitle: 'Preparando datos y creando archivo' },
      panelClass: 'loading-dialog-panel',
      backdropClass: 'blur-dialog-backdrop',
      width: '460px',
      height: '310px',
    });

    // 1) Precheck del combo (backend calcula usando la plantilla del combo)
    this.api.precheck(id).subscribe({
      next: (res) => {
        if (!res.ok) {
          // Cierra loader y muestra detalle del porqué no pasa el límite
          dlg.close();

          const header = `${res.excedidos} ${res.excedidos === 1 ? 'fila' : 'filas'} superan los caracteres.`;

          const ejemplosTxt = (res.ejemplos ?? [])
            .map((e, i) => `• ${e.len} caracteres — DNI: ${e.documento || '(sin DNI)'}`)
            .join('\n');

          this.alert(
            `${header}\n\nPrimeros ${Math.min((res.ejemplos ?? []).length, 3)} casos:\n${ejemplosTxt}$`,
            'Mensaje demasiado largo'
          );
          return;
        }

        // 2) Exportar (el backend devolverá 422 si no hay filas)
        this.api.exportFromCombo(id).pipe(finalize(() => dlg.close()))
          .subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `combo_${id}_${new Date().toISOString().slice(0,10)}.xlsx`;
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
          },
          error: (err) => {
            dlg.close();
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
        const msg = err?.error?.message || err?.message || 'No se pudo validar el SMS del combo.';
        this.alert(msg, 'Error en precheck');
      }
    });
  }

  // acciones desde el sheet
  exportSelected() {
    const c = this.selectedCombo();
    if (!c) return;
    this.export(c);
  }

  removeSelected() {
    const c = this.selectedCombo();
    if (!c) return;
    if (!confirm(`¿Eliminar el combo "${c.name}"?`)) return;
    this.api.delete(c.id).subscribe(() => {
      this.closePreview();
      this.load();
    });
  }

  closePreview() {
    this.previewOpen.set(false);
    this.lockBodyScroll(false);
    this.previewSms.set('');
    this.previewSms.set(null);
    this.previewRow.set(null);
    this.selectedCombo.set(null);
  }


  // devuelve pares [label, value] en orden bonito (si existen), y luego el resto
  previewPairs() {
    const row = this.previewRow();
    if (!row) return [] as Array<[string,string|number]>;

    const used = new Set<string>();
    const primary: Array<[string,string|number]> = [];
    for (const k of this.previewOrder) {
      if (row[k] !== undefined) {
        primary.push([this.labelOf(String(k)), row[k] as any]);
        used.add(String(k));
      }
    }
    const rest: Array<[string,string|number]> = [];
    for (const [k, v] of Object.entries(row)) {
      if (!used.has(k)) rest.push([this.labelOf(k), v as any]);
    }
    return [...primary, ...rest];
  }

  New() {
    this.router.navigate(['/Crear']);
  }


  remove(c: ComboResponse) {
    if (!confirm(`¿Eliminar el combo "${c.name}"?`)) return;
    this.api.delete(c.id).subscribe(() => this.load());
  }


  private savedScrollTop = 0;

  private lockBodyScroll(lock: boolean) {
    const body = document.body;
    if (lock) {
      this.savedScrollTop = window.scrollY || window.pageYOffset || 0;
      body.style.top = `-${this.savedScrollTop}px`;
      body.classList.add('no-scroll');
    } else {
      body.classList.remove('no-scroll');
      body.style.top = '';
      window.scrollTo(0, this.savedScrollTop || 0);
    }
  }


  visibleTags(c: ComboResponse) {
    const out = [...(c.selects ?? [])];
    if (/\{NOMBRE\}/i.test(c.plantillaTexto || '') && !out.includes('NOMBRE' as any)) {
      out.unshift('NOMBRE' as any);
    }
    return out;
  }

}
