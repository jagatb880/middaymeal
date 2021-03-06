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
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

declare var window;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [];

  studentSavedData: any;
  studentMealSavedData: any;
  constructor(
    private router: Router, private location: Location, 
    private alertCtrl: AlertController, private platform: Platform, public sharedSvc: SharedService,
    private statusBar: StatusBar, private splashScreen: SplashScreen,
    private syncData: SyncDataService, private storage: Storage, private networkSvc: NetworkService) {
    window.home = this;
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();

      // let status bar overlay webview
      this.statusBar.overlaysWebView(false);

      this.statusBar.styleBlackOpaque();
      this.splashScreen.hide();
      this.networkSvc.listenNetwork();
      this.backButtonEvent();
      this.set_data_to_sidemenu();
      this.set_school_id();
      this.sharedSvc.observeDataUpdate().subscribe(data=>{
        this.appPages = [
          { title: ConstantService.message.syncFromServer, show: true},
          { title: ConstantService.message.syncToServer, show: true},
          { title: ConstantService.message.sudentAttendance, show: true},
          { title: ConstantService.message.sudentMealAttendance, show: true},
          { title: ConstantService.message.cchAttendance, show: !this.sharedSvc.teacherRole},
          { title: ConstantService.message.mealManagement, show: !this.sharedSvc.teacherRole},
          { title: ConstantService.message.changePassword, show: true},
          { title: ConstantService.message.logout, show: true},
        ];
      })
    });
  }

  set_data_to_sidemenu(){
    this.storage.get(ConstantService.dbKeyNames.userDetails).then(data=>{
      if(data!= null){
        this.sharedSvc.userFullName = data.firstName;
        this.sharedSvc.userName = data.username;
      }
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
        if(this.sharedSvc.teacherRole){
          this.storage.get(ConstantService.dbKeyNames.studentData).then(data=>{
            if(data == null){
              this.sharedSvc.showAlert(ConstantService.message.warning,ConstantService.message.noStudentRecord)
            }else{
              this.router.navigate(['student-attendance'])
            }
          })
        }else{
          this.storage.get(ConstantService.dbKeyNames.hmstudentData).then(data=>{
            if(data == null){
              this.sharedSvc.showAlert(ConstantService.message.warning,ConstantService.message.noStudentRecord)
            }else{
              this.router.navigate(['student-attendance'])
            }
          })
        }
        break;
      case ConstantService.message.sudentMealAttendance:
        if(this.sharedSvc.teacherRole){
          this.storage.get(ConstantService.dbKeyNames.studentData).then(data=>{
            if(data == null){
              this.sharedSvc.showAlert(ConstantService.message.warning,ConstantService.message.noStudentRecord)
            }else{
              this.router.navigate(['student-meal-attendance'])
            }
          })
        }else{
          this.storage.get(ConstantService.dbKeyNames.hmstudentData).then(data=>{
            if(data == null){
              this.sharedSvc.showAlert(ConstantService.message.warning,ConstantService.message.noStudentRecord)
            }else{
              this.router.navigate(['student-meal-attendance'])
            }
          })
        }
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
      case ConstantService.message.mealManagement:
        this.storage.get(ConstantService.dbKeyNames.mealManagementData).then(data=>{
          if(data == null){
            this.sharedSvc.showAlert(ConstantService.message.warning,ConstantService.message.noMealManagementRecord)
          }else{
            this.router.navigate(['meal-management'])
          }
        })
        break;
      case ConstantService.message.changePassword:
        this.router.navigate(['change-password'])
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
      this.hmStudentDataSyncFromServer()
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

  hmStudentDataSyncFromServer(){
    this.sharedSvc.showLoader(ConstantService.message.syncDataMsg)
    this.storage.get(ConstantService.dbKeyNames.userDetails).then(userDatas=>{
      let index = userDatas.findIndex(userData=> userData.username == this.sharedSvc.userName)
      this.syncData.syncFromServer(userDatas[index].username).then(response=>{
        if(response)
        this.storage.set(ConstantService.dbKeyNames.hmstudentData,response).then(data=>{
          this.sharedSvc.dismissLoader();
          this.cchDataSyncFromServer();
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
        this.mealManagementSyncFromServer()
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

  mealManagementSyncFromServer(){
    this.syncData.mealManagementDataFromServer(this.sharedSvc.schoolId,this.sharedSvc.accessToken).then(data=>{
      if(data)
      this.storage.set(ConstantService.dbKeyNames.mealManagementData,data[0]).then(()=>{
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

  syncToServer(){
    if(this.networkSvc.online){
      if(this.sharedSvc.teacherRole){
        this.studentSavedData = ConstantService.dbKeyNames.studentAttendanceData
        this.studentMealSavedData = ConstantService.dbKeyNames.studentMealAttendanceData
      }else{
        this.studentSavedData = ConstantService.dbKeyNames.hmstudentAttendanceData
        this.studentMealSavedData = ConstantService.dbKeyNames.hmstudentMealAttendanceData
      }
      this.syncStudentDataToServer(this.sharedSvc.accessToken)
    }else{
      this.sharedSvc.showMessage(ConstantService.message.checkInternetConnection)
    }
  }

  syncStudentDataToServer(token: string){
    if(this.networkSvc.online){
      this.sharedSvc.showLoader(ConstantService.message.syncDataToServer)
      let studentDataForSync = []
      this.storage.get(this.studentSavedData).then(studentDatas=>{
        if(studentDatas == null){
          this.syncStudentMealDataToServer(token);  
        }else{
          studentDatas.forEach((cchData: ICCHRecord) => {
            studentDataForSync.push(cchData)
          });
          this.syncData.syncStudentToServer(studentDataForSync,token).then(syncedData=>{
            if(syncedData){
                this.storage.set(this.studentSavedData,syncedData).then(async (data)=>{
                this.syncStudentMealDataToServer(token);
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
    }else{
      this.sharedSvc.showMessage(ConstantService.message.checkInternetConnection)
    }
  }

  syncStudentMealDataToServer(token){
    let studentMealDataForSync = []
    this.storage.get(this.studentMealSavedData).then(studentMealData=>{
      if(studentMealData != null){
        studentMealData.forEach((mealData: any) => {
          studentMealDataForSync.push(mealData)
        });
        this.syncData.syncStudentMealToServer(studentMealDataForSync,token).then(syncedData=>{
          if(syncedData){
              this.storage.set(this.studentMealSavedData,syncedData).then(async (data)=>{
                if(this.sharedSvc.teacherRole){
                  this.sharedSvc.dismissLoader()
                  this.showStudentSyncedCountMsg()
                }else{
                  this.syncCchDataToServer()
                }
            })
          }
        }).catch(error=>{
          console.log(error)
          this.sharedSvc.dismissLoader()
          this.sharedSvc.showMessage(ConstantService.message.wentWrong)
        })
      }else{
        if(this.sharedSvc.teacherRole){
          this.sharedSvc.dismissLoader()
          this.showStudentSyncedCountMsg()
        }else{
          this.syncCchDataToServer()
        }
      }
    }).catch(error=>{
      console.log(error)
      this.sharedSvc.dismissLoader()
      this.sharedSvc.showMessage(ConstantService.message.wentWrong)
    });
  }

  syncCchDataToServer(){
    if(this.networkSvc.online){
      this.storage.get(ConstantService.dbKeyNames.cchAttendanceData).then(cchData=>{
        if(cchData == null){
          this.storage.get(ConstantService.dbKeyNames.mealManagementRecord).then(mealManagementData=>{
            if(mealManagementData == null){
              this.sharedSvc.dismissLoader()
              this.showSyncedCountMsg();
            }else{
              //this.sharedSvc.showLoader(ConstantService.message.syncDataToServer)
              this.syncMealManagementDataToServer(this.sharedSvc.accessToken)
            }
          });
        }else{
          //this.sharedSvc.showLoader(ConstantService.message.syncDataToServer)
          this.syncData.syncToServerCchData(cchData,this.sharedSvc.accessToken).then(syncedData=>{
            if(syncedData){
              this.storage.set(ConstantService.dbKeyNames.cchAttendanceData,syncedData).then(async (data)=>{
                this.storage.get(ConstantService.dbKeyNames.mealManagementRecord).then(mealManagementData=>{
                  if(mealManagementData == null){
                    this.sharedSvc.dismissLoader();
                    this.showSyncedCountMsg();
                  }else{
                    this.syncMealManagementDataToServer(this.sharedSvc.accessToken)
                  }
                });
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

  syncMealManagementDataToServer(token){
    let mealManagementDataForSync = []
    this.storage.get(ConstantService.dbKeyNames.mealManagementRecord).then(mealManagementData=>{
        mealManagementData.forEach((mealData: any) => {
          mealManagementDataForSync.push(mealData)
        });
        this.syncData.syncToServerMealManagementData(mealManagementDataForSync,token,this.sharedSvc.schoolId).then(syncedData=>{
          if(syncedData){
            this.storage.set(ConstantService.dbKeyNames.mealManagementRecord,syncedData).then(async (data)=>{
            this.sharedSvc.dismissLoader()
              this.showSyncedCountMsg();
            })
          }
        }).catch(error=>{
          console.log(error)
          this.sharedSvc.dismissLoader()
          this.sharedSvc.showMessage(ConstantService.message.wentWrong)
        })
    }).catch(error=>{
      console.log(error)
      this.sharedSvc.dismissLoader()
      this.sharedSvc.showMessage(ConstantService.message.wentWrong)
    });
  }

  showStudentSyncedCountMsg(){
    setTimeout(() => {
      if(this.syncData.syncSuccessCount == 0 && this.syncData.syncFailedCount == 0 &&
        this.syncData.syncSMSuccessCount == 0 && this.syncData.syncSMFailedCount == 0){
        this.sharedSvc.showAlert(ConstantService.message.info,ConstantService.message.noActiveRecord)
        this.sharedSvc.checkForDataSync();
      }else{
        this.sharedSvc.showAlert(ConstantService.message.info,
        ConstantService.message.syncedRecord+this.syncData.syncSuccessCount+'<br>'+
        ConstantService.message.failedRecord+this.syncData.syncFailedCount+'<br>'+
        ConstantService.message.syncedMealRecord+this.syncData.syncSMSuccessCount+'<br>'+
        ConstantService.message.failedMealRecord+this.syncData.syncSMFailedCount)
        this.sharedSvc.checkForDataSync();
      }
    }, 600); 
  }

  showSyncedCountMsg(){
    setTimeout(() => {
      if(this.syncData.syncSuccessCountForCch == 0 && this.syncData.syncFailedCountForCch == 0 &&
        this.syncData.syncSuccessCountForMMData == 0 && this.syncData.syncFailedCountForMMData == 0 &&
        this.syncData.syncSuccessCount == 0 && this.syncData.syncFailedCount == 0 &&
        this.syncData.syncSMSuccessCount == 0 && this.syncData.syncSMFailedCount == 0){
        this.sharedSvc.showAlert(ConstantService.message.info,ConstantService.message.noActiveRecord)
        this.sharedSvc.checkForDataSync();
      }else{
        this.sharedSvc.showAlert(ConstantService.message.info,
        ConstantService.message.syncedRecord+this.syncData.syncSuccessCount+'<br>'+
        ConstantService.message.failedRecord+this.syncData.syncFailedCount+'<br>'+
        ConstantService.message.syncedMealRecord+this.syncData.syncSMSuccessCount+'<br>'+
        ConstantService.message.failedMealRecord+this.syncData.syncSMFailedCount+'<br>'+
        ConstantService.message.syncedRecordForCch+this.syncData.syncSuccessCountForCch+'<br>'+
        ConstantService.message.failedRecordForCch+this.syncData.syncFailedCountForCch+'<br>'+
        ConstantService.message.syncedRecordForMM+this.syncData.syncSuccessCountForMMData+'<br>'+
        ConstantService.message.failedRecordForMM+this.syncData.syncFailedCountForMMData)
        this.sharedSvc.checkForDataSync();
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
