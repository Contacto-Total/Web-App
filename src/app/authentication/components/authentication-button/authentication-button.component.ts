import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-authentication-button',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './authentication-button.component.html',
  styleUrl: './authentication-button.component.css'
})
export class AuthenticationButtonComponent {
  @Input() color: 'primary' | 'accent' = 'primary';
  @Input() type: 'submit' | 'button' = 'submit';
  @Input() disabled = false;
  @Input() onClick?: () => void;
}
