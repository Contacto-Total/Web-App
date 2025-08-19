import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { TemplateResponse } from '@/sms/model/response/template.response';
import { CreateTemplateRequest } from '@/sms/model/request/create-template.request';
import { GenerateMessagesRequest } from '@/sms/model/request/generate-messages.request';
import { UpdateTemplateRequest } from '@/sms/model/request/update-template.request';

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

  getPlantillas(): Observable<TemplateResponse[]> {
    return this.http
      .get<TemplateResponse[]>(this.baseUrl, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  createPlantilla(plantilla: CreateTemplateRequest) {
    return this.http
      .post(this.baseUrl + "/create", plantilla, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  generateMessages(generateMessagesRequest: GenerateMessagesRequest) {
    return this.http
      .post(this.baseUrl + "/generate/messages", generateMessagesRequest, { ...this.fileHttpOptions, responseType: 'blob' })
      .pipe(retry(2), catchError(this.handleError));
  }

  updatePlantilla(plantilla: UpdateTemplateRequest) {
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
