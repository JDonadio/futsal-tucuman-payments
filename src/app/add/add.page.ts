import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AngularFireDatabase } from 'angularfire2/database';
import { SharingService } from '../services/sharing/sharing.service';
import { Plugins } from '@capacitor/core';
const { Toast } = Plugins;

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {

  teamForm: FormGroup;
  categories: any[];
  selectedCategory: number;

  constructor(
    private formBuilder: FormBuilder,
    private db: AngularFireDatabase,
    private sharingService: SharingService,
    private zone: NgZone,
  ) {
    this.teamForm = this.formBuilder.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
    });
    this.selectedCategory = 0;
    this.sharingService.currentCategories.subscribe(categories => {
      this.categories = categories;
      this.zone.run(() => {
        this.teamForm.patchValue({ category: categories && categories[0] ? categories[0].key : 0 });
      });
    });
  }
  
  ngOnInit() {
  }

  categoryChange(event) {
    this.selectedCategory = event.target.value;
  }

  addTeam() {
    if (this.teamForm.invalid || this.selectedCategory == null) return;

    let team = {
      name: this.teamForm.get('name').value,
      amount: 0,
      category: {
        name: this.categories[this.selectedCategory].name,
        key: this.selectedCategory
      }
    }

    try {
      this.db.list(`teams`).push(team);
      this.resetForm();
      this.show(`Equipo ${team.name} agregado correctamente!`);
    } catch (err) {
      console.log(err);
      this.show('Ha ocurrido un error. No se pudo agregar el equipo.');
    }
  }

  resetForm() {
    this.teamForm.patchValue({ name: '' });
    this.teamForm.patchValue({ category: this.categories && this.categories[0] ? this.categories[0].key : 0 });
  }

  async show(msg) {
    await Toast.show({
      text: msg
    });
  }
}
