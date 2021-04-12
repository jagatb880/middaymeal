import { Injectable } from '@angular/core';
import { ConstantService } from './constant.service';
import { HttpHeaders, HttpClient} from '@angular/common/http';
import { Storage } from '@ionic/storage'

@Injectable({
  providedIn: 'root'
})
export class SyncDataService {

  constructor(private http: HttpClient, private storage: Storage) { }

  syncFromServer(teacherCode){
    let promise = new Promise < any > ((resolve, reject) => {

      let URL: string = ConstantService.baseUrl +'studentClassSection'
  
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-type': 'application/json',
            'teacherCode': 'RM0200098112',
          })
        };
        this.http.post(URL, {},httpOptions)
        .subscribe(res => {
          resolve(res)
        }, (err) => {
          console.log(err)
          reject(err);
        });
      });
      return promise
  }
}
