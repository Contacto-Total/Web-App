import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, retry, throwError } from 'rxjs';
import { RecordingDownloadRequest } from '@/recordings/model/request/recording-download.request';


@Injectable({
  providedIn: 'root'
})
export class RecordingDownloadService {

  baseUrl = environment.baseUrl + 'recording';

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

  downloadGestionHistoricaAudioFileByName(downloadHistoricoAudioRequest: RecordingDownloadRequest) {
    return this.http
      .post(this.baseUrl + '/download/historico/audio', downloadHistoricoAudioRequest, { ...this.fileHttpOptions, responseType: 'blob' })
      .pipe(retry(2), catchError(this.handleError));
  }

  downloadGestionHistoricaAudioFiles(downloadHistoricoAudioRequest: RecordingDownloadRequest[]) {
    return this.http
      .post(this.baseUrl + '/download/historico/audio/zip', downloadHistoricoAudioRequest, { ...this.fileHttpOptions, responseType: 'blob' })
      .pipe(retry(2), catchError(this.handleError));
  }
}
