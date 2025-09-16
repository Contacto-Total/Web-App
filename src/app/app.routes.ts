import { Routes } from '@angular/router';

import { CampaignPageComponent } from './campaign/pages/campaign-page/campaign-page.component';
import { SmsPageComponent } from './sms/pages/sms-page/sms-page.component';
import { RecordingsPageComponent } from './recordings/pages/recordings-page/recordings-page.component';
import { ContactReportPageComponent } from './reports/pages/contact-report-page/contact-report-page.component';
import { MonitoringReportPageComponent } from './reports/pages/monitoring-report-page/monitoring-report-page.component';
import { RankingReportPageComponent } from './reports/pages/ranking-report-page/ranking-report-page.component';
import { SpeechReportPageComponent } from './reports/pages/speech-report-page/speech-report-page.component';
import { PowerBiReportPageComponent } from './reports/pages/power-bi-report-page/power-bi-report-page.component';
import { BlacklistPageComponent } from './blacklist/pages/blacklist-page/blacklist-page.component';
import { PaymentAgreementCardPageComponent } from './agreements/pages/payment-agreement-card-page/payment-agreement-card-page.component';
import {ComboListPageComponent} from "@/SMS_DYNAMIC/pages/combo-list-page/combo-list-page.component";
import {DynQueryPageComponent} from "@/SMS_DYNAMIC/pages/dyn-query-page/dyn-query-page.component";

export const routes: Routes = [
    {'path': '', redirectTo: '/campaña', pathMatch: 'full'},
    {'path': 'campaña', component: CampaignPageComponent},
    {'path': 'sms', component: SmsPageComponent},
    {'path': 'SMS', component: ComboListPageComponent},
    {'path': 'crear', component: DynQueryPageComponent},
    {'path': 'recordings', component: RecordingsPageComponent},
    {'path': 'contacto/report', component: ContactReportPageComponent},
    {'path': 'monitoreo/report', component: MonitoringReportPageComponent},
    {'path': 'ranking/report', component: RankingReportPageComponent},
    {'path': 'speech/report', component: SpeechReportPageComponent},
    {'path': 'powerbi/report', component: PowerBiReportPageComponent},
    {'path': 'blacklist', component: BlacklistPageComponent},
    {'path': 'acuerdo-de-pago', component: PaymentAgreementCardPageComponent}
];
