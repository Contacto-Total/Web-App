import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DynamicQueryRequest } from './sms-models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private base = `${environment.baseUrl}/api/plantillas/sms`;

  exportDynamic(req: DynamicQueryRequest) {
    return this.http.post(
      `${this.base}/dynamic/export`,
      req,
      { responseType: 'blob' } // <- importante
    );
  }



  constructor(private http: HttpClient) {}
}
