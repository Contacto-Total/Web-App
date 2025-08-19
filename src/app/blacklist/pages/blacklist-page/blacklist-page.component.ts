import { Component, OnInit } from '@angular/core';

import { BlacklistTableComponent } from "../../components/blacklist-table/blacklist-table.component";
import { ToolbarComponent } from '@/shared/components/toolbar/toolbar.component';
import { AddToBlacklistFormComponent } from '@/blacklist/components/add-to-blacklist-form/add-to-blacklist-form.component';
import { BlacklistService } from '@/blacklist/services/blacklist-service/blacklist.service';
import { BlacklistResponse } from '@/blacklist/model/response/blacklist.response';

@Component({
  selector: 'app-blacklist-page',
  standalone: true,
  imports: [ToolbarComponent, AddToBlacklistFormComponent, BlacklistTableComponent],
  templateUrl: './blacklist-page.component.html',
  styleUrl: './blacklist-page.component.css'
})
export class BlacklistPageComponent implements OnInit {
  blacklistRows: BlacklistResponse[] = [];

  constructor(private blacklistService: BlacklistService) {}

  ngOnInit(): void {
    this.loadBlacklistRows();
  }

  loadBlacklistRows(): void {
    this.blacklistService.getAllBlacklist().subscribe(
      (data) => {
        this.blacklistRows = data;
      },
      (error) => {
        console.error('Error al obtener la lista de blacklists', error);
      }
    );
  }
}
