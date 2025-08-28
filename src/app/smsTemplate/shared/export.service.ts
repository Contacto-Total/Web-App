import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DynamicQueryRequest } from './sms-models';
import { Observable } from 'rxjs';
import {environment} from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class ExportService {
  private base = environment.baseUrl + 'plantillas/sms';

  constructor(private http: HttpClient) {}

  exportDynamic(req: DynamicQueryRequest) {
    return this.http.post(`${this.base}/dynamic/export`, req, {
      responseType: 'blob',
      headers: { 'ngrok-skip-browser-warning': '69420' }
    });
  }
}
