import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ClipboardModule } from '@angular/cdk/clipboard';
import {MatTableModule} from "@angular/material/table";

@NgModule({
  exports: [
    MatToolbarModule, MatIconModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule,
    MatTooltipModule, MatSnackBarModule, MatProgressBarModule, MatProgressSpinnerModule,
    MatTableModule, MatPaginatorModule, MatSortModule, ClipboardModule
  ]
})
export class MaterialModule {}
