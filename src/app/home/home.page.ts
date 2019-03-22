import { Component, OnInit, NgZone } from '@angular/core';
import { SharingService } from '../services/sharing.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { MessagesService } from '../services/messages.service';
import { ModalController } from '@ionic/angular';
import { ModalTeamPage } from '../modal-team/modal-team.page';
import * as _ from 'lodash';

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
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private zone: NgZone,
  ) {
    this.focusedTeam = null;
    this.editMode = false;
    this.teamForm = this.formBuilder.group({
      name: ['', Validators.required],
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
        if (!teams) return;
        this.teams = teams;
        this.teams.forEach(t => {
          t.totalAmount = _.sumBy(t.payments, 'amount');
        });
        this.selectedMonth = '3';
      });
    });
  }

  changeEditMode(team?: any) {
    this.editMode = !this.editMode;

    if (team && team.key) {
      this.focusedTeam = team.key;
      this.teamForm.patchValue({ name: team.name });
      this.teamForm.patchValue({ division: team.division.key });
      this.selectedDivision = team.division.key;
    } else this.focusedTeam = null;
  }

  edit() {
    console.log(this.teamForm.value);
    let divisionKey = this.teamForm.get('division').value;
    let division = _.find(this.divisions, d => d.key == divisionKey);
    let team = {
      name: this.teamForm.get('name').value,
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
    }).then(resp => {
      if (resp) this.remove(team)
    });
  }

  async openModal(team: any) {
    const modal = await this.modalCtrl.create({
      component: ModalTeamPage,
      componentProps: { ctx: team }
    });
    await modal.present();
  }
}
