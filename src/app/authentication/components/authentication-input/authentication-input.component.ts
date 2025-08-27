import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-authentication-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './authentication-input.component.html',
  styleUrls: ['./authentication-input.component.scss']
})
export class AuthenticationInputComponent {
  @Input() label = '';
  @Input() type: string = 'text';
  @Input() control!: FormControl;
  @Input() errorMessage: string = 'Este campo es obligatorio';
}