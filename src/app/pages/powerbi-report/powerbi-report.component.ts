import { Component } from '@angular/core';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';

@Component({
  selector: 'app-powerbi-report',
  standalone: true,
  imports: [ToolbarComponent],
  templateUrl: './powerbi-report.component.html',
  styleUrl: './powerbi-report.component.css'
})
export class PowerbiReportComponent {

}
