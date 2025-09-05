import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {DynamicQueryRequest, Row, SmsPrecheckResult} from '../models/dyn-query';
import {environment} from "../../../environments/environment.development";

@Injectable({ providedIn: 'root' })
export class DynQueryService {
  private http = inject(HttpClient);
  // Deja la base en /plantillas/sms
  private baseUrl = environment.baseUrl + 'plantillas/sms';
  private exportUrl = environment.baseUrl + 'plantillas/sms/export';
  private precheckUrl = this.baseUrl + '/precheck';

  // preview (lista)
  run(body: DynamicQueryRequest) {
    return this.http.post<Row[]>(this.baseUrl, body);
  }

  export(body: DynamicQueryRequest) {
    const payload = { ...body, limit: null as any };
    return this.http.post(this.exportUrl, payload, { responseType: 'blob' });
  }

  precheck(query: DynamicQueryRequest, template: string) {
    return this.http.post<SmsPrecheckResult>(this.precheckUrl, { query, template });
  }
}

