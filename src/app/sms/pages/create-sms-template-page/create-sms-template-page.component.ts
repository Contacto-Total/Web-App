import { Component } from '@angular/core';

import { ToolbarComponent } from '@/shared/components/toolbar/toolbar.component';
import { CreateSmsTemplateFormComponent } from '@/sms/components/create-sms-template-form/create-sms-template-form.component';

@Component({
  selector: 'app-create-sms-template-page',
  standalone: true,
  imports: [ToolbarComponent, CreateSmsTemplateFormComponent],
  templateUrl: './create-sms-template-page.component.html',
  styleUrl: './create-sms-template-page.component.css'
})
export class CreateSmsTemplatePageComponent {

}
