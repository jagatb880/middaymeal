import { Component } from '@angular/core';
import { NetworkService } from './services/network.service';
import { Location } from '@angular/common';
import { SharedService } from './services/shared.service';
import { Platform, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SyncDataService } from './services/sync-data.service';
import { Storage } from '@ionic/storage';
import { ConstantService } from './services/constant.service';
import { ICCHRecord } from './interfaces/cchRecord';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [];

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
      this.set_school_id();
      this.sharedSvc.observeDataUpdate().subscribe(data=>{
        this.appPages = [
          { title: ConstantService.message.syncFromServer, show: true},
          { title: ConstantService.message.syncToServer, show: true},
          { title: ConstantService.message.sudentAttendance, show: this.sharedSvc.teacherRole},
          { title: ConstantService.message.cchAttendance, show: !this.sharedSvc.teacherRole},
          { title: ConstantService.message.logout, show: true},
        ];
      })
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
        this.storage.get(ConstantService.dbKeyNames.studentData).then(data=>{
          if(data == null){
            this.sharedSvc.showAlert(ConstantService.message.warning,ConstantService.message.noStudentRecord)
          }else{
            this.router.navigate(['student-attendance'])
          }
        })
        break;
      case ConstantService.message.cchAttendance:
        this.storage.get(ConstantService.dbKeyNames.cchData).then(data=>{
          if(data == null){
            this.sharedSvc.showAlert(ConstantService.message.warning,ConstantService.message.noCCHRecord)
          }else{
            this.router.navigate(['cch-attendance'])
          }
        })
        break;
      case ConstantService.message.logout:
        this.logout()
        break
    }
  }

  syncFromServer() {
    if(this.networkSvc.online){
      if(this.sharedSvc.teacherRole)
      this.studentDataSyncFromServer()
      else
      this.cchDataSyncFromServer()
    }else{
      this.sharedSvc.showMessage(ConstantService.message.checkInternetConnection)
    }
  }

  syncToServer(){
    if(this.networkSvc.online){
      this.storage.get(ConstantService.dbKeyNames.studentAttendanceData).then(data=>{
        if(data == null){
          this.storage.get(ConstantService.dbKeyNames.cchAttendanceData).then(cchData=>{
            if(cchData == null){
              this.sharedSvc.showAlert(ConstantService.message.info,ConstantService.message.noDataToSync)
            }else{
              this.sharedSvc.showLoader(ConstantService.message.syncDataToServer)
              this.syncCchDataToServer(this.sharedSvc.accessToken)
            }
          });
        }else{
          this.sharedSvc.showLoader(ConstantService.message.syncDataToServer)
          this.syncData.syncToServer(data,this.sharedSvc.accessToken).then(syncedData=>{
            if(syncedData){
              this.storage.set(ConstantService.dbKeyNames.studentAttendanceData,syncedData).then(async (data)=>{
                this.syncCchDataToServer(this.sharedSvc.accessToken)
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
              this.sharedSvc.showMessage(ConstantService.message.wentWrongContactAdmin)
            }
            
          });
        }
      })
    }else{
      this.sharedSvc.showMessage(ConstantService.message.checkInternetConnection)
    }
  }

  studentDataSyncFromServer(){
    this.sharedSvc.showLoader(ConstantService.message.syncDataMsg)
    this.storage.get(ConstantService.dbKeyNames.userDetails).then(userDatas=>{
      let index = userDatas.findIndex(userData=> userData.username == this.sharedSvc.userName)
      this.syncData.syncFromServer(userDatas[index].username).then(response=>{
        if(response)
        this.storage.set(ConstantService.dbKeyNames.studentData,response).then(data=>{
          this.sharedSvc.dismissLoader();
          this.sharedSvc.showMessage(ConstantService.message.dataSyncMsg)
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
  }

  cchDataSyncFromServer(){
    this.sharedSvc.showLoader(ConstantService.message.syncDataMsg)
    this.syncData.syncCchDataFromServer(this.sharedSvc.schoolId,this.sharedSvc.accessToken).then(data=>{
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
  }

  syncCchDataToServer(token: string){
    let cchDataForSync = []
    this.storage.get(ConstantService.dbKeyNames.cchAttendanceData).then(cchDatas=>{
      if(cchDatas == null){
        this.sharedSvc.dismissLoader()
        this.showSyncedCountMsg();  
      }else{
        cchDatas.forEach((cchData: ICCHRecord) => {
          cchDataForSync.push(cchData)
        });
        this.syncData.syncToServerCchData(cchDataForSync,token).then(syncedData=>{
          if(syncedData){
            this.storage.set(ConstantService.dbKeyNames.cchAttendanceData,syncedData).then(async (data)=>{
            this.sharedSvc.dismissLoader()
              this.showSyncedCountMsg();
            })
          }
        }).catch(error=>{
          console.log(error)
          this.sharedSvc.dismissLoader()
          this.sharedSvc.showMessage(ConstantService.message.wentWrong)
        })
      }
    }).catch(error=>{
      console.log(error)
      this.sharedSvc.dismissLoader()
      this.sharedSvc.showMessage(ConstantService.message.wentWrong)
    });
  }

  showSyncedCountMsg(){
    setTimeout(() => {
      if(this.syncData.syncSuccessCount == 0 && this.syncData.syncFailedCount == 0 &&
        this.syncData.syncSuccessCountForCch == 0 && this.syncData.syncFailedCountForCch == 0){
        this.sharedSvc.showAlert(ConstantService.message.info,ConstantService.message.noActiveRecord)
      }else{
        this.sharedSvc.showAlert(ConstantService.message.info,ConstantService.message.syncedRecord+this.syncData.syncSuccessCount+'<br>'+
        ConstantService.message.failedRecord+this.syncData.syncFailedCount+'<br>'+
        ConstantService.message.syncedRecordForCch+this.syncData.syncSuccessCountForCch+'<br>'+
        ConstantService.message.failedRecordForCch+this.syncData.syncFailedCountForCch)
      }
    }, 600); 
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
            this.storage.get(ConstantService.dbKeyNames.userDetails).then(userDatas=>{
              let result: any = userDatas.findIndex(token => token.username == this.sharedSvc.userName)
              userDatas[result]['loginStatus'] = false;
              this.storage.set(ConstantService.dbKeyNames.userDetails,userDatas)
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

  set_school_id(){
    this.storage.get(ConstantService.dbKeyNames.logginUserUsername).then(userName=>{
      if(userName != null)
      this.sharedSvc.userName = userName;
      this.storage.get(ConstantService.dbKeyNames.userDetails).then(userDatas=>{
        if(userDatas != null){
          let index: any = userDatas.findIndex(userData=> userData.username == this.sharedSvc.userName)
          this.sharedSvc.userName = userDatas[index].username;
          this.sharedSvc.schoolId = userDatas[index].schoolId;
          this.sharedSvc.userFullName = userDatas[index].firstName;
          this.sharedSvc.userEmail = userDatas[index].email;
          if(userDatas[index].roleCode == 'ROLE_TEACHER')
          this.sharedSvc.teacherRole = true
          else
          this.sharedSvc.teacherRole = false
          this.sharedSvc.publishDataUpdate(true)
        }
      })
      this.storage.get(ConstantService.dbKeyNames.token).then(tokens=>{
        if(tokens != null){
          let result = tokens.find(token=> token.username == this.sharedSvc.userName)
          this.sharedSvc.accessToken = result.token
        }
      })
    })
  }
}
