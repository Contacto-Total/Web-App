import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SmsComponent } from './pages/sms/sms.component';
import { AddTemplateComponent } from './pages/add-template/add-template.component';
import { EditTemplateComponent } from './pages/edit-template/edit-template.component';
import { plantillaGuardGuard } from './guard/plantilla-guard.guard';
import { RecordingsComponent } from './pages/recordings/recordings.component';
import { ContactoReportComponent } from './pages/contacto-report/contacto-report.component';
import { MonitoreoReportComponent } from './pages/monitoreo-report/monitoreo-report.component';
import { RankingReportComponent } from './pages/ranking-report/ranking-report.component';
import { SpeechReportComponent } from './pages/speech-report/speech-report.component';
import { PowerbiReportComponent } from './pages/powerbi-report/powerbi-report.component';
import { BlacklistComponent } from './pages/blacklist/blacklist.component';

export const routes: Routes = [
    {'path': '', redirectTo: '/home', pathMatch: 'full'},
    {'path': 'home', component: HomeComponent},
    {'path': 'sms', component: SmsComponent},
    {'path': 'add/template', component: AddTemplateComponent},
    {'path': 'edit/template', component: EditTemplateComponent, canActivate: [plantillaGuardGuard]},
    {'path': 'recordings', component: RecordingsComponent},
    {'path': 'contacto/report', component: ContactoReportComponent},
    {'path': 'monitoreo/report', component: MonitoreoReportComponent},
    {'path': 'ranking/report', component: RankingReportComponent},
    {'path': 'speech/report', component: SpeechReportComponent},
    {'path': 'powerbi/report', component: PowerbiReportComponent},
    {'path': 'blacklist', component: BlacklistComponent}
];