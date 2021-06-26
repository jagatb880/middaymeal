import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx'

@Injectable({
  providedIn: 'root'
})
export class NetworkService extends Network {
  public online: boolean;

  constructor() {
    super();
  }

  listenNetwork() {
		this.onDisconnect().subscribe(() => {
			console.log('network was disconnected');
			console.log(this.type);
			this.online = false;
		});

		this.onConnect().subscribe(() => {
			console.log('network connected');
			if(this.type == "unknown"){
				this.online = false;
			}else{
				this.online = true;
			}
		});

    this.online = this.check_internet();
	}

	check_internet(): boolean {
		if (this.type == "ethernet" || this.type == "wifi" || this.type == "2g"
    || this.type == "3g" || this.type == "4g" || this.type == "cellular") {
			console.log("device is online");
	 		return true;
		}
		else if (window.navigator.onLine) {
			return true;
		} else {
			return false;
		}
	}
}