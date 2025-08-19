import { Component, OnInit } from '@angular/core';
import { ToolbarComponent } from "../../components/toolbar/toolbar.component";
import { EditSmsTemplateFormComponent } from "../../components/edit-sms-template-form/edit-sms-template-form.component";
import { PlantillaResponse } from '../../model/plantilla.model';

@Component({
  selector: 'app-edit-template',
  standalone: true,
  imports: [ToolbarComponent, EditSmsTemplateFormComponent],
  templateUrl: './edit-template.component.html',
  styleUrl: './edit-template.component.css'
})
export class EditTemplateComponent implements OnInit{
  templateInit!: PlantillaResponse;

  ngOnInit(): void {
    this.templateInit = history.state.plantilla;
  }
}
