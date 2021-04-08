import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  // To store the status that the page is root page or not
  public rootPage: boolean;

  // To store the page name
  public serviceStatus: string;

  constructor(private alertCtrl: AlertController, private location: Location,
    private toastCtrl: ToastController) { }




  /**
   * This method is used to show alert when their is no record found.
   *
   * @memberof SharedService
   */
  async showAlertForNoRecord() {
    const alert = await this.alertCtrl.create({
      header: 'INFO',
      message: 'NO_RECORD_FOUND',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.location.back();
          }
        }
      ]
    });

    await alert.present();
  }

  async showMessage(msg: string, duration: number = 2000): Promise<void> {
    const message = await this.toastCtrl.create({
      message: msg,
      duration: duration
    });
    await message.present();
  }

  async showAlert(header: string, msg: string, buttons: Array<any> = ['OK']): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: header,
      message: msg,
      buttons: buttons
    });
    return await alert.present();
  }
}