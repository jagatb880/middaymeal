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
    if(this.networkSvc.online){
      console.log("Network is there")
    }
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
      this.sharedSvc.showLoader("Authenticating user, please wait...")
        this.loginSvc.authenticate(this.loginData).then(acessToken=>{
          this.sharedSvc.dismissLoader();
          this.fetch_user_details(acessToken)
        }).catch(error=>{
          this.sharedSvc.dismissLoader()
          console.log(error)
          this.sharedSvc.showMessage("Somthing went wrong, try after some times.")
        })
      }
    }else{
      this.sharedSvc.showMessage(ConstantService.message.checkInternetConnection)
    }
  }

  fetch_user_details(token){
    this.sharedSvc.showLoader("Fetching user details, please wait...")
    this.loginSvc.get_user_details(token).then(userDetails=>{
      if(typeof userDetails == 'object'){
        this.storage.set(ConstantService.dbKeyNames.userDetails,userDetails['data']).then(data=>{
          this.sharedSvc.userFullName = data.firstName;
          this.sharedSvc.userEmail = data.email;
          this.sharedSvc.dismissLoader()
          this.navigator.navigateRoot(['dashboard'])
        }, (err) => {
          this.sharedSvc.dismissLoader()
          console.log(err)
          this.sharedSvc.showMessage("Somthing went wrong, try after some times.")
        });
      }else{
        this.sharedSvc.dismissLoader()
        this.sharedSvc.showMessage("Somthing went wrong, try after some times.")
      }
    })
  }
}