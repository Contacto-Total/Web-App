import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, retry, throwError } from 'rxjs';
import { RangoRequest } from '../../model/rango.model';
import { ReporteResponse } from '../../model/reporte.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  baseUrl = environment.baseUrl + 'reporte';

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

  getReporte(rangos: RangoRequest[]) {
    return this.http
      .post<ReporteResponse[]>(this.baseUrl, rangos, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }
}
