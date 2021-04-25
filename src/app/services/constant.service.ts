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
    checkInternetConnection: 'Please check your internet connection.',
    noInternetConnection: 'No internet connection',
    serverError:"Error connecting to server ! Please try after some time.",
    networkError: 'Server error.',
    pleaseWait: 'Please wait..', 
    validUserName: 'Please enter username.',
    validPassword:'Please enter Password.',
    authentication: 'Authenticating user, please wait...',
    wentWrong: 'Somthing went wrong, try after some times.',
    somethingWentWrong: 'Somthing went Wrong!',
    fetchUserDetails: 'Fetching user details, please wait...',
    warning: 'Warning',
    info: 'Info',
    ok: 'Ok',
    cancel: 'Cancel',
    differentUserLoginMsg:'This is a different user, that might delete the previously saved offline data of another user. Are you sure you want to proceed?',
    noStudentRecord: 'No student record found, please sync from server first.',
    noCCHRecord: 'No cch record found, please sync from server first.',
    maxDate: 'yyyy-MM-dd',
    dateTimeFormat: 'dd-MM-YYYY HH:mm:ss',
    geoTagForPhoto: 'For Geo-Tagged Photo, GPS in mobile must be turned on.',
    enableGeoLocation: 'Enable location permission manually',
    uploadPhoto: 'Please upload a photo.',
    recordSaved: 'Record successfully saved offline.',
    recordUpdate: 'Record successfully updated offline.',
    wrongCredential: 'Wrong username or password entered',
    noCredentialFound:'No credntial found, kindly login while online.',
    update: 'Update',
    newUpdate: 'New Update',
    updateMsg: 'You must update the app!',
    updateInfoMsg: 'This app need to be updated!',
    appPlayStoreUrl: 'https://play.google.com/store/apps/details?id=com.adventz.navratnaprayas',
    logoutWarning: 'Are you sure you want to logout?',
    dataSyncMsg: 'Data sync successfully done.',
    wentWrongContactAdmin: 'Something went wrong, please contact to admin',
    closeAppWarning: 'Are you sure you want to close this app?',
    syncFromServer: 'Sync from server',
    syncToServer: 'Sync to server',
    sudentAttendance: 'Student attendance',
    cchAttendance: 'Cch attendance',
    logout: 'Logout',
    syncDataMsg: 'Syncing the data, please wait...',
    noDataToSync: 'There is no data to sync.',
    syncDataToServer: 'Syncing data to server.',
    noActiveRecord: 'No Active record found for synced.',
    syncedRecord: 'Student record synced: ',
    failedRecord: 'Student record not synced: ',
    syncedRecordForCch: 'Cch record synced: ',
    failedRecordForCch: 'Cch record not synced: '
  }

  static dbKeyNames: IDBKeyNames = {
    token: 'token',
    loginCredential: 'loginCredential',
    userDetails: 'userDetails',
    studentData: "studentData",
    studentAttendanceData: "studentAttendanceData",
    userId: 'userId',
    appVersion: 'appVersion',
    cchData: 'cchData',
    cchAttendanceData: 'cchAttendanceData'
  }
}
