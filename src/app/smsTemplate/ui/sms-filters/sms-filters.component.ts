import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule }     from '@angular/material/select';
import { MatInputModule }      from '@angular/material/input';
import { MatButtonModule }     from '@angular/material/button';
import { MatOptionModule }     from '@angular/material/core';

@Component({
  selector: 'app-sms-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule, MatSelectModule,
    MatInputModule, MatButtonModule, MatOptionModule
  ],
  templateUrl: './sms-filters.component.html',
  styleUrls: ['./sms-filters.component.css']
})
export class SmsFiltersComponent {
  form: FormGroup;

  @Output() apply = new EventEmitter<void>();
  @Output() resetClick = new EventEmitter<void>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      tramo: [[]],                    // multiple
      producto: ['AMBOS'],
      limite: [1]
    });
  }

  aplicar() { this.apply.emit(); }

  reset() {
    this.form.reset({ tramo: [], producto: 'AMBOS', limite: 1 });
    this.resetClick.emit();
  }

  // helper para el padre
  get value() {
    const v = this.form.value;
    return {
      tramos: v.tramo as number[] || [],
      producto: v.producto as 'AMBOS'|'LTD'|'LTDE',
      limite: Number(v.limite) || 1
    };
  }
}
