import { SmsService } from '@/sms/services/sms/sms.service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const updateTemplateGuard: CanActivateFn = (route, state) => {
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
