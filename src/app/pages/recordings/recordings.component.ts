import { Component } from '@angular/core';
import { ToolbarComponent } from "../../components/toolbar/toolbar.component";
import { ViewRecordingsTableComponent } from "../../components/view-recordings-table/view-recordings-table.component";

@Component({
  selector: 'app-recordings',
  standalone: true,
  imports: [ToolbarComponent, ViewRecordingsTableComponent],
  templateUrl: './recordings.component.html',
  styleUrl: './recordings.component.css'
})
export class RecordingsComponent {

}
