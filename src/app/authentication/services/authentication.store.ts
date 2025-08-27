import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { SignInRequest } from '../model/request/sign-in.request';
import { SignUpRequest } from '../model/request/sign-up.request';
import { AuthenticationState } from '../model/state/authentication.state';

@Injectable({ providedIn: 'root' })
export class AuthenticationStore {
  private readonly state$ = new BehaviorSubject<AuthenticationState>({
    isSignedIn: false,
    userId: 0,
    username: ''
  });

  private readonly isInitialized$ = new BehaviorSubject<boolean>(false);

  readonly auth$ = this.state$.asObservable();
  readonly initialized$ = this.isInitialized$.asObservable();

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {
    const token = localStorage.getItem('token');

    if (token) {
      // Si tienes info del usuario, puedes cargarla aquí
      this.state$.next({
        isSignedIn: true,
        userId: Number(localStorage.getItem('userId')) || 0,
        username: localStorage.getItem('username') || ''
      });
    }

    this.isInitialized$.next(true); // Marca que ya se leyó el localStorage
  }

  currentToken(): string | null {
    return localStorage.getItem('token');
  }

  signIn(request: SignInRequest): void {
    this.authService.signIn(request).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('userId', response.id.toString());
        this.state$.next({
          isSignedIn: true,
          userId: response.id,
          username: response.username
        });
        this.router.navigate(['/']);
      },
      error: () => {
        alert('Correo o contraseña incorrectos');
      }
    });
  }

  signUp(request: SignUpRequest): void {
    this.authService.signUp(request).subscribe({
      next: () => {
        alert('Registro exitoso. Inicia sesión.');
        this.router.navigate(['/sign-in']);
      },
      error: () => {
        alert('Error al registrarse.');
      }
    });
  }

  signOut(): void {
    localStorage.removeItem('token');
    this.state$.next({
      isSignedIn: false,
      userId: 0,
      username: ''
    });
    this.router.navigate(['/sign-in']);
  }

  get snapshot(): AuthenticationState {
    return this.state$.value;
  }
}
