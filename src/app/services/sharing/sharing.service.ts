import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable({
  providedIn: 'root'
})
export class SharingService {

  private categories = new BehaviorSubject<any>(null);
  currentCategories = this.categories.asObservable();

  private teams = new BehaviorSubject<any>(null);
  currentTeams = this.teams.asObservable();

  constructor(
    private db: AngularFireDatabase,
  ) {
    var a = this.db.database.ref('categories');
    a.on('value', snap => {
      var categories = [];
      snap.forEach(data => { categories.push({ key: data.key, ...data.val() }) });
      this.setCategories(categories);
    });
    var b = this.db.database.ref('teams');
    b.on('value', snap => {
      var teams = [];
      snap.forEach(data => { teams.push({ key: data.key, ...data.val() }) });
      this.setTeams(teams);
    })
  }

  setCategories(categories: any) {
    this.categories.next(categories);
  }

  setTeams(teams: any) {
    this.teams.next(teams);
  }
}
