import { Component, OnInit, NgZone } from '@angular/core';
import { SharingService } from '../services/sharing.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.page.html',
  styleUrls: ['./resume.page.scss'],
})
export class ResumePage implements OnInit {
  public divisions: any;
  public teamsIndexedByDivision: any;
  public teamsFor: any;
  public total: number;

  constructor(
    private sharingService: SharingService,
    private zone: NgZone,
  ) {
    this.teamsIndexedByDivision = {};
    this.teamsFor = {};
    this.total = 0;
  }

  ngOnInit() {
    this.sharingService.currentDivisions.subscribe(divisions => {
      this.zone.run(() => {
        if (!divisions) return;
        this.divisions = divisions;
      });
    });
    this.sharingService.currentTeams.subscribe(teams => {
      this.zone.run(() => {
        if (!teams) return;
        let indexedByDivisions = _.groupBy(_.orderBy(teams, t => t.division.name), _t => _t.division.key);
        _.each(indexedByDivisions, teams => {
          Object.assign(teams, { totalAmount: _.sumBy(teams, 'totalAmount') });
        });
        this.teamsIndexedByDivision = indexedByDivisions;
        console.log(indexedByDivisions);
        
        this.total = _.sumBy(_.values(indexedByDivisions), 'totalAmount');
      });
    });
  }

}
