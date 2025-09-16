import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent implements OnInit {
  @ViewChild('navToggle', { static: true }) navToggle!: ElementRef;
  @ViewChild('navMenu', { static: true }) navMenu!: ElementRef;

  menuVisible = false;

  constructor(private renderer: Renderer2, private router: Router) {}

  ngOnInit() {
    this.setupMenu();
  }

  setupMenu(): void {
    const toggle = this.navToggle.nativeElement;
    const nav = this.navMenu.nativeElement;
    const navItems = Array.from(nav.querySelectorAll('a')) as HTMLElement[];

    this.renderer.listen(toggle, 'click', () => {
      this.menuVisible = !this.menuVisible;

      if (this.menuVisible) {
        this.renderer.addClass(nav, 'show-menu');
        this.renderer.addClass(toggle, 'show-icon');
      } else {
        this.renderer.removeClass(nav, 'show-menu');
        this.renderer.removeClass(toggle, 'show-icon');
      }
    });

    navItems.forEach((item: HTMLElement) => {
      this.renderer.listen(item, 'click', () => {
        this.renderer.removeClass(nav, 'show-menu');
        this.renderer.removeClass(toggle, 'show-icon');
        this.menuVisible = false;
      });
    });
  }

  goToCampania(): void {
    this.router.navigate(['/']).then();
  }

  goToCartas(): void {
    this.router.navigate(['/acuerdo-de-pago']).then();
  }

  goToSMS(): void {
    this.router.navigate(['/sms']).then();
  }

  goToTemplateSMS(): void {
    this.router.navigate(['/List-sms']).then();
  }

  goToRecordings(): void {
    this.router.navigate(['/recordings']).then();
  }

  goToMonitoreoReport() {
    this.router.navigate(['/monitoreo/report']);
  }

  goToSpeechReport() {
    this.router.navigate(['/speech/report']);
  }

  goToRankingReport() {
    this.router.navigate(['/ranking/report']);
  }

  goToContactoReport() {
    this.router.navigate(['/contacto/report']);
  }

  goToPowerBIReport() {
    this.router.navigate(['/powerbi/report']);
  }

  goToBlacklist(): void {
    this.router.navigate(['/blacklist']).then();
  }

  goToClose(): void {
    Swal.fire({
      title: '¿Estas seguro?',
      text: '¿Quieres cerrar la sesion?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        //this.authenticationService.signOut();
      }
    })
  }
}
