import { Component, OnInit } from '@angular/core';




import { TemplateResponse } from '@/sms/model/response/template.response';
import { UpdateSmsTemplateFormComponent } from '@/sms/components/update-sms-template-form/update-sms-template-form.component';
import { ToolbarComponent } from '@/shared/components/toolbar/toolbar.component';

@Component({
  selector: 'update-sms-template',
  standalone: true,
  imports: [ToolbarComponent, UpdateSmsTemplateFormComponent],
  templateUrl: './update-sms-template-page.component.html',
  styleUrl: './update-sms-template-page.component.css'
})
export class UpdateSmsTemplatePageComponent implements OnInit{
  templateInit!: TemplateResponse;

  ngOnInit(): void {
    this.templateInit = history.state.plantilla;
  }
}
