import { Component, inject, signal, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ComboResponse } from '../../models/combo-response';
import { ComboService } from '../../services/combo.service';
import { computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, startWith } from 'rxjs/operators';
import { Row } from '../../models/dyn-query';
import {Router} from "@angular/router";
import {SuccessDialogComponent} from "@/SMS_DYNAMIC/Common/success-dialog.component";

type ChipKey =
  | 'NOMBRE' | 'LTD' | 'LTDE' | 'LTD_LTDE'
  | 'BAJA30' | 'SALDO_MORA' | 'BAJA30_SALDOMORA'
  | 'CAPITAL' | 'DEUDA_TOTAL' | 'PKM' | 'HOY' | 'MANANA' | 'NOMBRECOMPLETO' | 'EMAIL' | 'NUMCUENTAPMCP' | 'DIASMORA';

const VAR_RE = /\{([A-Z0-9_]+)\}/gi;

@Component({
  selector: 'app-edit-combo-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatSelectModule, MatInputModule],
  templateUrl: './edit-combo-dialog.component.html',
  styleUrl: './edit-combo-dialog.component.css'
})
export class EditComboDialogComponent implements OnInit {

  private dialog = inject(MatDialog);
  private router = inject(Router);

  private dialogRef = inject(MatDialogRef<EditComboDialogComponent>);
  private data = inject<ComboResponse>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private api = inject(ComboService);

  // --- estado UI que faltaba ---
  submitted = false;
  saving = false;

  chips = [
    { key: 'NOMBRE' as ChipKey, label: 'Nombre', affectsSelects: true },
    { key: 'LTD' as ChipKey, label: 'LTD', affectsSelects: true },
    { key: 'LTDE' as ChipKey, label: 'LTDE', affectsSelects: true },
    { key: 'LTD_LTDE' as ChipKey, label: 'LTD + LTDE', affectsSelects: true },
    { key: 'BAJA30' as ChipKey, label: 'Baja 30', affectsSelects: true },
    { key: 'SALDO_MORA' as ChipKey, label: 'Mora', affectsSelects: true },
    { key: 'BAJA30_SALDOMORA' as ChipKey, label: 'Baja30 + Mora', affectsSelects: true },
    { key: 'CAPITAL' as ChipKey, label: 'Capital', affectsSelects: true },
    { key: 'DEUDA_TOTAL' as ChipKey, label: 'Deuda Total', affectsSelects: true },
    { key: 'PKM' as ChipKey, label: 'PKM', affectsSelects: true },
    { key: 'NOMBRECOMPLETO', label: 'Nombre completo', affectsSelects: true },
    { key: 'EMAIL', label: 'Correo', affectsSelects: true },
    { key: 'NUMCUENTAPMCP', label: 'N° de Cuenta', affectsSelects: true },
    { key: 'DIASMORA', label: 'Días mora', affectsSelects: true },
    { key: 'HOY' as ChipKey,    label: 'Hoy',    affectsSelects: false },
    { key: 'MANANA' as ChipKey, label: 'Mañana', affectsSelects: false },
  ];


  selected = new Set<ChipKey>((this.data?.selects as ChipKey[]) ?? []);

  form = this.fb.nonNullable.group({
    nombre: this.data.name ?? '',
    plantillaTexto: ['', [Validators.required, Validators.maxLength(612)]],
    descripcion: this.data.descripcion ?? '',
    tramo: (this.data.tramo as '3'|'5') ?? '3',
    noContenido: this.data.restricciones?.noContenido ?? true,
    excluirPromesasPeriodoActual: this.data.restricciones?.excluirPromesasPeriodoActual ?? true,
    excluirCompromisos: this.data.restricciones?.excluirCompromisos ?? true,
    excluirBlacklist: this.data.restricciones?.excluirBlacklist ?? true,
    importeExtra: this.fb.nonNullable.control<number>((this.data as any)?.importeExtra ?? 0),
  });

  hasTopUpSelect(): boolean {
    return this.selected.has('LTD') || this.selected.has('LTDE') || this.selected.has('LTD_LTDE');
  }

