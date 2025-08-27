import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-authentication-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './authentication-error-message.component.html',
  styleUrl: './authentication-error-message.component.css'
})
export class AuthenticationErrorMessageComponent {
  @Input() message?: string;
}
