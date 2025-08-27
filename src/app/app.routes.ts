import { Routes } from '@angular/router';
import { updateTemplateGuard } from './sms/guard/update-template-guard/update-template.guard';
import { authenticationGuard } from './authentication/guards/authentication.guard';
import { authRedirectGuard } from './authentication/guards/auth-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/campaña',
    pathMatch: 'full'
  },

  // Rutas públicas
  {
    path: 'sign-in',
    canActivate: [authRedirectGuard],
    loadComponent: () => import('./authentication/pages/sign-in-page/sign-in-page.component')
        .then(m => m.SignInPageComponent)
  },
  {
    path: 'sign-up',
    canActivate: [authRedirectGuard],
    loadComponent: () => import('./authentication/pages/sign-up-page/sign-up-page.component')
        .then(m => m.SignUpPageComponent)
  },

  // Rutas protegidas
  {
    path: 'campaña',
    canActivate: [authenticationGuard],
    loadComponent: () => import('./campaign/pages/campaign-page/campaign-page.component')
      .then(m => m.CampaignPageComponent)
  },

  {
    path: 'sms',
    canActivate: [authenticationGuard],
    loadComponent: () => import('./sms/pages/sms-page/sms-page.component')
      .then(m => m.SmsPageComponent)
  },

  {
    path: 'templateSMS',
    canActivate: [authenticationGuard],
    loadComponent: () => import('@/smsTemplate/components/sms-template/sms-template.component')
      .then(m => m.SmsTemplateComponent)
  },

  {
    path: 'follow-up-SMS',
    canActivate: [authenticationGuard],
    loadComponent: () => import('@/smsTemplate/pages/follow-up-sms/follow-up-sms.component')
      .then(m => m.FollowUpSmsComponent)
  },

  {
    path: 'payment-reminder-SMS',
    canActivate: [authenticationGuard],
    loadComponent: () => import('@/smsTemplate/pages/payment-reminder-sms/payment-reminder-sms.component')
      .then(m => m.PaymentReminderSmsComponent)
  },

  {
    path: 'add/template',
    canActivate: [authenticationGuard],
    loadComponent: () => import('./sms/pages/create-sms-template-page/create-sms-template-page.component')
      .then(m => m.CreateSmsTemplatePageComponent)
  },

  {
    path: 'edit/template',
    canActivate: [authenticationGuard, updateTemplateGuard],
    loadComponent: () => import('./sms/pages/update-sms-template-page/update-sms-template-page.component')
      .then(m => m.UpdateSmsTemplatePageComponent),
  },

  {
    path: 'recordings',
    canActivate: [authenticationGuard],
    loadComponent: () => import('./recordings/pages/recordings-page/recordings-page.component')
      .then(m => m.RecordingsPageComponent)
  },

  {
    path: 'contacto/report',
    canActivate: [authenticationGuard],
    loadComponent: () => import('./reports/pages/contact-report-page/contact-report-page.component')
      .then(m => m.ContactReportPageComponent)
  },

  {
    path: 'monitoreo/report',
    canActivate: [authenticationGuard],
    loadComponent: () => import('./reports/pages/monitoring-report-page/monitoring-report-page.component')
      .then(m => m.MonitoringReportPageComponent)
  },

  {
    path: 'ranking/report',
    canActivate: [authenticationGuard],
    loadComponent: () => import('./reports/pages/ranking-report-page/ranking-report-page.component')
      .then(m => m.RankingReportPageComponent)
  },

  {
    path: 'speech/report',
    canActivate: [authenticationGuard],
    loadComponent: () => import('./reports/pages/speech-report-page/speech-report-page.component')
      .then(m => m.SpeechReportPageComponent)
  },

  {
    path: 'powerbi/report',
    canActivate: [authenticationGuard],
    loadComponent: () => import('./reports/pages/power-bi-report-page/power-bi-report-page.component')
      .then(m => m.PowerBiReportPageComponent)
  },

  {
    path: 'blacklist',
    canActivate: [authenticationGuard],
    loadComponent: () => import('./blacklist/pages/blacklist-page/blacklist-page.component')
      .then(m => m.BlacklistPageComponent)
  }
];