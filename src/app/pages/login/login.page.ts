import { Component, OnInit } from '@angular/core';
import { NetworkService } from 'src/app/services/network.service';
import { NavController } from '@ionic/angular';
import { ILoginData } from 'src/app/interfaces/login-data';
import { SharedService } from 'src/app/services/shared.service';
import { ConstantService } from 'src/app/services/constant.service';
import { LoginService } from 'src/app/services/login.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  user: ILoginData;
  loginData: ILoginData;
  constructor(private networkSvc: NetworkService, private navigator: NavController,
    private sharedSvc: SharedService, private loginSvc: LoginService, private storage: Storage) { }

  ngOnInit() {
    this.loginData = {
      username: '',
      password: ''
    }
  }


  /**
   * This method is called when user clicks on login button, this method checks for valid username and password.
   * If user has given valid credentials then it checks for user is exsit or not. If user exsit then redirect to
   * login page or else call saveUser().
   *
   */
  async login() {
    if(this.networkSvc.online){
      if (this.loginData.username == "") {
        this.sharedSvc.showMessage(ConstantService.message.validUserName)
      } else if (this.loginData.password == "") {
        this.sharedSvc.showMessage(ConstantService.message.validPassword)
      } else {
      this.sharedSvc.showLoader(ConstantService.message.authentication)
        this.loginSvc.authenticate(this.loginData).then(response=>{
          if(response['data'] != null){
            this.sharedSvc.dismissLoader();
            this.sharedSvc.accessToken = response['data'];
            this.storage.set(ConstantService.dbKeyNames.loginCredential,this.loginData).then(async (data)=>{
              let appVersionStatus = await this.checkAppversion(response['version'])
              if(appVersionStatus){
                await this.fetch_user_details(response['data'])
              }else{
                await this.sharedSvc.showAlertCallBack(ConstantService.message.newUpdate,
                  ConstantService.message.updateInfoMsg,ConstantService.message.update).then(data=>{
                  if(data){
                    window.open(ConstantService.message.appPlayStoreUrl,"_system")
                  }else{
                    this.sharedSvc.showMessage(ConstantService.message.updateMsg)
                  }
                })
              }
            }).catch(error=>{
              this.sharedSvc.dismissLoader();
              console.log(error)
              this.sharedSvc.showMessage(ConstantService.message.wentWrong)
            });
          }else{
            this.sharedSvc.dismissLoader();
            this.sharedSvc.showMessage(response['message'])
          }
        }).catch(error=>{
          this.sharedSvc.dismissLoader()
          console.log(error)
          this.sharedSvc.showMessage(ConstantService.message.wentWrong)
        })
      }
    }else{
      if (this.loginData.username == "") {
        this.sharedSvc.showMessage(ConstantService.message.validUserName)
      } else if (this.loginData.password == "") {
        this.sharedSvc.showMessage(ConstantService.message.validPassword)
      } else {
        this.storage.get(ConstantService.dbKeyNames.loginCredential).then((credential: ILoginData)=>{
          if(credential != null){
            if(credential.username == this.loginData.username && credential.password == this.loginData.password){
              this.storage.get(ConstantService.dbKeyNames.userDetails).then(userData=>{
                this.sharedSvc.dismissLoader()
                if(userData != null && this.loginData.username == userData.userName){
                  this.sharedSvc.userFullName = userData.firstName;
                  this.sharedSvc.userEmail = userData.email;
                  userData['loginStatus']=true;
                  this.storage.set(ConstantService.dbKeyNames.userDetails,userData).then(data=>{
                    this.navigator.navigateRoot(['dashboard'])
                  }).catch(error=>{
                    console.log(error)
                    this.sharedSvc.showMessage(ConstantService.message.wentWrong)
                  })
                }else{
                  this.sharedSvc.showMessage(ConstantService.message.checkInternetConnection)
                }
              }).catch(error=>{
                this.sharedSvc.dismissLoader()
                console.log(error)
                this.sharedSvc.showMessage(ConstantService.message.checkInternetConnection)
              })
            }else{
              this.sharedSvc.dismissLoader()
              this.sharedSvc.showMessage(ConstantService.message.wrongCredential)
            }
          }else{
            this.sharedSvc.showMessage(ConstantService.message.noCredentialFound)
          }
        })
      }
    }
  }

  fetch_user_details(token){
    this.sharedSvc.showLoader(ConstantService.message.fetchUserDetails)
    this.loginSvc.get_user_details(token).then(userDetails=>{
      if(typeof userDetails == 'object'){
        this.storage.get(ConstantService.dbKeyNames.userDetails).then(userData=>{
          if(userData == null){
            this.saveUserDetails(userDetails['data'])
          }else{
            if(userData.userId == userDetails['data'].userId){
              this.saveUserDetails(userDetails['data'])
            }else{
              this.sharedSvc.dismissLoader()
              this.sharedSvc.showAlertCallBack(ConstantService.message.wentWrong,ConstantService.message.differentUserLoginMsg,
                ConstantService.message.ok,ConstantService.message.cancel).then(data=>{
                if(data){
                  this.storage.remove(ConstantService.dbKeyNames.studentAttendanceData).then(()=>{
                    this.saveUserDetails(userDetails['data'])
                  })
                }
              })
            }
          } 
        })
      }else{
        this.sharedSvc.dismissLoader()
        this.sharedSvc.showMessage(ConstantService.message.wentWrong)
      }
    })
  }

  saveUserDetails(userData){
    userData['loginStatus'] = true;
    this.storage.set(ConstantService.dbKeyNames.userDetails,userData).then(data=>{
      this.sharedSvc.userFullName = data.firstName;
      this.sharedSvc.userEmail = data.email;
      this.sharedSvc.dismissLoader()
      this.navigator.navigateRoot(['dashboard'])
    }, (err) => {
      this.sharedSvc.dismissLoader()
      console.log(err)
      this.sharedSvc.showMessage(ConstantService.message.wentWrong)
    });
  }

  checkAppversion(dbVersion){
    let promise = new Promise < any > ((resolve, reject) => {
      this.storage.get(ConstantService.dbKeyNames.appVersion).then(appVersion=>{
        if(appVersion == null){
          this.storage.set(ConstantService.dbKeyNames.appVersion,dbVersion).then(data=>{
            resolve(true);
          })
        }else{
          if(dbVersion > appVersion){
            resolve(false);
          }else if(dbVersion < appVersion){
            this.storage.set(ConstantService.dbKeyNames.appVersion,dbVersion).then(data=>{
              resolve(true);
            })
          } else {
            resolve(true)
          }
        }
      })
    })
  return promise
  }
}