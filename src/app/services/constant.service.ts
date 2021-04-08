import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConstantService {

  static baseUrl : string = 'https://';
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
    studentData: "studentData",
    studentAttendanceData: "studentAttendanceData",
    userId: 'userId'
  }
}
