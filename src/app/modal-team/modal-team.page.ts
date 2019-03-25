import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FirebaseService } from '../services/firebase.service';
import { MessagesService } from '../services/messages.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-modal-team',
  templateUrl: './modal-team.page.html',
  styleUrls: ['./modal-team.page.scss'],
})
export class ModalTeamPage implements OnInit {

  public title: string;
  public team: any;
  public months: any;
  public editFor: any;
  public editMode: boolean;
  public amount: number;

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private firebaseService: FirebaseService,
    private messagesService: MessagesService,
  ) {
    this.editFor = {};
    this.editMode = false;
    this.amount = 0;
  }
  
  ngOnInit() {
    this.team = _.cloneDeep(this.navParams.data.ctx);
    this.title = this.team.name.toUpperCase() + ' - División ' + this.team.division.name.toUpperCase();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  edit(index) {
    this.editMode = true;
    this.editFor[index] = true;
  }

  cancelEdition(index) {
    this.editMode = false;
    delete this.editFor[index];
  }

  async confirmEdition() {
    let resp = await this.messagesService.showConfirm({ title: 'Confirmar cambios.', msg: '¿Estás seguro de confirmar los cambios?'});
    if (!resp) return;
    
    try {
      this.firebaseService.updateObject(`teams/${this.team.key}`, this.team);
      this.messagesService.showToast({ msg: `El equipo ${this.team.name} ha sido editado correctamente!` });
      this.close();
    } catch (err) {
      console.log(err);
      this.messagesService.showToast({ msg: 'Ha ocurrido un error. No se pudo editar el equipo.' });
    }
  }
  
  async askForRemove() {
    let resp = await this.messagesService.showConfirm({ title: 'Eliminar equipo', msg: `¿Estás seguro de eliminar a ${this.team.name.toUpperCase()}?` });
    if (!resp) return;
    
    try {
      this.firebaseService.removeObject(`teams/${this.team.key}`);
      this.messagesService.showToast({ msg: `El equipo ${this.team.name} ha sido eliminado correctamente!` });
    } catch (err) {
      console.log(err);
      this.messagesService.showToast({ msg: 'Ha ocurrido un error. No se pudo eliminar el equipo.' });
    }
  }
}
