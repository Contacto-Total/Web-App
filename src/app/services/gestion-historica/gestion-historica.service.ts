import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, retry, throwError } from 'rxjs';
import { DateRangeRequest } from '../../model/gestion-historica-audios.model';

@Injectable({
  providedIn: 'root'
})
export class GestionHistoricaService {

  baseUrl = environment.baseUrl + 'gestion/historica';

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

  getGestionHistoricaByDateRange(dateRangeRequest: DateRangeRequest) {
    return this.http
      .post(this.baseUrl + '/date/range', dateRangeRequest, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }
}