import { Injectable } from '@angular/core';
import { ConstantService } from './constant.service';
import { HttpHeaders, HttpClient} from '@angular/common/http';
import { Storage } from '@ionic/storage'
import { ILoginData } from '../interfaces/login-data';
import { SharedService } from './shared.service';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  acessToken: string;
  loginSuccess: boolean;
  constructor(private http: HttpClient, private storage: Storage, private sharedSvc: SharedService,
    private platform: Platform) {}

  /**
   * This method will authenticate the username and password by calling the rest api for authentication
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

      let URL: string = ConstantService.baseUrl + 'login'

      let body = {
        "userName": credentials.username,
        "password": credentials.password
      }
      this.http.post(URL, body, httpOptions)
        .subscribe(res => {
          let tokenObject = {
            'username': credentials.username,
            'token': res['data']
          }
          let tokens = []
          this.storage.set(ConstantService.dbKeyNames.logginUserUsername, credentials.username)
          this.storage.get(ConstantService.dbKeyNames.token).then(accessTokens=>{
            if(accessTokens == null){
              tokens.push(tokenObject)
            }else{
              tokens = accessTokens
              let result: any = tokens.filter(token=> token.username == credentials.username)
              if(result == 0){
                tokens.push(tokenObject)
              }else{
                let result: any = tokens.findIndex(token=> token.username == credentials.username)
                tokens[result] = tokenObject
              }
            }
            this.storage.set(ConstantService.dbKeyNames.token, tokens).then(data => {
              this.loginSuccess = true;
              resolve(res);
            }).catch(error => {
              console.log(error)
              reject(error);
            })
          }).catch(error=>{
            reject(error);
          })
        }, (error) => {
          console.log(error)
          reject(error);
        });
    });
    return promise
  }

  get_user_details(acessToken) {
    let promise = new Promise < any > ((resolve, reject) => {

      let URL: string = ConstantService.baseUrl + 'userdetails'
      let accessKey = [{
        "key": "token",
        "value": acessToken
      }]
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-type': 'application/json',
          'Authorization': 'Bearer' + JSON.stringify(accessKey)
        })
      };
      this.http.get(URL, httpOptions)
        .subscribe(res => {

          resolve(res)
        }, (err) => {
          console.log(err)
          reject(err);
        });
    });
    return promise
  }

  change_password(cpObject){
    let promise = new Promise < any > ((resolve, reject) => {

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-type': 'application/json',
        })
      };

      let URL: string = ConstantService.baseUrl + 'changePassword'

      let body = {
        "userName": cpObject.userName,
        "password": cpObject.password,
        "newPassword": cpObject.newPassword
      }
      this.http.post(URL, body, httpOptions)
        .subscribe(res => {
          resolve(res)
        }, (error) => {
          console.log(error)
          reject(error);
        });
    });
    return promise
  }

  async get_user() {
    let promise = new Promise < any > ((resolve, reject) => {
      this.storage.get(ConstantService.dbKeyNames.userDetails).then(async userDetails => {
        if(userDetails != null){
          let result = await userDetails.find(userDetail=> userDetail.username == this.sharedSvc.userName)
          await setTimeout(() => {
            resolve(result)
          }, 1000);
        }else{
          await setTimeout(() => {
            resolve(userDetails)
          }, 1000);
        }
      }, (err) => {
        console.log(err)
        reject(err)
      });
    });
    return promise;
  }
}
