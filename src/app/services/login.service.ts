import { Injectable } from '@angular/core';
import { ConstantService } from './constant.service';
import { HttpHeaders, HttpClient} from '@angular/common/http';
import { Storage } from '@ionic/storage'

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  headers: any;
  loginResponse: any;
  loginSuccess : boolean;
  constructor(private http: HttpClient, private storage: Storage) { }

  /**
   * This method will authenticate the username and password by calling the rest api for authentication
   * @author Jagat Bandhu (jagat@sdrc.co.in)
   * @param Authorization(username and password are set in header)
   * @since 0.0.1
   */
  authenticate(credentials): Promise < any > {
    let promise = new Promise < any > ((resolve, reject) => {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
      })
    };

    let URL: string = ConstantService.baseUrl +'login'

    let params = new URLSearchParams();
    params.append('username', credentials.username);
    params.append('password', credentials.password);
    this.http.post(URL, params.toString(), httpOptions)
    .subscribe(res => {
            this.loginResponse = {
              accessToken: res['access_token'],
              tokenType : res['token_type'],
              refreshToken: res['refresh_token'],
              expires: res['expires_in']
            }
            this.loginSuccess = true;
            resolve(res);
          }, (err) => {
            console.log(err)
            reject(err);
          });
    });
    return promise
  }

  get_user_details(){
    let promise = new Promise < any > ((resolve, reject) => {

    let URL: string = ConstantService.baseUrl +'userdetails'

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-type': 'application/json',
          'Authorization': 'Bearer [{"key":"token","value":"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJSTTAyMDAwOTgxMTIiLCJleHAiOjE2MTgyMDM2ODcsImlhdCI6MTYxODIwMDA4NywiYXV0aG9yaXRpZXMiOlsiUk9MRV9URUFDSEVSIl19.qqm9dGWgYVADhWBgHDqeRro6y7ThGwIFuui2MpC3Wak","description":""}]'
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
