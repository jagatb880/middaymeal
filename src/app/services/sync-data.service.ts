import { Injectable } from '@angular/core';
import { ConstantService } from './constant.service';
import { HttpHeaders, HttpClient} from '@angular/common/http';
import { Storage } from '@ionic/storage'
import { IStudentRecord } from '../interfaces/studentRecord';

@Injectable({
  providedIn: 'root'
})
export class SyncDataService {

  syncFailedCount: number;
  syncSuccessCount: number;
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

  syncToServer(studentsData: IStudentRecord[]){
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
          break
        }
        finalizedCount--
        try {
          await this.sentDataToServer(studentsData,indexServerData);
        } catch (err) {
          console.log(err)
          resolve(studentsData);
        }
        indexServerData++
      }
      // await studentsData.forEach(async (studentData: IStudentRecord) => {
      //   if(!studentData.sync_status){
      //     console.log(studentsData.indexOf(studentData))
      //     let data = await this.sentDataToServer(studentData)
      //     if(data){
      //       console.log(studentsData.indexOf(studentData))
      //       const index = await studentsData.indexOf(studentData);
      //       studentsData[index].sync_status = true;
      //     }
      //   }
      // });
      // resolve(studentsData)
    });
    return promise;
  }

  sentDataToServer(studentsData: IStudentRecord[],indexServerData){
    let promise = new Promise < any > ((resolve, reject) => {
    let URL: string = ConstantService.baseUrl +'studentAttendance'

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json',
      })
    };
    let data = {
      "recordDate":studentsData[indexServerData].record_date.substr(0,10),
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
        reject(err)
      });
    });
    return promise;
  }
}
