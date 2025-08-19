import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SmsService } from '../services/sms/sms.service';

export const plantillaGuardGuard: CanActivateFn = (route, state) => {
  const smsTemplate = inject(SmsService);
  const router = inject(Router);

  if (smsTemplate.templateCanEdit) {
    smsTemplate.templateCanEdit = false;
    return true;
  } else {
    router.navigate(['/sms']);
    return false;
  }
};
