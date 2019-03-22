import { Injectable } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private loading: any;

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
  ) {
    this.loading = null;
  }

  showConfirm(opts: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.alertCtrl.create({
        header: opts.title,
        subHeader: opts.subtitle,
        message: opts.msg,
        buttons: [
          {
            text: opts.cancelText || 'Cancelar',
            role: 'cancel',
            handler: () => { resolve(false) }
          },
          {
            text: 'Ok',
            handler: () => { resolve(true) }
          }
        ],
        backdropDismiss: false,
        keyboardClose: false
      }).then(alert => alert.present());
    });
  }

  async showToast(opts) {
    const toast = await this.toastCtrl.create({
      message: opts.msg,
      duration: opts.duration || 2000
    });
    toast.present();
  }

  async showLoading(opts) {
    this.loading = await this.loadingCtrl.create({ message: opts.msg });
    this.loading.present();
  }

  dismissLoading() {
    try {
      this.loading.dismiss();
      this.loading = null;
    } catch (error) {
      console.log('Error trying to dismiss loading', error);
    }
  }
}
