import { Component, OnInit, NgZone } from '@angular/core';
import { SharingService } from '../services/sharing.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { MessagesService } from '../services/messages.service';
import { ModalController, AlertController } from '@ionic/angular';
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
  public filteredTeams: any;
  public editMode: boolean;
  public isLoggedIn: boolean;
  public teamForm: FormGroup;
  public selectedDivision: string;
  public selectedMonth: string;
  public searchText: string;
  private focusedTeam: string;

  constructor(
    private firebaseService: FirebaseService,
    private sharingService: SharingService,
    private messagesService: MessagesService,
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private zone: NgZone,
  ) {
    this.focusedTeam = null;
    this.editMode = false;
    this.searchText = '';
    this.filteredTeams = [];
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
    this.sharingService.currentUser.subscribe(user => {
      this.zone.run(() => {
        this.isLoggedIn = user;
      });
    });
    this.sharingService.currentTeams.subscribe(teams => {
      this.zone.run(() => {
        if (!teams) return;
        this.teams = _.orderBy(teams, t => t.division.name);
        this.filteredTeams = _.clone(this.teams);
        this.selectedMonth = '3';
      });
    });
  }

  searchTeam() {
    if (this.searchText == '' || !this.searchText) {
      this.filteredTeams = _.clone(this.teams);
      return;
    }

    let byName = _.filter(this.teams, t => { return t.name.toLowerCase().includes(this.searchText.toLowerCase()) });
    let byDivision = _.filter(this.teams, t => { return t.division.name.toLowerCase().includes(this.searchText.toLowerCase()) });
    let byAmount = _.filter(this.teams, t => { return t.totalAmount <= this.searchText });

    if (!_.isEmpty(byName)) this.filteredTeams = _.clone(byName);
    else if (!_.isEmpty(byDivision)) this.filteredTeams = _.clone(byDivision);
    else if (!_.isEmpty(byAmount)) this.filteredTeams = _.clone(byAmount);
    else this.filteredTeams = [];
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

  async openModal(team: any) {
    const modal = await this.modalCtrl.create({
      component: ModalTeamPage,
      componentProps: { ctx: team }
    });
    await modal.present();
  }

  async showFilter() {
    let opts = _.map(this.divisions, d => {
      return {
        name: d.name,
        type: 'radio',
        label: d.name.toUpperCase(),
        value: d.key
      }
    });
    opts.unshift({ type: 'radio', label: 'Borrar filtro', value: 'none' });
    const alert = await this.alertCtrl.create({
      header: 'Filtrar por División',
      inputs: opts,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Ok',
          handler: (data) => {
            if (data == 'none') this.clearFilter();
            else this.applyFilter(data);
          }
        }
      ],
      backdropDismiss: false,
      keyboardClose: false
    });

    await alert.present();
  }
  
  applyFilter(division) {
    let byDivision = _.filter(this.teams, t => { return t.division.key == division });
    if (!_.isEmpty(byDivision)) this.filteredTeams = _.clone(byDivision);
    else this.filteredTeams = [];
  }

  clearFilter() {
    this.filteredTeams = _.clone(this.teams);
  }
}
