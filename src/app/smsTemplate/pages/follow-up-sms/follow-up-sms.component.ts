import { Component } from '@angular/core';
import {ToolbarComponent} from "@/shared/components/toolbar/toolbar.component";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-follow-up-sms',
  standalone: true,
  imports: [
    ToolbarComponent,
    MatCard,
    MatCardHeader,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatButton
  ],
  templateUrl: './follow-up-sms.component.html',
  styleUrl: './follow-up-sms.component.css'
})
export class FollowUpSmsComponent {

  mensaje: string = "Samuel, usted tiene una promesa de pago de S/100.";

  editarMensaje() {
    const nuevoMensaje = prompt("Editar mensaje:", this.mensaje);
    if (nuevoMensaje !== null) {
      this.mensaje = nuevoMensaje;
    }
  }

  generarMensaje() {
    // Lógica futura para generar Excel
    alert("Se generará el mensaje para el envío a los destinatarios.");
  }

}
