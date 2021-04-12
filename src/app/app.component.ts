import { Component } from '@angular/core';
import { NetworkService } from './services/network.service';
import { Location } from '@angular/common';
import { SharedService } from './services/shared.service';
import { Platform, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SyncDataService } from './services/sync-data.service';
import { Storage } from '@ionic/storage';
import { ConstantService } from './services/constant.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Sync from server'},
    { title: 'Sync to server'},
    { title: 'Student attendance'},
    { title: 'Teacher attendance'},
  ];

  constructor(
    public networkService: NetworkService, private router: Router,
    private location: Location, private alertCtrl: AlertController,
    private platform: Platform, public sharedSvc: SharedService,
    private syncData: SyncDataService, private storage: Storage) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.networkService.listenNetwork();
      this.backButtonEvent();
      this.set_data_to_sidemenu();
    });
  }

  set_data_to_sidemenu(){
    this.storage.get(ConstantService.dbKeyNames.userDetails).then(data=>{
      if(data!= null)
      this.sharedSvc.userFullName = data.firstName;
      this.sharedSvc.userEmail = data.email;
    }).catch(error=>{
      console.log(error)
    })
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

  open(section){
    switch(section) {
      case 'Sync from server':
        this.syncFromServer();
        break;
      case 'Sync to server':
        break;
      case 'Student attendance':
        break;
    }
  }

  syncFromServer() {
    this.sharedSvc.showLoader("Syncing the data, please wait...")
    this.storage.get(ConstantService.dbKeyNames.userDetails).then(userData=>{
      this.syncData.syncFromServer(userData.userName).then(response=>{
        if(response)
        this.storage.set(ConstantService.dbKeyNames.studentData,response).then(data=>{
          this.sharedSvc.dismissLoader();
          this.sharedSvc.showMessage("Data sync successfully done.")
        }).catch(error=>{
          console.log(error);
          this.sharedSvc.dismissLoader()
          this.sharedSvc.showMessage("Something went wrong, please try after sometime.")
        })
      }).catch(error=>{
        console.log(error);
        this.sharedSvc.dismissLoader()
        this.sharedSvc.showMessage("Something went wrong, please try after sometime.")
      })
    }).catch(error=>{
      console.log(error);
      this.sharedSvc.dismissLoader()
      this.sharedSvc.showMessage("Something went wrong, please try after sometime.")
    })
  }
}
