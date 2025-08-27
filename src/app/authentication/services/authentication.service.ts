import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { SignInRequest } from '../model/request/sign-in.request';
import { SignInResponse } from '../model/response/sign-in.response';
import { SignUpRequest } from '../model/request/sign-up.request';
import { environment } from 'environments/environment.development';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly baseUrl = environment.baseUrl + 'authentication';

  constructor(private http: HttpClient) {}

  signIn(request: SignInRequest): Observable<SignInResponse> {
    return this.http.post<SignInResponse>(`${this.baseUrl}/sign-in`, request);
  }

  signUp(request: SignUpRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/sign-up`, request);
  }
}