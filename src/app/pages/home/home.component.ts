import { Component } from '@angular/core';
import { ToolbarComponent } from "../../components/toolbar/toolbar.component";
import { RangeSliderComponent } from "../../components/range-slider/range-slider.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ToolbarComponent, RangeSliderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
