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
import { FormArray, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';

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

  rangeFields = [
    { key: 'DEUDA_TOTAL', label: 'Deuda total' },
    { key: 'CAPITAL',     label: 'Capital' },
    { key: 'SALDO_MORA',  label: 'Saldo mora' },
    { key: 'BAJA30',      label: 'Baja 30' },
    { key: 'LTD',         label: 'LTD' },
    { key: 'LTDE',        label: 'LTDE' },
    { key: 'PKM',         label: 'PKM' },
    { key: 'DIASMORA',    label: 'Días mora' },
  ];



  selected = new Set<ChipKey>((this.data?.selects as ChipKey[]) ?? []);

  form = this.fb.nonNullable.group({
    nombre: this.data.name ?? '',
    plantillaTexto: ['', [Validators.required, Validators.maxLength(612)]],
    descripcion: this.data.descripcion ?? '',
    tramo: (this.data.tramo as '3'|'5') ?? '3',

    // RESTRICCIONES
    noContenido: this.data.restricciones?.noContenido ?? true,
    excluirPromesasPeriodoActual: this.data.restricciones?.excluirPromesasPeriodoActual ?? true,
    excluirCompromisos: this.data.restricciones?.excluirCompromisos ?? true,
    excluirBlacklist: this.data.restricciones?.excluirBlacklist ?? true,

    // 💡 NUEVO: Condiciones (PROMESAS_*)
    cond_PROMESAS_HOY:      (this.data.condiciones ?? []).includes('PROMESAS_HOY'),
    cond_PROMESAS_MANANA:   (this.data.condiciones ?? []).includes('PROMESAS_MANANA'),
    cond_PROMESAS_MANANA2:  (this.data.condiciones ?? []).includes('PROMESAS_MANANA2'),
    cond_PROMESAS_ROTAS:    (this.data.condiciones ?? []).includes('PROMESAS_ROTAS'),

    importeExtra: this.fb.nonNullable.control<number>((this.data as any)?.importeExtra ?? 0),
    rangos: this.fb.array<FormGroup<any>>([]),
  });

  hasTopUpSelect(): boolean {
    return this.selected.has('LTD') || this.selected.has('LTDE') || this.selected.has('LTD_LTDE');
  }

  get rangosFA(): FormArray {
    return this.form.get('rangos') as FormArray;
  }

  private validateRange(): ValidatorFn {
    return (fg) => {
      const g = fg as FormGroup;
      const useMin = !!g.get('useMin')?.value;
      const useMax = !!g.get('useMax')?.value;
      const min = g.get('min')?.value;
      const max = g.get('max')?.value;

      // Si el usuario AÚN no activó límites, el rango no invalida
      if (!useMin && !useMax) return null;

      if (useMin && (min == null || min === '')) return { minRequired: true };
      if (useMax && (max == null || max === '')) return { maxRequired: true };
      if (useMin && useMax && Number(min) > Number(max)) return { rangeOrder: true };
      return null;
    };
  }


  private makeRange(): FormGroup {
    return this.fb.nonNullable.group(
      {
        field:        this.fb.nonNullable.control<string>('DEUDA_TOTAL', { validators: [Validators.required] }),
        mode:         this.fb.nonNullable.control<'gt' | 'lt'>('gt'),
        useMin:       this.fb.nonNullable.control<boolean>(false), // ⬅️ antes true
        min:          this.fb.control<number | null>(null),
        inclusiveMin: this.fb.nonNullable.control<boolean>(false),

        useMax:       this.fb.nonNullable.control<boolean>(false), // ⬅️ antes false (ok), lo dejamos igual
        max:          this.fb.control<number | null>(null),
        inclusiveMax: this.fb.nonNullable.control<boolean>(true),
      },
      { validators: [this.validateRange()] }
    );
  }

  addRange() { this.rangosFA.push(this.makeRange()); }
  removeRange(i: number) { this.rangosFA.removeAt(i); }

  changeOperator(i: number, mode: 'gt'|'lt') {
    const g = this.rangosFA.at(i) as FormGroup;
    g.get('mode')?.setValue(mode);
    if (mode === 'gt') {
      g.get('useMin')?.setValue(true);
      g.get('useMax')?.setValue(false);
      g.get('max')?.setValue(null);
    } else {
      g.get('useMin')?.setValue(false);
      g.get('useMax')?.setValue(true);
      g.get('min')?.setValue(null);
    }
  }

  toggleUseMin(i: number, checked: boolean) {
    const g = this.rangosFA.at(i) as FormGroup;
    g.get('useMin')?.setValue(checked);
    if (!checked) g.get('min')?.setValue(null);
  }
  toggleUseMax(i: number, checked: boolean) {
    const g = this.rangosFA.at(i) as FormGroup;
    g.get('useMax')?.setValue(checked);
    if (!checked) g.get('max')?.setValue(null);
  }

  fieldLabel(key: string | null | undefined): string {
    const k = String(key || '').toUpperCase();
    const f = this.rangeFields.find(x => x.key === k);
    return f?.label ?? k;
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
      this.syncNombreChipWithText();
      this.fetchSampleRow();
    } else if (this.data.plantillaSmsId) {
      // ⬇️ solo si NO vino embebido
      this.api.getPlantillaTexto(this.data.plantillaSmsId).subscribe({
        next: (txt: any) => {
          const real = typeof txt === 'string' ? txt : (txt?.template ?? '');
          this.smsCtrl.setValue(real || '');
          this.smsCtrl.markAsPristine();
          this.syncNombreChipWithText();
          this.fetchSampleRow();
        },
        error: _ => {
          this.smsCtrl.setValue('');
          this.smsCtrl.markAsPristine();
          this.syncNombreChipWithText();
          this.fetchSampleRow();
        }
      });
    }


    this.fetchSampleRow();
    this.smsCtrl.valueChanges.pipe(debounceTime(200)).subscribe(() => {
      this.syncNombreChipWithText();                 // 👈 también aquí
      this.fetchSampleRow();
    });

    const incoming = (this.data as any)?.rangos as Array<any> | undefined;
    if (Array.isArray(incoming) && incoming.length) {
      this.hydrateRanges(incoming);
    } else {
      this.api.get(this.data.id).subscribe({
        next: full => {
          const fromApi = (full as any)?.rangos as Array<any> | undefined;
          if (Array.isArray(fromApi) && fromApi.length) {
            this.rangosFA.clear();
            this.hydrateRanges(fromApi);
          }
        }
      });
    }


  }
  private hydrateRanges(rangos: Array<any>) {
    for (const r of rangos) {
      const g = this.makeRange();
      g.get('field')?.setValue(String(r.field || 'DEUDA_TOTAL').toUpperCase());
      g.get('inclusiveMin')?.setValue(
        r.inclusiveMin ?? r.inclusive_min ?? false
      );
      g.get('inclusiveMax')?.setValue(
        r.inclusiveMax ?? r.inclusive_max ?? true
      );

      const hasMin = r.min != null;
      const hasMax = r.max != null;

      if (hasMin && hasMax) {
        g.get('mode')?.setValue('gt'); // visualmente es intervalo
        g.get('useMin')?.setValue(true);
        g.get('useMax')?.setValue(true);
      } else if (hasMin) {
        g.get('mode')?.setValue('gt');
        g.get('useMin')?.setValue(true);
        g.get('useMax')?.setValue(false);
      } else if (hasMax) {
        g.get('mode')?.setValue('lt');
        g.get('useMin')?.setValue(false);
        g.get('useMax')?.setValue(true);
      } else {
        continue; // evita empujar un rango vacío
      }

      g.get('min')?.setValue(hasMin ? Number(r.min) : null);
      g.get('max')?.setValue(hasMax ? Number(r.max) : null);
      g.get('inclusiveMin')?.setValue(!!r.inclusiveMin);
      g.get('inclusiveMax')?.setValue(!!r.inclusiveMax);

      this.rangosFA.push(g);
    }
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
      // Quitar selección normal
      this.selected.delete(k);
      this.removePlaceholder(ph);
    } else {
      // 🔒 Reglas de exclusión (financiero)
      // BAJA30 / SALDO_MORA ↔ BAJA30_SALDOMORA
      if (k === 'BAJA30' || k === 'SALDO_MORA') {
        this.forceDeselect('BAJA30_SALDOMORA');
      }
      if (k === 'BAJA30_SALDOMORA') {
        this.forceDeselect('BAJA30');
        this.forceDeselect('SALDO_MORA');
      }

      // LTD / LTDE ↔ LTD_LTDE
      if (k === 'LTD' || k === 'LTDE') {
        this.forceDeselect('LTD_LTDE');
      }
      if (k === 'LTD_LTDE') {
        this.forceDeselect('LTD');
        this.forceDeselect('LTDE');
      }

      // Selección normal
      this.selected.add(k);
      this.insertPlaceholderOnce(ph);
    }

    // Ajuste de importe extra
    if (!this.hasTopUpSelect()) {
      this.form.controls.importeExtra.setValue(0);
    }
  }





  close() { this.dialogRef.close(); }

  save() {
    this.submitted = true;
    if (this.form.invalid) { this.smsCtrl.markAsTouched(); return; }

    const v = this.form.getRawValue();

    const condiciones: string[] = [];
    if (v.cond_PROMESAS_HOY)     condiciones.push('PROMESAS_HOY');
    if (v.cond_PROMESAS_MANANA)  condiciones.push('PROMESAS_MANANA');
    if (v.cond_PROMESAS_MANANA2) condiciones.push('PROMESAS_MANANA2'); // hoy y mañana
    if (v.cond_PROMESAS_ROTAS)   condiciones.push('PROMESAS_ROTAS');

    const importeExtraAplica =
      this.hasTopUpSelect() && Number(v.importeExtra) > 0
        ? Math.trunc(Number(v.importeExtra))
        : null;
    const selectsSet = new Set<ChipKey>(this.selected);
    if (/\{NOMBRE\}/i.test(v.plantillaTexto || '')) {
      selectsSet.add('NOMBRE' as any);
    }

    const rangos = this.rangosFA.controls
      .map(g => {
        const field = String(g.get('field')?.value || '').toUpperCase();
        const useMin = !!g.get('useMin')?.value;
        const useMax = !!g.get('useMax')?.value;

        const rawMin = g.get('min')?.value;
        const rawMax = g.get('max')?.value;

        const minNum = Number(rawMin);
        const maxNum = Number(rawMax);

        return {
          field,
          min:  useMin && Number.isFinite(minNum) ? minNum : undefined, // 👈 evita NaN
          max:  useMax && Number.isFinite(maxNum) ? maxNum : undefined, // 👈 evita NaN
          inclusiveMin: !!g.get('inclusiveMin')?.value,
          inclusiveMax: !!g.get('inclusiveMax')?.value,
        };
      })
      .filter(r => r.min != null || r.max != null);

    const payload = {
      id: this.data.id,                // si decides dejar el PUT sin /{id}, igual lo mandas
      name: v.nombre,
      descripcion: v.descripcion,
      tramo: v.tramo,
      selects: Array.from(selectsSet),
      restricciones: {
        noContenido: !!v.noContenido,
        excluirPromesasPeriodoActual: !!v.excluirPromesasPeriodoActual,
        excluirCompromisos: !!v.excluirCompromisos,
        excluirBlacklist: !!v.excluirBlacklist
      },
      plantillaSmsId: this.data.plantillaSmsId ?? null,  // << AÑADIR ESTO
      plantillaTexto: v.plantillaTexto, // 👈 ENVIAR TEXTO
      plantillaName: v.nombre,
      condiciones,
      importeExtra: importeExtraAplica,
      rangos: rangos.length ? rangos : []
    };

    this.saving = true;
    this.api.update(this.data.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.showSuccess('Cambios guardados', 'Se actualizaron los datos del combo.')
          .subscribe(() => {
            this.dialogRef.close(true);
            this.router.navigate(['/SMS']);  // ir a la principal
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
  private forceDeselect(k: ChipKey) {
    if (!this.selected.has(k)) return;
    this.selected.delete(k);
    this.removePlaceholder(this.placeholderFromKey(k));
  }

  isChipDisabled(k: ChipKey): boolean {
    // Si ya está activo, no lo deshabilites (permitir deselección)
    if (this.selected.has(k)) return false;

    // BAJA30 / SALDO_MORA ↔ BAJA30_SALDOMORA
    if (k === 'BAJA30_SALDOMORA') {
      return this.selected.has('BAJA30') || this.selected.has('SALDO_MORA');
    }
    if (k === 'BAJA30' || k === 'SALDO_MORA') {
      return this.selected.has('BAJA30_SALDOMORA');
    }

    // LTD / LTDE ↔ LTD_LTDE
    if (k === 'LTD_LTDE') {
      return this.selected.has('LTD') || this.selected.has('LTDE');
    }
    if (k === 'LTD' || k === 'LTDE') {
      return this.selected.has('LTD_LTDE');
    }

    return false;
  }


}
