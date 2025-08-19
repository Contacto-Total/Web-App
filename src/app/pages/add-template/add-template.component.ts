import { Component } from '@angular/core';
import { ToolbarComponent } from "../../components/toolbar/toolbar.component";
import { AddSmsTemplateFormComponent } from "../../components/add-sms-template-form/add-sms-template-form.component";

@Component({
  selector: 'app-add-template',
  standalone: true,
  imports: [ToolbarComponent, AddSmsTemplateFormComponent],
  templateUrl: './add-template.component.html',
  styleUrl: './add-template.component.css'
})
export class AddTemplateComponent {

}
