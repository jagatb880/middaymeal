import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { SharedService } from 'src/app/services/shared.service';
import { ConstantService } from 'src/app/services/constant.service';

declare var window;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  getUserRole: any;
  constructor(private router: Router,private storage: Storage, public sharedSvc: SharedService) { }

  ngOnInit() {
    this.sharedSvc.blinkStauts = false
  }

  ionViewWillEnter(){
    this.sharedSvc.blinkStauts = false
    this.sharedSvc.checkForDataSync();
  }

  sync_to_server(){
    window.home.syncToServer();
  }

  sync_from_server(){
    window.home.syncFromServer();
  }
}
