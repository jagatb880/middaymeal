import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private loginSvc: LoginService) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    try {
      const user= await this.loginSvc.get_user();
      if (user == null) {
        return this.router.parseUrl("/login");
      } else if(user != null && user.loginStatus == false){
        return this.router.parseUrl("/login");
      }
      return true;
    }
    catch(error) {
      throw error;
    }
  }
  
}
