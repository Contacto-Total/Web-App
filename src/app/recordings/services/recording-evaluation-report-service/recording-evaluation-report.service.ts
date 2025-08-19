import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, retry, throwError } from 'rxjs';
import { CreateRecordingEvaluationReportRequest } from '@/recordings/model/request/create-recording-evaluation-report.request';


@Injectable({
  providedIn: 'root'
})
export class RecordingEvaluationReportService {

  baseUrl = environment.baseUrl + 'audio/evaluation';

  constructor(private http: HttpClient) { }

  fileHttpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      "ngrok-skip-browser-warning": "69420",
    }),
    responseType: 'blob' as 'json'
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

  downloadGestionHistoricaReporteFile(createAudioEvaluacionFileRequest: CreateRecordingEvaluationReportRequest) {
    return this.http
      .post(this.baseUrl + '/create', createAudioEvaluacionFileRequest, { ...this.fileHttpOptions, responseType: 'blob' })
      .pipe(retry(2), catchError(this.handleError));
  }

  downloadGestionHistoricaReporteFiles(createAudioEvaluacionFileRequest: CreateRecordingEvaluationReportRequest[]) {
    return this.http
      .post(this.baseUrl + '/create/zip', createAudioEvaluacionFileRequest, { ...this.fileHttpOptions, responseType: 'blob' })
      .pipe(retry(2), catchError(this.handleError));
  }
}
