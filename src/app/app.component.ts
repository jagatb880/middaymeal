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
    { title: ConstantService.message.syncFromServer},
    { title: ConstantService.message.syncToServer},
    { title: ConstantService.message.sudentAttendance},
    { title: ConstantService.message.cchAttendance},
    { title: ConstantService.message.logout},
  ];

  constructor(
    public networkService: NetworkService, private router: Router,
    private location: Location, private alertCtrl: AlertController,
    private platform: Platform, public sharedSvc: SharedService,
    private syncData: SyncDataService, private storage: Storage, private networkSvc: NetworkService) {
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
          header: ConstantService.message.info,
          message: ConstantService.message.closeAppWarning,
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
      } else if (this.router.isActive('/login', true)) {
        navigator['app'].exitApp();
      } else {
        this.location.back();
      }
    });
  }

  open(section){
    switch(section) {
      case ConstantService.message.syncFromServer:
        this.syncFromServer();
        break;
      case ConstantService.message.syncToServer:
        this.syncToServer();
        break;
      case ConstantService.message.sudentAttendance:
        break;
      case ConstantService.message.cchAttendance:
        break;
      case ConstantService.message.logout:
        this.logout()
        break
    }
  }

  syncFromServer() {
    if(this.networkSvc.online){
      this.sharedSvc.showLoader(ConstantService.message.syncDataMsg)
      this.storage.get(ConstantService.dbKeyNames.userDetails).then(userData=>{
        this.syncData.syncFromServer(userData.username).then(response=>{
          if(response)
          this.storage.set(ConstantService.dbKeyNames.studentData,response).then(data=>{
            if(data)
            this.cchDataSyncFromServer(userData.schoolId)
          }).catch(error=>{
            console.log(error);
            this.sharedSvc.dismissLoader()
            this.sharedSvc.showMessage(ConstantService.message.wentWrong)
          })
        }).catch(error=>{
          console.log(error);
          this.sharedSvc.dismissLoader()
          this.sharedSvc.showMessage(ConstantService.message.wentWrong)
        })
      }).catch(error=>{
        console.log(error);
        this.sharedSvc.dismissLoader()
        this.sharedSvc.showMessage(ConstantService.message.wentWrong)
      })
    }else{
      this.sharedSvc.showMessage(ConstantService.message.checkInternetConnection)
    }
  }

  syncToServer(){
    if(this.networkSvc.online){
      this.storage.get(ConstantService.dbKeyNames.studentAttendanceData).then(data=>{
        if(data == null){
          this.sharedSvc.showAlert(ConstantService.message.info,ConstantService.message.noDataToSync)
        }else{
          this.sharedSvc.showLoader(ConstantService.message.syncDataToServer)
          this.storage.get(ConstantService.dbKeyNames.token).then(token=>{
            this.syncData.syncToServer(data,token).then(syncedData=>{
              if(syncedData){
                this.storage.set(ConstantService.dbKeyNames.studentAttendanceData,syncedData).then(async (data)=>{
                  this.sharedSvc.dismissLoader()
                    setTimeout(() => {
                      if(this.syncData.syncSuccessCount == 0 && this.syncData.syncFailedCount == 0){
                        this.sharedSvc.showAlert(ConstantService.message.info,ConstantService.message.noActiveRecord)
                      }else{
                        this.sharedSvc.showAlert(ConstantService.message.info,this.syncData.syncSuccessCount + 
                          ConstantService.message.syncedRecord + this.syncData.syncFailedCount + ConstantService.message.failedRecord)
                      }
                    }, 600);
                })
              }
            }).catch(error=>{
              if(error == false){
                console.log(error)
                this.sharedSvc.dismissLoader()
                this.sharedSvc.showMessage(ConstantService.message.wentWrong)
              }else{
                console.log(error)
                this.sharedSvc.dismissLoader()
                this.sharedSvc.showMessage(ConstantService.message.somethingWentWrong)
              }
              
            });
          }).catch(error=>{
            console.log(error)
            this.sharedSvc.dismissLoader()
            this.sharedSvc.showMessage(ConstantService.message.wentWrong)
          });
        }
      })
    }else{
      this.sharedSvc.showMessage(ConstantService.message.checkInternetConnection)
    }
  }

  cchDataSyncFromServer(schoolId){
    this.storage.get(ConstantService.dbKeyNames.token).then(token=>{
      this.syncData.syncCchDataFromServer(schoolId,token).then(data=>{
        if(data)
        this.storage.set(ConstantService.dbKeyNames.cchData,data[0].cch_details).then(()=>{
          this.sharedSvc.dismissLoader();
          this.sharedSvc.showMessage(ConstantService.message.dataSyncMsg)
        }).catch(error=>{
          console.log(error)
          this.sharedSvc.dismissLoader()
          this.sharedSvc.showMessage(ConstantService.message.wentWrong)
        })
      }).catch(error=>{
        console.log(error)
        this.sharedSvc.dismissLoader()
        this.sharedSvc.showMessage(ConstantService.message.wentWrong)
      })
    })
  }

  async logout() {
    let confirm = await this.alertCtrl.create({
      header: ConstantService.message.info,
      message: ConstantService.message.logoutWarning,
      cssClass:'my-custom-class',
      buttons: [{
          text: 'No',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Yes',
          handler: () => {
            this.storage.get(ConstantService.dbKeyNames.userDetails).then(userData=>{
              userData['loginStatus'] = false;
              this.storage.set(ConstantService.dbKeyNames.userDetails,userData)
              this.router.navigate(['login'])
            }).catch(error=>{
              console.log(error)
              this.sharedSvc.showMessage(ConstantService.message.wentWrong)
            })
          }
        }
      ]
    });
    confirm.present();
  }
}
