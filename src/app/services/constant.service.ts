import { Injectable } from '@angular/core';
import { IDBKeyNames } from 'src/app/interfaces/dbKeyNames';
import { IMessages } from 'src/app/interfaces/message';

@Injectable({
  providedIn: 'root'
})
export class ConstantService {

  static baseUrl : string = 'http://209.97.136.18:8080/MDM_Odisha/api/';
  constructor() { }

  static message: IMessages = { 
    checkInternetConnection: "Please check your internet connection.",
    serverError:"Error connecting to server ! Please try after some time.",
    networkError: 'Server error.',
    pleaseWait: 'Please wait..', 
    validUserName: 'Please enter username.',
    validPassword:'Please enter Password.',
  }

  static dbKeyNames: IDBKeyNames = {
    token: 'token',
    userDetails: 'userDetails',
    studentData: "studentData",
    studentAttendanceData: "studentAttendanceData",
    userId: 'userId'
  }
}
