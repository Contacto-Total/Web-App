import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {map, Observable} from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {Row, SmsPrecheckResult} from '../models/dyn-query';
import { ComboCreateRequest } from '../models/combo';
import { ComboResponse,RangeDto  } from '../models/combo-response';

@Injectable({ providedIn: 'root' })
export class ComboService {

  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl + 'combos';

  /** Listar combos activos */
  list(): Observable<ComboResponse[]> {
    return this.http.get<ComboResponse[]>(this.baseUrl);
  }

  /** Obtener combo por id */
  get(id: number): Observable<ComboResponse> {
    return this.http.get<ComboResponse>(`${this.baseUrl}/${id}`);
  }

  /** Crear combo (y opcionalmente la plantilla de SMS si mandas plantillaTexto/plantillaName) */
  createCombo(body: ComboCreateRequest): Observable<number> {
    return this.http.post<number>(this.baseUrl, body);
  }

  // ComboService
  update(
    id: number,
    body: Partial<ComboCreateRequest> & {
      isActive?: boolean;
      plantillaSmsId?: number | null;
      rangos?: RangeDto[];            // ⬅️ añade esto
    }
  ) {
    return this.http.put<void>(`${this.baseUrl}`, { id, ...body });
  }


  /** Eliminar combo */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Preview desde combo (devuelve filas como la dinámica) */
  previewFromCombo(id: number, limit?: number) {
    let params = new HttpParams();
    if (limit != null) params = params.set('limit', String(limit));

    // Si backend espera POST (vacío o con params en query):
    return this.http.post<Row[]>(`${this.baseUrl}/${id}/preview`, null, { params });

  }

  getPlantillaTexto(id: number) {
    return this.http.get<{ template?: string } | string>(`${this.baseUrl}/plantillas/${id}`)
      .pipe(map((r: any) => typeof r === 'string' ? r : (r?.template ?? '')));
  }


  /** Exportar Excel desde combo (descarga blob) */
  exportFromCombo(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/export`, { responseType: 'blob' });
  }

  /** Precheck por combo */
  precheck(id: number, limit?: number) {
    let params = new HttpParams();
    if (limit != null) params = params.set('limit', String(limit));
    return this.http.post<SmsPrecheckResult>(`${this.baseUrl}/${id}/precheck`, null, { params });
  }
}
