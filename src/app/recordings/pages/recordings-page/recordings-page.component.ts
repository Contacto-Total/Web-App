import { Component } from '@angular/core';

import { ToolbarComponent } from '@/shared/components/toolbar/toolbar.component';
import { RecordingsTrackerComponent } from '@/recordings/components/recordings-tracker/recordings-tracker.component';

@Component({
  selector: 'app-recordings-page',
  standalone: true,
  imports: [ToolbarComponent, RecordingsTrackerComponent],
  templateUrl: './recordings-page.component.html',
  styleUrl: './recordings-page.component.css'
})
export class RecordingsPageComponent {

}
