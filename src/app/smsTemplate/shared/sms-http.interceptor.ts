import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';

@Injectable()
export class SmsHttpInterceptor implements HttpInterceptor {
  private active = 0;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.active++; document.body.classList.add('loading-cursor');
    return next.handle(req).pipe(finalize(() => {
      this.active--; if (this.active <= 0) document.body.classList.remove('loading-cursor');
    }));
  }
}
