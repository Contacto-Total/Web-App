import { Component } from '@angular/core';
import { ToolbarComponent } from "@/shared/components/toolbar/toolbar.component";
import { RangeSliderComponent } from "@/campaign/components/range-slider/range-slider.component";

@Component({
  selector: 'app-campaign-page',
  standalone: true,
  imports: [ToolbarComponent, RangeSliderComponent],
  templateUrl: './campaign-page.component.html',
  styleUrl: './campaign-page.component.css'
})
export class CampaignPageComponent {

}
