import { HttpInterceptorFn } from '@angular/common/http';

const NGROK_HOST_FRAGMENT = 'ngrok-free.app';

export const ngrokInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const url = new URL(req.url);
    const isNgrok = url.host.includes(NGROK_HOST_FRAGMENT);
    if (isNgrok) {
      const cloned = req.clone({
        setHeaders: { 'ngrok-skip-browser-warning': 'true' }
      });
      return next(cloned);
    }
  } catch {
    // si no es URL absoluta, sigue normal
  }
  return next(req);
};
