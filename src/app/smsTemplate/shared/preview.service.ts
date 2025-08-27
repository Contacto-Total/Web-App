import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DynamicQueryRequest, DynamicPreviewResponse } from './sms-models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PreviewService {
  private base = `${environment.baseUrl}/api/plantillas/sms`;

  constructor(private http: HttpClient) {}

  previewDynamic(req: DynamicQueryRequest) {
    return this.http.post<DynamicPreviewResponse>(
      `${this.base}/dynamic/preview`, req
    );
  }
}
