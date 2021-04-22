import { Injectable } from '@angular/core';
import { ConstantService } from './constant.service';
import { HttpHeaders, HttpClient} from '@angular/common/http';
import { IStudentRecord } from '../interfaces/studentRecord';
import { DatePipe } from '@angular/common';
import { ICCHRecord } from '../interfaces/cchRecord';

@Injectable({
  providedIn: 'root'
})
export class SyncDataService {

  syncFailedCount: number = 0;
  syncSuccessCount: number = 0;
  syncFailedCountForCch: number = 0;
  syncSuccessCountForCch: number = 0;
  constructor(private http: HttpClient, private datepipe: DatePipe) { }

  syncFromServer(teacherCode){
    let promise = new Promise < any > ((resolve, reject) => {

      let URL: string = ConstantService.baseUrl +'studentClassSection'
  
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-type': 'application/json',
            'teacherCode': teacherCode,
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

  syncCchDataFromServer(schoolId,acessToken){
    let promise = new Promise < any > ((resolve, reject) => {

      let URL: string = ConstantService.baseUrl +'cchDetails'
      let accessKey = [
        {
          "key":"token",
          "value":acessToken
        }
      ]
  
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-type': 'application/json',
            'schoolId': String(schoolId),
            'Authorization': 'Bearer'+ JSON.stringify(accessKey)
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

  syncToServer(studentsData: IStudentRecord[], acessToken: string){
    let finalizedCount = 0;
    let indexServerData = 0;
    let syncedData = [];
    this.syncFailedCount = 0;
    this.syncSuccessCount = 0;
    let promise = new Promise < any > (async (resolve, reject) => {
      await studentsData.forEach(async (studentData: IStudentRecord) => {
          if(!studentData.sync_status){
            finalizedCount++;
          }
      });

      if (finalizedCount == 0) {
        resolve(syncedData);
      }
      while (finalizedCount >= 0) {

        if (finalizedCount == 0) {
          resolve(studentsData);
          break;
        }
        finalizedCount--
        try {
          await this.sentDataToServer(studentsData,indexServerData,acessToken);
        } catch (err) {
          console.log(err)
          reject(false);
          break;
        }
        indexServerData++
      }
    });
    return promise;
  }

  sentDataToServer(studentsData: IStudentRecord[],indexServerData,acessToken){
    let promise = new Promise < any > ((resolve, reject) => {
    let URL: string = ConstantService.baseUrl +'studentAttendance'

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
    let data = {
      "recordDate":this.datepipe.transform(studentsData[indexServerData].record_date,"dd-MM-YYYY HH:mm:ss"),
      "className":studentsData[indexServerData].class_name,
      "sectionName":studentsData[indexServerData].section_name,
      "studentIds":studentsData[indexServerData].student_ids,
      "syncStatus":false,
      "image":studentsData[indexServerData].image_base64,
      "availMeal":true
    }

      this.http.post(URL, data,httpOptions)
      .subscribe(async (res: any)=> {
        console.log(res)
          if(res.outcome){
            this.syncSuccessCount++
            studentsData[indexServerData].sync_status = true;
          }else {
            this.syncFailedCount++
          }
        resolve(true)
      }, (err) => {
        console.log(err)
        reject(false)
      });
    });
    return promise;
  }

  syncToServerCchData(cchsData: ICCHRecord[], acessToken: string){
    let finalizedCount = 0;
    let indexServerData = 0;
    let syncedData = [];
    this.syncFailedCountForCch = 0;
    this.syncSuccessCountForCch = 0;
    let promise = new Promise < any > (async (resolve, reject) => {
      await cchsData.forEach(async (cchData: ICCHRecord) => {
          if(!cchData.sync_status){
            finalizedCount++;
          }
      });

      if (finalizedCount == 0) {
        resolve(syncedData);
      }
      while (finalizedCount >= 0) {

        if (finalizedCount == 0) {
          resolve(cchsData);
          break;
        }
        finalizedCount--
        try {
          await this.sentToServerCchData(cchsData,indexServerData,acessToken);
        } catch (err) {
          console.log(err)
          reject(false);
          break;
        }
        indexServerData++
      }
    });
    return promise;
  }

  sentToServerCchData(cchsRecord: ICCHRecord[],indexServerData,acessToken){
    let promise = new Promise < any > ((resolve, reject) => {
      let URL: string = ConstantService.baseUrl +'cchAttendance'
  
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
      let data = {
        "currdate":this.datepipe.transform(cchsRecord[indexServerData].record_date,"dd-MM-YYYY"),
        "schoolId":cchsRecord[indexServerData].schoolId,
        "cchId":cchsRecord[indexServerData].cch_ids
      }
  
        this.http.post(URL, data,httpOptions)
        .subscribe(async (res: any)=> {
          console.log(res)
          if(res.outcome){
            this.syncSuccessCountForCch++
            cchsRecord[indexServerData].sync_status = true;
          }else {
            this.syncFailedCountForCch++
          }
          resolve(true)
        }, (err) => {
          console.log(err)
          reject(false)
        });
      });
      return promise;
  }
}
