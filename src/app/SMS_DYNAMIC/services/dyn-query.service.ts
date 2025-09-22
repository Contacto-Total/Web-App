import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DynamicQueryRequest, Row, SmsPrecheckResult } from '../models/dyn-query';
import { environment } from '../../../environments/environment.development';

export interface PreviewInitReq {
  query: DynamicQueryRequest;
  candidatas?: string[]; // opcional
}
export interface PreviewCandidate {
  variable: string;
  filasQueResuelve: number;
}
export interface PreviewItem {
  documento: string;
  nombre: string;
  variableUsada: string | null;
  valorUsado: number | null;
  sms: string;
}
export interface PreviewInitResp {
  sessionId: string;
  total: number;
  resueltas: number;
  pendientes: number;
  candidatas: PreviewCandidate[];
  muestraPreview: PreviewItem[];
}

export interface PreviewStepResp extends PreviewInitResp {}

@Injectable({ providedIn: 'root' })
export class DynQueryService {
  private http = inject(HttpClient);
  private root = `${environment.baseUrl}plantillas/sms`;

  // ✅ endpoints reales del backend
  private dynamicQueryUrl = `${this.root}/dynamic-query`;
  private exportUrl       = `${this.root}/export`;
  private precheckUrl     = `${this.root}/precheck`;

  // 👇 nuevos
  private previewInitUrl    = `${this.root}/preview/init`;
  private previewChooseUrl  = `${this.root}/preview/choose`;
  private previewSkipUrl    = `${this.root}/preview/skip`;
  private previewDlUrl      = `${this.root}/preview/download`;


  /** Ejecuta la consulta dinámica (para tabla/preview en la misma página) */
  run(body: DynamicQueryRequest) {
    return this.http.post<Row[]>(this.dynamicQueryUrl, body);
  }

  /** Precheck de 160 caracteres (el backend espera { query, template }) */
  precheck(body: DynamicQueryRequest, template: string) {
    return this.http.post<SmsPrecheckResult>(this.precheckUrl, { query: body, template });
  }

// ✅ no fuerces limit:null; no envíes plantillaTexto
  export(body: DynamicQueryRequest, template: string) {
    const payload: any = { ...body };
    if (payload.limit == null) delete payload.limit;
    payload.selectAll = false;      // para que vengan todas las columnas
    payload.template = template;   // 👈 MANDAR LA PLANTILLA EN EL BODY
    return this.http.post(this.exportUrl, payload, { responseType: 'blob' });
  }

  // ======== PREVIEW (GUIADO) ========

  previewInit(query: DynamicQueryRequest, template: string, candidatas?: string[]) {
    const payload: PreviewInitReq = { query: { ...query, template } as any, candidatas };
    // (el backend usa query.template internamente; no se manda plantillaTexto)
    return this.http.post<PreviewInitResp>(this.previewInitUrl, payload);
  }

  previewChoose(sessionId: string, variableElegida: string) {
    return this.http.post<PreviewStepResp>(this.previewChooseUrl, { sessionId, variableElegida });
  }

  previewSkip(sessionId: string) {
    return this.http.post<PreviewStepResp>(this.previewSkipUrl, { sessionId });
  }

  previewDownload(sessionId: string) {
    return this.http.post(this.previewDlUrl, { sessionId }, { responseType: 'blob' });
  }
}
