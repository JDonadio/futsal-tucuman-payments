import { Component, OnInit, NgZone } from '@angular/core';
import { SharingService } from '../services/sharing/sharing.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireDatabase } from 'angularfire2/database';
import { Plugins } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
const { Toast } = Plugins;
const months = [
  { name: 'enero', value: 1 },
  { name: 'febrero', value: 2 },
  { name: 'marzo', value: 3 },
  { name: 'abril', value: 4 },
  { name: 'mayo', value: 5 },
  { name: 'junio', value: 6 },
  { name: 'julio', value: 7 },
  { name: 'agosto', value: 8 },
  { name: 'septiembre', value: 9 },
  { name: 'octubre', value: 10 },
  { name: 'noviembre', value: 11 },
  { name: 'diciembre', value: 12 },
];

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public categories: any;
  public months: any;
  public teams: any;
  public editMode: boolean;
  public teamForm: FormGroup;
  public selectedCategory: number;
  public selectedPeriod: number;
  private focusedTeam: string;

  constructor(
    private sharingService: SharingService,
    private zone: NgZone,
    private db: AngularFireDatabase,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController
  ) {
    this.focusedTeam = null;
    this.editMode = false;
    this.selectedCategory = 0;
    this.selectedPeriod = 0;
    this.months = months;
    this.teamForm = this.formBuilder.group({
      name: ['', Validators.required],
      period: [0, Validators.required],
      amount: [0, Validators.required],
      category: [null, Validators.required],
    });
    this.sharingService.currentCategories.subscribe(categories => {
      this.categories = categories;
      this.zone.run(() => {
        this.teamForm.patchValue({ category: categories && categories[0] ? categories[0].key : 0 });
      });
    });
    this.sharingService.currentTeams.subscribe(teams => {
      this.zone.run(() => {
        this.teams = teams;
      });
    });
  }

  ngOnInit() {
  }

  categoryChange(event) {
    this.selectedCategory = event.target.value;
  }

  periodChange(event) {
    this.selectedPeriod = event.target.value;
  }

  changeEditMode(team?: any) {
    this.editMode = !this.editMode;

    if (team && team.key) {
      this.focusedTeam = team.key;
      this.teamForm.patchValue({ name: team.name });
      this.teamForm.patchValue({ amount: team.amount || 0 });
      this.teamForm.patchValue({ period: team.period || 0 });
      this.teamForm.patchValue({ category: team.category.key });
    } else this.focusedTeam = null;
  }

  edit() {
    if (this.teamForm.invalid || this.selectedCategory == null || this.selectedPeriod == null) return;

    let category = this.teamForm.get('category').value;
    let team = {
      name: this.teamForm.get('name').value,
      amount: parseInt(this.teamForm.get('amount').value),
      period: this.teamForm.get('period').value || 0,
      category: {
        name: this.categories[category].name,
        key: category
      }
    }

    try {
      this.db.object(`teams/${this.focusedTeam}`).update(team);
      this.show(`El equipo ${team.name} ha sido editado correctamente!`);
      this.changeEditMode();
    } catch (err) {
      console.log(err);
      this.show('Ha ocurrido un error. No se pudo editar el equipo.');
    }
  }

  remove(team) {
    try {
      this.db.object(`teams/${team.key}`).remove();
      this.show(`El equipo ${team.name} ha sido eliminado correctamente!`);
    } catch (err) {
      console.log(err);
      this.show('Ha ocurrido un error. No se pudo eliminar el equipo.');
    }
  }

  async askForRemove(team) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar equipo',
      message: `¿Estás seguro de eliminar a ${team.name.toUpperCase()}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Si, eliminar',
          handler: () => {
            this.remove(team);
          }
        }
      ]
    });
    await alert.present();
  }

  async show(msg) {
    await Toast.show({
      text: msg
    });
  }

}
