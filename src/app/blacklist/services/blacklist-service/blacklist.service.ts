import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';

import { get } from 'node:http';
import { BlacklistResponse } from '@/blacklist/model/response/blacklist.response';
import { BlacklistRequest } from '@/blacklist/model/request/blacklist.request';

@Injectable({
  providedIn: 'root'
})
export class BlacklistService {

  baseUrl = environment.baseUrl + "blacklist";
  
  templateCanEdit: boolean = false;
  
  constructor(private http: HttpClient) { }
    
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      "ngrok-skip-browser-warning": "69420",
    })
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    console.error(`Código de error: ${error.status}, mensaje: ${errorMessage}`);
    return throwError(() => ({ status: error.status, message: errorMessage }));
  }

  handleErrorGet(error: HttpErrorResponse) {
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

  insertBlacklist(blacklist: BlacklistRequest) {
    return this.http
      .post(this.baseUrl, blacklist, { ...this.httpOptions, responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  getAllBlacklist(): Observable<BlacklistResponse[]> {
    return this.http
      .get<BlacklistResponse[]>(this.baseUrl + '/all', this.httpOptions)
      .pipe(retry(2), catchError(this.handleErrorGet));
  }
}
