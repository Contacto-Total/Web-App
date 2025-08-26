import { Injectable } from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SmsTemplateServiceService {

  baseUrl = environment.baseUrl + "plantillas/sms";

  constructor(private http: HttpClient) {}

  generateTramo5(onlyLtde: boolean): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/custom-sms`, {
      params: { onlyLtde: onlyLtde.toString() },
      responseType: 'blob',
      observe: 'response', // 👈 clave para acceder a headers
    });
  }
}
