import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { SharingService } from '../services/sharing.service';
import { MessagesService } from '../services/messages.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
  @ViewChild('playerName') pn: any;
  @ViewChild('teamName') tn: any;
  @ViewChild('divisionName') dn: any;

  public divisionForm: FormGroup;
  public teamForm: FormGroup;
  public playerForm: FormGroup;
  public divisions: any;
  public teams: any;
  public selectedDivision: string;
  public selectedTeam: string;

  constructor(
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService,
    private sharingService: SharingService,
    private messagesService: MessagesService,
    private zone: NgZone,
  ) {
    this.divisionForm = this.formBuilder.group({
      name: ['', Validators.required],
    });
    this.teamForm = this.formBuilder.group({
      name: ['', Validators.required],
      division: ['', Validators.required],
    });
    this.playerForm = this.formBuilder.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      team: ['', Validators.required],
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
        this.selectedTeam = teams && teams[0] && teams[0].key;
      });
    });
  }

  addDivision() {
    console.log(this.divisionForm.value);
    let opts = {
      name: this.divisionForm.get('name').value,
    }
    this.messagesService.showLoading({ msg: 'Agregando división...' });
    this.firebaseService.createObject('divisions', opts)
      .then(() => {
        this.onSuccess({ msg: `División ${opts.name} agregada correctamente!` });
        this.divisionForm.patchValue({ name: '' });
        setTimeout(() => { this.dn.setFocus() }, 1000);
      })
      .catch(err => {
        this.onError({ msg: 'Ha ocurrido un error. ', err });
      });
  }

  addTeam() {
    console.log(this.teamForm.value);
    let divisionKey = this.teamForm.get('division').value;
    let division = _.find(this.divisions, d => d.key == divisionKey);
    if (!division) return;
    
    let opts = {
      name: this.teamForm.get('name').value,
      division,
      amount: 0
    }
    this.messagesService.showLoading({ msg: 'Agreando equipo...' });
    this.firebaseService.createObject('teams', opts)
      .then(() => {
        this.onSuccess({ msg: `Equipo ${opts.name} agregado correctamente!` });
        this.teamForm.patchValue({ name: '' });
        setTimeout(() => { this.tn.setFocus() }, 1000);
      })
      .catch(err => {
        this.onError({ msg: 'Ha ocurrido un error. ', err });
      });
  }

  addPlayer() {
    console.log(this.playerForm.value);
    let opts = {
      name: this.playerForm.get('name').value,
      surname: this.playerForm.get('surname').value,
      team: this.playerForm.get('team').value,
    }
    this.messagesService.showLoading({ msg: 'Agregando jugador...' });
    this.firebaseService.createObject(`teams/${opts.team}/players`, opts)
      .then(() => {
        this.onSuccess({ msg: `Jugador ${opts.name} agregado correctamente!` });
        this.playerForm.patchValue({ name: '', surname: '' });
        setTimeout(() => { this.pn.setFocus() }, 1000);
      })
      .catch(err => {
        this.onError({ msg: 'Ha ocurrido un error. ', err });
      });
  }
    
  private onSuccess(opts: any) {
    setTimeout(() => {
      this.messagesService.dismissLoading();
      this.messagesService.showToast({ msg: opts.msg });
    }, 900);
  }

  private onError(opts: any) {
    this.messagesService.dismissLoading();
    this.messagesService.showToast({ msg: opts.msg + opts.err });
  }
}
