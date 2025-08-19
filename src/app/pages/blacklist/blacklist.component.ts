import { Component, OnInit } from '@angular/core';
import { ToolbarComponent } from "../../components/toolbar/toolbar.component";
import { AddBlacklistComponent } from "../../components/add-blacklist/add-blacklist.component";
import { BlacklistTableComponent } from "../../components/blacklist-table/blacklist-table.component";
import { BlacklistResponse } from '../../model/blacklist.model';
import { BlacklistService } from '../../services/blacklist/blacklist.service';

@Component({
  selector: 'app-blacklist',
  standalone: true,
  imports: [ToolbarComponent, AddBlacklistComponent, BlacklistTableComponent],
  templateUrl: './blacklist.component.html',
  styleUrl: './blacklist.component.css'
})
export class BlacklistComponent implements OnInit {
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
