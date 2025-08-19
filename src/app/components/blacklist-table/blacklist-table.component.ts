import { Component, Input, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { BlacklistService } from '../../services/blacklist/blacklist.service';
import { BlacklistResponse } from '../../model/blacklist.model';

@Component({
  selector: 'app-blacklist-table',
  standalone: true,
  imports: [TableModule],
  templateUrl: './blacklist-table.component.html',
  styleUrl: './blacklist-table.component.css'
})
export class BlacklistTableComponent {
  @Input() blacklistRows!: BlacklistResponse[];
}