  private aliasKeys(raw: string): string[] {
    const k = raw.toUpperCase();
    switch (k) {
      case 'MORA':
      case 'SALDO_MORA':
        return ['SALDO_MORA', 'MORA', 'SALDO MORA'];
      case 'BAJA30':
        return ['BAJA30', 'BAJA_30', 'BAJA 30'];
      case 'BAJA30_SALDOMORA':
        return ['BAJA30_SALDOMORA', 'BAJA30_SALDO_MORA', 'BAJA 30 SALDO MORA'];
      case 'DEUDA_TOTAL':
        return ['DEUDA_TOTAL', 'DEUDA TOTAL'];
      case 'LTD_LTDE':
        return ['LTD_LTDE', 'LTD+LTDE', 'LTD LTDE'];
      default:
        return [k, k.replace(/\s+/g, '_')];
    }
  }

  private getVal(r: Record<string, any>, key: string): any {
    const candidates = this.aliasKeys(key);
    for (const c of candidates) {
      if (r.hasOwnProperty(c)) return r[c];
    }
    return undefined;
  }


  get smsCtrl() { return this.form.controls.plantillaTexto; }
  SMS_MAX = 160;
  smsLength() { return (this.smsCtrl.value || '').length; }
  smsSegundos() { const n = this.smsLength(); return Math.max(1, Math.ceil(n / 20)); }


  sampleRow = signal<Row|null>(null);

  ngOnInit() {
    const embebido = (this.data as any)?.plantillaTexto ?? '';
    if (embebido && typeof embebido === 'string') {
      this.smsCtrl.setValue(embebido);
      this.smsCtrl.markAsPristine();
      this.syncNombreChipWithText();                 // 👈 aquí
      this.fetchSampleRow();
      this.smsCtrl.valueChanges.pipe(debounceTime(200)).subscribe(() => {
        this.syncNombreChipWithText();               // 👈 y aquí
        this.fetchSampleRow();
      });
      return;
    }

    if (this.data.plantillaSmsId) {
      this.api.getPlantillaTexto(this.data.plantillaSmsId).subscribe({
        next: (txt: any) => {
          const real = typeof txt === 'string' ? txt : (txt?.template ?? '');
          this.smsCtrl.setValue(real || '');
          this.smsCtrl.markAsPristine();
          this.syncNombreChipWithText();             // 👈 después de setValue asíncrono
        },
        error: _ => {
          this.smsCtrl.setValue('');
          this.smsCtrl.markAsPristine();
          this.syncNombreChipWithText();             // 👈 por consistencia
        }
      });
    }

    this.fetchSampleRow();
    this.smsCtrl.valueChanges.pipe(debounceTime(200)).subscribe(() => {
      this.syncNombreChipWithText();                 // 👈 también aquí
      this.fetchSampleRow();
    });
  }



  private fetchSampleRow() {
    this.api.previewFromCombo(this.data.id, 100).subscribe({
      next: rows => this.sampleRow.set(rows?.[0] ?? null),
      error: () => this.sampleRow.set(null)
    });
  }

