import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharingService {

  private user = new BehaviorSubject<any>(null);
  currentUser = this.user.asObservable();

  private divisions = new BehaviorSubject<any>(null);
  currentDivisions = this.divisions.asObservable();

  private teams = new BehaviorSubject<any>(null);
  currentTeams = this.teams.asObservable();

  private phase = new BehaviorSubject<any>(null);
  currentPhase = this.phase.asObservable();

  private calendar = new BehaviorSubject<any>(null);
  currentCalendar = this.calendar.asObservable();

  constructor(
    private db: AngularFireDatabase,
  ) {
    let localUser = JSON.parse(localStorage.getItem('user'));
    this.user.next(localUser);

    var divisions = this.db.database.ref('divisions');
    divisions.on('value', (snap: any) => {
      let divisions = [];
      snap.forEach(data => { divisions.push({ key: data.key, ...data.val() }) });
      this.setDivisions(divisions);
    });
    var teams = this.db.database.ref('teams');
    teams.on('value', (snap: any) => {
      let teams = [];
      snap.forEach(data => { teams.push({ key: data.key, ...data.val() }) });
      this.setTeams(teams);
    });
    var calendar = this.db.database.ref('calendar');
    calendar.on('value', (snap: any) => {
      this.setCalendar(snap.val());
    });
  }
  
  setUser(user: any) {
    this.user.next(user);
  }
  
  setDivisions(divisions: any) {
    this.divisions.next(divisions);
  }
  
  setTeams(teams: any) {
    this.teams.next(teams);
  }
  
  setPhase(phase: any) {
    this.phase.next(phase);
  }
  
  setCalendar(calendar: any) {
    this.calendar.next(calendar);
  }
}
