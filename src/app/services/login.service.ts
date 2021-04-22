import { Injectable } from '@angular/core';
import { ConstantService } from './constant.service';
import { HttpHeaders, HttpClient} from '@angular/common/http';
import { Storage } from '@ionic/storage'
import { ILoginData } from '../interfaces/login-data';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  acessToken: string;
  loginSuccess : boolean;
  constructor(private http: HttpClient, private storage: Storage) { }

  /**
   * This method will authenticate the username and password by calling the rest api for authentication
   * @author Jagat Bandhu (jagat@sdrc.co.in)
   * @param Authorization(username and password are set in header)
   * @since 0.0.1
   */
  authenticate(credentials: ILoginData): Promise < any > {
    let promise = new Promise < any > ((resolve, reject) => {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json',
      })
    };

    let URL: string = ConstantService.baseUrl +'login'

    let body = {
      "userName":credentials.username,
      "password":credentials.password
    }
    this.http.post(URL, body  , httpOptions)
    .subscribe(res => {
            this.storage.set(ConstantService.dbKeyNames.token,res['data']).then(data=>{
              this.loginSuccess = true;
              resolve(res);
            }).catch(error=>{
              console.log(error)
              reject(error);
            })
          }, (error) => {
            console.log(error)
            reject(error);
          });
    });
    return promise
  }

  get_user_details(acessToken){
    let promise = new Promise < any > ((resolve, reject) => {

    let URL: string = ConstantService.baseUrl +'userdetails'
    let accessKey = [
      {
        "key":"token",
        "value":acessToken
      }
    ]
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-type': 'application/json',
          'Authorization': 'Bearer'+ JSON.stringify(accessKey)
        })
      };
      this.http.get(URL,  httpOptions)
      .subscribe(res => {

        resolve(res)
      }, (err) => {
        console.log(err)
        reject(err);
      });
    });
    return promise
  }

  get_user(){
    let promise = new Promise < any > ((resolve, reject) => {
      this.storage.get(ConstantService.dbKeyNames.userDetails).then(userDetails=>{
        resolve(userDetails)
      }, (err) => {
        console.log(err)
        reject(err)
      });
    });
    return promise;
  }
}
