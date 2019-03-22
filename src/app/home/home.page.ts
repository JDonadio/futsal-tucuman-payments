import { Component, OnInit, NgZone } from '@angular/core';
import { SharingService } from '../services/sharing.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { MessagesService } from '../services/messages.service';
import * as _ from 'lodash';

const months = [
  // { name: 'enero', key: 1 },
  // { name: 'febrero', key: 2 },
  { name: 'marzo', key: '3' },
  { name: 'abril', key: '4' },
  { name: 'mayo', key: '5' },
  { name: 'junio', key: '6' },
  { name: 'julio', key: '7' },
  { name: 'agosto', key: '8' },
  { name: 'septiembre', key: '9' },
  { name: 'octubre', key: '10' },
  { name: 'noviembre', key: '11' },
  { name: 'diciembre', key: '12' },
];

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public divisions: any;
  public months: any;
  public teams: any;
  public editMode: boolean;
  public teamForm: FormGroup;
  public selectedDivision: string;
  public selectedMonth: string;
  private focusedTeam: string;

  constructor(
    private firebaseService: FirebaseService,
    private sharingService: SharingService,
    private messagesService: MessagesService,
    private zone: NgZone,
    private formBuilder: FormBuilder,
  ) {
    this.focusedTeam = null;
    this.editMode = false;
    this.months = months;
    this.teamForm = this.formBuilder.group({
      name: ['', Validators.required],
      amount: [0, Validators.required],
      month: ['', Validators.required],
      division: ['', Validators.required],
    });
  }
  
  ngOnInit() {
    this.sharingService.currentDivisions.subscribe(divisions => {
      this.zone.run(() => {
        this.divisions = divisions;
        this.selectedDivision = divisions && divisions[0] && divisions[0].key;
      });
    });
    this.sharingService.currentTeams.subscribe(teams => {
      this.zone.run(() => {
        this.teams = teams;
        this.selectedMonth = '3';
      });
    });
  }

  changeEditMode(team?: any) {
    this.editMode = !this.editMode;

    if (team && team.key) {
      this.focusedTeam = team.key;
      this.teamForm.patchValue({ name: team.name });
      this.teamForm.patchValue({ amount: team.amount || 0 });
      this.teamForm.patchValue({ month: team.month || '3' });
      this.selectedMonth = team.month || '3';
      this.teamForm.patchValue({ division: team.division.key });
      this.selectedDivision = team.division.key;
    } else this.focusedTeam = null;
  }

  edit() {
    console.log(this.teamForm.value);
    let divisionKey = this.teamForm.get('division').value;
    let division = _.find(this.divisions, d => d.key == divisionKey);
    let monthKey = this.teamForm.get('month').value;
    let month = _.find(this.months, m => m.key == monthKey);
    let team = {
      name: this.teamForm.get('name').value,
      amount: parseInt(this.teamForm.get('amount').value),
      month: month.key,
      division
    }

    try {
      this.firebaseService.updateObject(`teams/${this.focusedTeam}`, team);
      this.messagesService.showToast({ msg: `El equipo ${team.name} ha sido editado correctamente!` });
      this.changeEditMode();
    } catch (err) {
      console.log(err);
      this.messagesService.showToast({ msg: 'Ha ocurrido un error. No se pudo editar el equipo.' });
    }
  }

  remove(team) {
    try {
      this.firebaseService.removeObject(`teams/${team.key}`);
      this.messagesService.showToast({ msg: `El equipo ${team.name} ha sido eliminado correctamente!` });
    } catch (err) {
      console.log(err);
      this.messagesService.showToast({ msg: 'Ha ocurrido un error. No se pudo eliminar el equipo.' });
    }
  }

  async askForRemove(team) {
    this.messagesService.showConfirm({ 
      title: 'Eliminar equipo', 
      msg: `¿Estás seguro de eliminar a ${team.name.toUpperCase()}?`
    }).then(() => this.remove(team))
  }
}
