import { Component, OnInit } from '@angular/core';

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
  constructor() { }
  togglepassword() {
    this.showPassword = !this.showPassword;
    if (this.passwordToggleIcon === 'eye') {
      this.passwordToggleIcon = 'eye-off';
    }else {
      this.passwordToggleIcon = 'eye';
    }
  }
  togglepassword1(){
    this.showPasswordre = !this.showPasswordre;
    if (this.passwordToggleIcons === 'eye') {
      this.passwordToggleIcons = 'eye-off';
    }else {
      this.passwordToggleIcons = 'eye';
    }
  }
  ngOnInit() {
  }

}
