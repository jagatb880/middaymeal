import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { NetworkService } from 'src/app/services/network.service';
import { ConstantService } from 'src/app/services/constant.service';
import { LoginService } from 'src/app/services/login.service';
import { Location } from '@angular/common';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.page.html',
  styleUrls: ['./forgotpassword.page.scss'],
})
export class ForgotpasswordPage implements OnInit {
  showPassword = false;
  showPasswordre = false;
  passwordToggleIcon = 'eye';
  passwordToggleIcons = 'eye';
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;

  validationRegex = '"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$"'

  constructor(private sharedSvc: SharedService, private networkSvc: NetworkService,
    private loginSvc: LoginService, private location: Location, private storage: Storage) { }

  toggleNewPassword() {
    this.showPassword = !this.showPassword;
    if (this.passwordToggleIcon === 'eye') {
      this.passwordToggleIcon = 'eye-off';
    }else {
      this.passwordToggleIcon = 'eye';
    }
  }

  toggleConfirmPassword(){
      this.showPasswordre = !this.showPasswordre;
      if (this.passwordToggleIcons === 'eye') {
        this.passwordToggleIcons = 'eye-off';
      }else {
        this.passwordToggleIcons = 'eye';
      }
  
  }
  ngOnInit() {
    this.oldPassword = "";
    this.newPassword = "";
    this.confirmPassword = "";
  }

  submit(){
    if(this.networkSvc.online){
      if(this.oldPassword == ""){
        this.sharedSvc.showMessage("Enter the old password")
      }else if(this.newPassword == ""){
        this.sharedSvc.showMessage("Enter the new password")
      }else if(!this.validation(this.newPassword)){
        this.sharedSvc.showMessage("Not validating the password criteria")
      }else if(this.confirmPassword == ""){
        this.sharedSvc.showMessage("Enter the confirm new password")
      }else if(this.newPassword != this.confirmPassword){
        this.sharedSvc.showMessage("Confirm password doesn't match with new password")
      }else{
        this.sharedSvc.showLoader(ConstantService.message.pleaseWait)
        let cpObject = {
          "userName": this.sharedSvc.userName,
          "password": this.oldPassword,
          "newPassword": this.newPassword
        }
        this.loginSvc.change_password(cpObject).then(result=>{
          this.sharedSvc.dismissLoader()
          if(result.outcome){
            this.storage.get(ConstantService.dbKeyNames.loginCredential).then(credentialList=>{
              let findIndex = credentialList.findIndex(credential=>credential.username == this.sharedSvc.userName)
              credentialList[findIndex].password = this.newPassword
              this.storage.set(ConstantService.dbKeyNames.loginCredential,credentialList).then(()=>{
                this.sharedSvc.showMessage("Password successfully changed.")
                this.location.back();
              }).catch(error=>{
                console.log(error)
                this.sharedSvc.dismissLoader()
                this.sharedSvc.showMessage(ConstantService.message.somethingWentWrong)
              })
            }).catch(error=>{
              console.log(error)
              this.sharedSvc.dismissLoader()
              this.sharedSvc.showMessage(ConstantService.message.somethingWentWrong)
            })
          }else{
            this.sharedSvc.showMessage("Unable to change password.")
          }
        }).catch(error=>{
          this.sharedSvc.dismissLoader()
          this.sharedSvc.showMessage(ConstantService.message.somethingWentWrong)
        })
      }
    }else{
      this.sharedSvc.showMessage(ConstantService.message.checkInternetConnection)
    }
  }

  validation(password){
    let pattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$");
    let result = pattern.test(password)
    return result
  }

  checkValidation(){
    if(this.newPassword == ""){
      this.sharedSvc.showMessage("Enter the new password")
    }else if(!this.validation(this.newPassword)){
      this.sharedSvc.showMessage("Not validating the password criteria")
    }
  }
}
