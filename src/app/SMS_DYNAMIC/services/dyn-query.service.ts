import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DynamicQueryRequest, Row, SmsPrecheckResult } from '../models/dyn-query';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class DynQueryService {
  private http = inject(HttpClient);
  private root = `${environment.baseUrl}plantillas/sms`;

  // ✅ endpoints reales del backend
  private dynamicQueryUrl = `${this.root}/dynamic-query`;
  private exportUrl       = `${this.root}/export`;
  private precheckUrl     = `${this.root}/precheck`;

  /** Ejecuta la consulta dinámica (para tabla/preview en la misma página) */
  run(body: DynamicQueryRequest) {
    return this.http.post<Row[]>(this.dynamicQueryUrl, body);
  }

  /** Precheck de 160 caracteres (el backend espera { query, template }) */
  precheck(body: DynamicQueryRequest, template: string) {
    return this.http.post<SmsPrecheckResult>(this.precheckUrl, { query: body, template });
  }

// ✅ no fuerces limit:null; no envíes plantillaTexto
  export(body: DynamicQueryRequest) {
    const payload: any = { ...body };
    if (payload.limit == null) delete payload.limit;
    delete payload.plantillaTexto;
    return this.http.post(this.exportUrl, payload, { responseType: 'blob' });
  }
}
