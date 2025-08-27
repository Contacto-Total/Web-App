import { Component } from '@angular/core';

import { AuthenticationTitleComponent } from '@/authentication/components/authentication-title/authentication-title.component';
import { SignInFormComponent } from '@/authentication/components/sign-in-form/sign-in-form.component';

@Component({
  selector: 'app-sign-in-page',
  standalone: true,
  imports: [AuthenticationTitleComponent, SignInFormComponent],
  templateUrl: './sign-in-page.component.html',
  styleUrls: ['./sign-in-page.component.scss']
})
export class SignInPageComponent {}
