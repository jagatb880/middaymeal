import { Component, OnInit } from '@angular/core';
import { NetworkService } from 'src/app/services/network.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private networkSvc: NetworkService, private navigator: NavController) { }

  ngOnInit() {
    if(this.networkSvc.online){
      console.log("Network is there")
    }
  }

  goToDashboard(){
    this.navigator.navigateRoot(['dashboard'])
  }
}
