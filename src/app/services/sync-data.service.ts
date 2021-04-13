import { Injectable } from '@angular/core';
import { ConstantService } from './constant.service';
import { HttpHeaders, HttpClient} from '@angular/common/http';
import { Storage } from '@ionic/storage'
import { IStudentRecord } from '../interfaces/studentRecord';

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

  syncToServer(studentsData: IStudentRecord[]){
    let falseSyncCount: boolean = false
    let promise = new Promise < any > ((resolve, reject) => {
      let URL: string = ConstantService.baseUrl +'studentAttendance'

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-type': 'application/json',
        })
      };
      
      studentsData.forEach((studentData: IStudentRecord) => {
        if(!studentData.sync_status){

          let data = {
            "recordDate":studentData.record_date.substr(0,10),
            "className":studentData.class_name,
            "sectionName":studentData.section_name,
            "studentIds":studentData.student_ids,
            "syncStatus":false,
            "image":studentData.image_base64,
            "availMeal":true
          }
          
          this.http.post(URL, data,httpOptions)
            .subscribe(res => {
              console.log(res)
              const index = studentsData.indexOf(studentData);
              studentsData[index].sync_status = true;
              this.storage.set(ConstantService.dbKeyNames.studentAttendanceData,studentsData);
            }, (err) => {
              falseSyncCount = true;
              console.log(err)
            });
          }
      });
      resolve(true);
    });
    return promise;
  }
}
