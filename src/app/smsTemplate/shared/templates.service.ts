import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TemplateDef } from './sms-models';
import { map, shareReplay } from 'rxjs/operators';
import {catchError, Observable, of} from 'rxjs';
import {environment} from "../../../environments/environment";

export interface DbTemplate {
  id: number;
  name: string;
  template: string;
}

@Injectable({ providedIn: 'root' })
export class TemplatesService {
  private base = environment.baseUrl + 'plantillas/sms';

  constructor(private http: HttpClient) {}

  getAll(): Observable<DbTemplate[]> {
    return this.http.get<DbTemplate[]>(this.base, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'Accept': 'application/json'
      }
    });
  }

}
