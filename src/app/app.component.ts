import { Component } from '@angular/core';
import { NetworkService } from './services/network.service';
import { Location } from '@angular/common';
import { SharedService } from './services/shared.service';
import { Platform, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Sync from server', url: '/dashboard'},
    { title: 'Sync to server', url: '/dashboard'},
    { title: 'Student attendance', url: '/dashboard'},
    { title: 'Teacher attendance', url: '/dashboard'},
   
  ];

  constructor(
    public networkService: NetworkService, private router: Router,
    private location: Location, private alertCtrl: AlertController,
    private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.networkService.listenNetwork();
      this.backButtonEvent();
    });
  }

  /**
   * This method is used to show a alert to close the app if user is on the home page, if 
   * not then this method will allow to just go back to the previous page from current page.
   * It's just act like a back button, when user will press the hardware back button on the device.
   * 
   * @memberof AppComponent
   */
  backButtonEvent() {
    this.platform.backButton.subscribe(async () => {
      if (this.router.isActive('/dashboard', true)) {
        const alert = await this.alertCtrl.create({
          header: 'Info',
          message: 'Are you sure, you want to close this app?',
          cssClass:'my-custom-class',
          buttons: [
            {
              text: 'NO',
              role: 'cancel'
            }, {
              text: 'YES',
              handler: () => {
                navigator['app'].exitApp();
              }
            }
          ]
        });
        await alert.present();
      } else {
        this.location.back();
      }
    });
  }
}
