import { Component } from '@angular/core';

import { SmsTemplatesSelectorComponent } from "../../components/sms-templates-selector/sms-templates-selector.component";
import { ToolbarComponent } from '@/shared/components/toolbar/toolbar.component';

@Component({
  selector: 'app-sms-page',
  standalone: true,
  imports: [ToolbarComponent, SmsTemplatesSelectorComponent],
  templateUrl: './sms-page.component.html',
  styleUrl: './sms-page.component.css'
})
export class SmsPageComponent {

}