  private renderTemplate(tpl: string, row: Row|null): string {
    if (!tpl) return '';
    if (!row) return tpl;

    const r = row as Record<string, any>;
    const firstName = (s: any) => String(s ?? '').split(/\s+/)[0] || '';
    const fmtInt = (v: any) => Number.isFinite(Number(v)) ? Math.trunc(Number(v)).toLocaleString('es-PE') : '';
    const hoy = new Date();
    const manana = new Date(hoy.getTime() + 86400000);
    const fmtDate = (d: Date) => d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });

    return tpl.replace(VAR_RE, (_m, keyRaw) => {
      const key = String(keyRaw).toUpperCase(); // 👈 normaliza
      switch (key) {
        case 'NOMBRE': return firstName(this.getVal(r, 'NOMBRE'));
        case 'HOY':    return fmtDate(hoy);
        case 'MANANA': return fmtDate(manana);
        case 'DIASMORA':
        case 'LTD':
        case 'LTDE':
        case 'LTD_LTDE':
        case 'BAJA30':
        case 'SALDO_MORA':
        case 'BAJA30_SALDOMORA':
        case 'CAPITAL':
        case 'DEUDA_TOTAL':
        case 'PKM':
          return fmtInt(this.getVal(r, key));
        default:
          const v = this.getVal(r, key);
          return v === undefined ? '' : String(v);
      }
    });
  }


  previewText = computed(() => this.renderTemplate(this.smsCtrl.value, this.sampleRow()));

  onChipClick(ev: MouseEvent, k: ChipKey) {
    ev.preventDefault();
    ev.stopPropagation();
    this.toggleSelect(k);
  }

  private placeholderFromKey(k: ChipKey): string {
    // Si prefieres {MORA} en vez de {SALDO_MORA}, mapea aquí:
    // if (k === 'SALDO_MORA') return 'MORA';
    return k;
  }

  // --- helpers que pide el HTML ---
  hasSelect(k: ChipKey) {
    if (k === 'NOMBRE') {
      const cur = this.form.controls.plantillaTexto.value || '';
      return /\{NOMBRE\}/i.test(cur);   // 👈 si está en el texto, se ve activo
    }
    return this.selected.has(k);
  }

  toggleSelect(k: ChipKey) {
    const was = this.selected.has(k);
    const ph = this.placeholderFromKey(k);

    if (was) {
      this.selected.delete(k);
      this.removePlaceholder(ph);
    } else {
      this.selected.add(k);
      this.insertPlaceholderOnce(ph);
    }

    // 👇 siempre después de actualizar `selected`
    if (!this.hasTopUpSelect()) {
      this.form.controls.importeExtra.setValue(0);
    }
  }




  close() { this.dialogRef.close(); }

  save() {
    this.submitted = true;
    if (this.form.invalid) { this.smsCtrl.markAsTouched(); return; }

    const v = this.form.getRawValue();
    const importeExtraAplica =
      this.hasTopUpSelect() && Number(v.importeExtra) > 0
        ? Math.trunc(Number(v.importeExtra))
        : null;
    const selectsSet = new Set<ChipKey>(this.selected);
    if (/\{NOMBRE\}/i.test(v.plantillaTexto || '')) {
      selectsSet.add('NOMBRE' as any);
    }
    const payload = {
      id: this.data.id,                // si decides dejar el PUT sin /{id}, igual lo mandas
      name: v.nombre,
      descripcion: v.descripcion,
      tramo: v.tramo,
      selects: Array.from(selectsSet),
      condiciones: this.data.condiciones ?? [],
      restricciones: {
        noContenido: !!v.noContenido,
        excluirPromesasPeriodoActual: !!v.excluirPromesasPeriodoActual,
        excluirCompromisos: !!v.excluirCompromisos,
        excluirBlacklist: !!v.excluirBlacklist
      },
      plantillaSmsId: this.data.plantillaSmsId ?? null,  // << AÑADIR ESTO
      plantillaTexto: v.plantillaTexto, // 👈 ENVIAR TEXTO
      plantillaName: v.nombre,
      importeExtra: importeExtraAplica,
    };

    this.saving = true;
    this.api.update(this.data.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.showSuccess('Cambios guardados', 'Se actualizaron los datos del combo.')
          .subscribe(() => {
            this.dialogRef.close(true);
            this.router.navigate(['/List-sms']);  // ir a la principal
          });
      },
      error: () => { this.saving = false; this.dialogRef.close(false); }
    });
  }

  private insertPlaceholderOnce(placeholderKey: string) {
    const ctrl = this.form.controls.plantillaTexto;
    const cur = ctrl.value ?? '';
    const re = new RegExp(`\\{${placeholderKey}\\}(?!\\w)`, 'i'); // 👈 i
    if (re.test(cur)) return;
    const sep = cur && !cur.endsWith(' ') ? ' ' : '';
    ctrl.setValue(cur + `${sep}{${placeholderKey}}`);
    ctrl.markAsDirty();
  }


  protected readonly Math = Math;

  private removePlaceholder(key: string) {
    const ctrl = this.form.controls.plantillaTexto;
    const cur = ctrl.value ?? '';
    const re = new RegExp(`\\s*\\{${key}\\}`, 'i'); // 👈 i
    const next = cur.replace(re, '');
    if (next !== cur) {
      ctrl.setValue(next);
      ctrl.markAsDirty();
    }
  }

  private showSuccess(title: string, message?: string, ms = 1800) {
    return this.dialog.open(SuccessDialogComponent, {
      data: { title, message, autoCloseMs: ms },
      panelClass: 'dialog-success',
      disableClose: true
    }).afterClosed();
  }

  private syncNombreChipWithText() {
    const has = /\{NOMBRE\}/i.test(this.smsCtrl.value || '');
    if (has) this.selected.add('NOMBRE' as any);
    else this.selected.delete('NOMBRE' as any);
  }


}
