import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { GenerateMessagesRequest, PlantillaRequest, PlantillaResponse, PlantillaToUpdateRequest } from '../../model/plantilla.model';

@Injectable({
  providedIn: 'root'
})
export class SmsService {

  baseUrl = environment.baseUrl + "plantillas/sms";

  templateCanEdit: boolean = false;

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

  getPlantillas(): Observable<PlantillaResponse[]> {
    return this.http
      .get<PlantillaResponse[]>(this.baseUrl, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  createPlantilla(plantilla: PlantillaRequest) {
    return this.http
      .post(this.baseUrl + "/create", plantilla, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  generateMessages(generateMessagesRequest: GenerateMessagesRequest) {
    return this.http
      .post(this.baseUrl + "/generate/messages", generateMessagesRequest, { ...this.fileHttpOptions, responseType: 'blob' })
      .pipe(retry(2), catchError(this.handleError));
  }

  updatePlantilla(plantilla: PlantillaToUpdateRequest) {
    return this.http
      .put(this.baseUrl + "/update", plantilla, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  deletePlantilla(id: number) {
    return this.http
      .delete(this.baseUrl + "/delete/" + id, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }
}
