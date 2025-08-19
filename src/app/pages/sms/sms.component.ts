import { Component } from '@angular/core';
import { ToolbarComponent } from "../../components/toolbar/toolbar.component";
import { SmsTemplatesComponent } from "../../components/sms-templates/sms-templates.component";

@Component({
  selector: 'app-sms',
  standalone: true,
  imports: [ToolbarComponent, SmsTemplatesComponent],
  templateUrl: './sms.component.html',
  styleUrl: './sms.component.css'
})
export class SmsComponent {

}
