import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DynamicPreviewResponse, DynamicQueryRequest } from './sms-models';
import { Observable } from 'rxjs';
import {environment} from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class PreviewService {
  private base = environment.baseUrl + 'plantillas/sms';

  constructor(private http: HttpClient) {}

  previewDynamic(req: DynamicQueryRequest) {
    return this.http.post<DynamicPreviewResponse>(`${this.base}/dynamic/preview`, req, {
      headers: { 'ngrok-skip-browser-warning': '69420', 'Accept': 'application/json' }
    });
  }
}
