import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TemplateDef } from './sms-models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TemplatesService {
  private base = environment.baseUrl;
  constructor(private http: HttpClient) {}

  getCompatibleTemplates(vars: string[]): Observable<TemplateDef[]> {
    return this.http.post<TemplateDef[]>(`${this.base}/templates/compatible`, { variables: vars });
  }
}
