import { Component, inject, signal, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ComboResponse } from '../../models/combo-response';
import { ComboService } from '../../services/combo.service';

type ChipKey =
  | 'NOMBRE' | 'LTD' | 'LTDE' | 'LTD_LTDE'
  | 'BAJA30' | 'SALDO_MORA' | 'BAJA30_SALDOMORA'
  | 'CAPITAL' | 'DEUDA_TOTAL' | 'PKM' | 'HOY' | 'MANANA';

@Component({
  selector: 'app-edit-combo-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatSelectModule, MatInputModule],
  templateUrl: './edit-combo-dialog.component.html',
  styleUrl: './edit-combo-dialog.component.css'
})
export class EditComboDialogComponent implements OnInit {

  private dialogRef = inject(MatDialogRef<EditComboDialogComponent>);
  private data = inject<ComboResponse>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private api = inject(ComboService);

  // --- estado UI que faltaba ---
  submitted = false;
  saving = false;

  chips = [
    { key: 'NOMBRE' as ChipKey, label: 'Nombre', affectsSelects: false },
    { key: 'LTD' as ChipKey, label: 'LTD', affectsSelects: true },
    { key: 'LTDE' as ChipKey, label: 'LTDE', affectsSelects: true },
    { key: 'LTD_LTDE' as ChipKey, label: 'LTD + LTDE', affectsSelects: true },
    { key: 'BAJA30' as ChipKey, label: 'Baja 30', affectsSelects: true },
    { key: 'SALDO_MORA' as ChipKey, label: 'Mora', affectsSelects: true },
    { key: 'BAJA30_SALDOMORA' as ChipKey, label: 'Baja30 + Mora', affectsSelects: true },
    { key: 'CAPITAL' as ChipKey, label: 'Capital', affectsSelects: true },
    { key: 'DEUDA_TOTAL' as ChipKey, label: 'Deuda Total', affectsSelects: true },
    { key: 'PKM' as ChipKey, label: 'PKM', affectsSelects: true },
    { key: 'HOY' as ChipKey,    label: 'Hoy',    affectsSelects: false },
    { key: 'MANANA' as ChipKey, label: 'Mañana', affectsSelects: false },
  ];


  selected = new Set<ChipKey>((this.data?.selects as ChipKey[]) ?? []);

  form = this.fb.nonNullable.group({
    nombre: this.data.name ?? '',
    plantillaTexto: ['', [Validators.required, Validators.maxLength(612)]],
    descripcion: this.data.descripcion ?? '',
    tramo: (this.data.tramo as '3'|'5') ?? '3',
    excluirPromesasPeriodoActual: this.data.restricciones?.excluirPromesasPeriodoActual ?? true,
    excluirCompromisos: this.data.restricciones?.excluirCompromisos ?? true,
    excluirBlacklist: this.data.restricciones?.excluirBlacklist ?? true,
  });

  get smsCtrl() { return this.form.controls.plantillaTexto; }
  SMS_MAX = 160;
  smsLength() { return (this.smsCtrl.value || '').length; }
  smsSegundos() { const n = this.smsLength(); return Math.max(1, Math.ceil(n / 20)); }

  ngOnInit() {
    // 1) si viene el texto embebido en el combo, úsalo
    const embebido = (this.data as any)?.plantillaTexto ?? '';
    if (embebido && typeof embebido === 'string') {
      this.smsCtrl.setValue(embebido);
      this.smsCtrl.markAsPristine();
      return;
    }

    // 2) si existe plantillaSmsId, intenta traerla; si falla (404), deja vacío
    if (this.data.plantillaSmsId) {
      this.api.getPlantillaTexto(this.data.plantillaSmsId).subscribe({
        next: (txt: any) => {
          const real = typeof txt === 'string' ? txt : (txt?.template ?? '');
          this.smsCtrl.setValue(real || '');
          this.smsCtrl.markAsPristine();
        },
        error: _ => {
          // ignora 404
          this.smsCtrl.setValue('');
          this.smsCtrl.markAsPristine();
        }
      });
    }
  }

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
  hasSelect(k: ChipKey) { return this.selected.has(k); }

  toggleSelect(k: ChipKey) {
    const was = this.selected.has(k);
    if (was) {
      this.selected.delete(k);
      return;
    }
    this.selected.add(k);

    // inserta {KEY} solo al seleccionar
    this.insertPlaceholderOnce(this.placeholderFromKey(k) as 'NOMBRE'|'HOY'|'MANANA'|string);
  }



  close() { this.dialogRef.close(); }

  save() {
    this.submitted = true;
    if (this.form.invalid) { this.smsCtrl.markAsTouched(); return; }

    const v = this.form.getRawValue();
    const payload = {
      id: this.data.id,                // si decides dejar el PUT sin /{id}, igual lo mandas
      name: v.nombre,
      descripcion: v.descripcion,
      tramo: v.tramo,
      selects: Array.from(this.selected).filter(s => s !== 'NOMBRE'),
      condiciones: this.data.condiciones ?? [],
      restricciones: {
        excluirPromesasPeriodoActual: !!v.excluirPromesasPeriodoActual,
        excluirCompromisos: !!v.excluirCompromisos,
        excluirBlacklist: !!v.excluirBlacklist
      },
      plantillaSmsId: this.data.plantillaSmsId ?? null,  // << AÑADIR ESTO
      plantillaTexto: v.plantillaTexto, // 👈 ENVIAR TEXTO
      plantillaName: v.nombre           // 👈 opcional para renombrar
    };

    this.saving = true;
    this.api.update(this.data.id, payload).subscribe({
      next: () => { this.saving = false; this.dialogRef.close(true); },
      error: () => { this.saving = false; this.dialogRef.close(false); }
    });
  }

  private insertPlaceholderOnce(placeholderKey: string) {
    const ctrl = this.form.controls.plantillaTexto;
    const cur = ctrl.value ?? '';
    const re = new RegExp(`\\{${placeholderKey}\\}(?!\\w)`);
    if (re.test(cur)) return; // ya existe
    const sep = cur && !cur.endsWith(' ') ? ' ' : '';
    ctrl.setValue(cur + `${sep}{${placeholderKey}}`);
    ctrl.markAsDirty();
  }


}
