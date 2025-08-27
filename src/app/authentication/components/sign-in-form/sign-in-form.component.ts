import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthenticationInputComponent } from '../authentication-input/authentication-input.component';
import { AuthenticationButtonComponent } from '../authentication-button/authentication-button.component';
import { AuthenticationErrorMessageComponent } from '../authentication-error-message/authentication-error-message.component';
import { AuthenticationStore } from '@/authentication/services/authentication.store';
import { SignInRequest } from '@/authentication/model/request/sign-in.request';

@Component({
  selector: 'app-sign-in-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthenticationInputComponent,
    AuthenticationButtonComponent,
    AuthenticationErrorMessageComponent,
  ],
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.css'],
})
export class SignInFormComponent {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthenticationStore);
  private router = inject(Router);

  form = this.fb.group({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  get emailControl(): FormControl<string> {
    return this.form.get('email') as FormControl<string>;
  }

  get passwordControl(): FormControl<string> {
    return this.form.get('password') as FormControl<string>;
  }

  isLoading = false;
  generalError = '';

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    const request: SignInRequest = { email, password };

    this.isLoading = true;
    this.generalError = '';

    try {
      this.authStore.signIn(request);
    } catch (error: any) {
      this.generalError = error?.message || 'Error al iniciar sesión';
    } finally {
      this.isLoading = false;
    }
  }

  goToSignUp() {
    this.router.navigate(['/sign-up']);
  }
}
