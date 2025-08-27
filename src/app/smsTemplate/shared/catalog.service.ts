import { Injectable, inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { VariableDef, TemplateDef} from './sms-models';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);

  // quita slashes al final
  private api = (environment.baseUrl || '').replace(/\/+$/, '');

  getVariables(): Observable<VariableDef[]> {
    // NO pongas '/variables' con slash inicial
    return this.http.get<VariableDef[]>(`${this.api}/variables`);
  }

  getTemplates(payload: { variables: string[]; tramo: number[]; producto: string }): Observable<TemplateDef[]> {
    return this.http.post<TemplateDef[]>(`${this.api}/templates/compatible`, payload);
  }
}
