import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx'
import { Platform } from '@ionic/angular';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class NetworkService extends Network {
  public online: boolean;

  constructor(
    private platform: Platform, private sharedSvc: SharedService
  ) {
    super();
  }

  listenNetwork() {
    this.onDisconnect().subscribe(() => {
      this.sharedSvc.showMessage("Network disconnected!");
      this.online = false;
    });

    this.onConnect().subscribe(() => {
      this.online = true;
    });
    this.online = this.checkInternet();
  }

  checkInternet(): boolean {
    if (this.platform.is("cordova")) {
      if (
        this.type == "ethernet" ||
        this.type == "wifi" ||
        this.type == "2g" ||
        this.type == "3g" ||
        this.type == "4g" ||
        this.type == "cellular"
      ) {
        return true;
      }
      else {
        return false;
      }
    } else if (window.navigator.onLine) {
      return true;
    } else {
      return false;
    }
  }
}