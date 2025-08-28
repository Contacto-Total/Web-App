import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-sms-filters',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatInputModule, FormsModule],
  templateUrl: './sms-filters.component.html',
  styleUrls: ['./sms-filters.component.css']
})
export class SmsFiltersComponent implements OnChanges {
  @Input() forceTramo3 = false;

  tramo = signal<number | null>(null);
  exclPromesas = signal<boolean>(true);
  exclCompromisos = signal<boolean>(true);
  exclBlacklist = signal<boolean>(true);

  @Output() filtersChanged = new EventEmitter<{
    tramo: number | null;
    promesas: boolean;
    compromisos: boolean;
    blacklist: boolean;
  }>();

  ngOnChanges(changes: SimpleChanges): void {
    if (this.forceTramo3) {
      this.tramo.set(3);
    }
  }

  emit() {
    this.filtersChanged.emit({
      tramo: this.forceTramo3 ? 3 : this.tramo(),
      promesas: this.exclPromesas(),
      compromisos: this.exclCompromisos(),
      blacklist: this.exclBlacklist()
    });
  }
}
