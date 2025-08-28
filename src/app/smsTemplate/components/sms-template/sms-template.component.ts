import { Component } from '@angular/core';
import {Button} from "primeng/button";
import {CheckboxModule} from "primeng/checkbox";
import {ListboxModule} from "primeng/listbox";
import {NgForOf, NgIf} from "@angular/common";
import {PrimeTemplate} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {SmsTemplatesSelectorComponent} from "@/sms/components/sms-templates-selector/sms-templates-selector.component";
import {ToolbarComponent} from "@/shared/components/toolbar/toolbar.component";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-sms-template',
  standalone: true,
  imports: [
    Button,
    CheckboxModule,
    ListboxModule,
    NgForOf,
    NgIf,
    PrimeTemplate,
    ToastModule,
    SmsTemplatesSelectorComponent,
    ToolbarComponent,
    MatCard,
    MatCardHeader,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatButton,
    RouterLink
  ],
  templateUrl: './sms-template.component.html',
  styleUrl: './sms-template.component.css'
})
export class SmsTemplateComponent {

}
