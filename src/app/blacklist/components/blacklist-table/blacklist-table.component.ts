import { BlacklistResponse } from '@/blacklist/model/response/blacklist.response';
import { Component, Input, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';

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
