import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, retry, throwError } from 'rxjs';

import { CampaignReportRequest } from '../../model/request/campaign-report.request';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  fileHttpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      "ngrok-skip-browser-warning": "69420",
    }),
    responseType: 'blob' as 'json'
  }
  
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      "ngrok-skip-browser-warning": "69420",
    })
  }

  handleError(error: HttpErrorResponse) {
    if(error.error instanceof ErrorEvent) {
      console.log(
        `An error occurred ${error.status}, body was: ${error.error.message}`
      );
    } else {
      console.log(
        `Backend returned code ${error.status}, body was: ${error.error.message}`
      );
    }
    return throwError(() => ({ status: error.status, message: error.error.message }))
  }

  getDueDates() {
    return this.http
      .get<string[]>(this.baseUrl + 'campania/fechas-de-vencimiento-disponibles', this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  getFileToCampaña(campañaYReporteRequest: CampaignReportRequest) {
    return this.http
      .post(this.baseUrl + 'campania/generar-zip-reportes', campañaYReporteRequest, { ...this.fileHttpOptions, responseType: 'blob' })
      .pipe(retry(2), catchError(this.handleError));
  }
}
