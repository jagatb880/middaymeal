import { Component, OnInit } from '@angular/core';
import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private networkSvc: NetworkService) { }

  ngOnInit() {
    if(this.networkSvc.online){
      console.log("Network is there")
    }
  }

}
