import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, retry, throwError } from 'rxjs';
import { HistoricalRecordingsByPhoneRequest } from '@/recordings/model/request/historical-recordings-by-phone.request';
import { HistoricalRecordingsByDocumentRequest } from '@/recordings/model/request/historical-recordings-by-document.request';
import { HistoricalRecordingsByDateRangeRequest } from '@/recordings/model/request/historical-recordings-by-date-range.request';
import { HistoricalRecordingsByTractRequest } from '@/recordings/model/request/historical-recordings-by-tract';


@Injectable({
  providedIn: 'root'
})
export class HistoricalRecordingsService {

  baseUrl = environment.baseUrl + 'gestion/historica/audios';

  constructor(private http: HttpClient) { }

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

  getGestionHistoricaAudiosByTramo(tractRequest: HistoricalRecordingsByTractRequest) {
    return this.http
      .post(this.baseUrl + '/tramo', tractRequest, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  getGestionHistoricaAudiosByDateRange(dateRangeRequest: HistoricalRecordingsByDateRangeRequest) {
    return this.http
      .post(this.baseUrl + '/date/range', dateRangeRequest, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  getGestionHistoricaAudiosByDocumento(documentoRequest: HistoricalRecordingsByDocumentRequest) {
    return this.http
      .post(this.baseUrl + '/documento', documentoRequest, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  getGestionHistoricaAudiosByTelefono(telefonoRequest: HistoricalRecordingsByPhoneRequest) {
    return this.http
      .post(this.baseUrl + '/telefono', telefonoRequest, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }
}
