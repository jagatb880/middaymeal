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
  syncSMFailedCount: number = 0;
  syncSMSuccessCount: number = 0;
  hmsyncFailedCount: number = 0;
  hmsyncSuccessCount: number = 0;
  hmsyncSMFailedCount: number = 0;
  hmsyncSMSuccessCount: number = 0;
  syncFailedCountForCch: number = 0;
  syncSuccessCountForCch: number = 0;
  syncFailedCountForMMData: number = 0;
  syncSuccessCountForMMData: number = 0;
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

  mealManagementDataFromServer(schoolId,acessToken){
    let promise = new Promise < any > ((resolve, reject) => {

      let URL: string = ConstantService.baseUrl +'mealManagement'
      let accessKey = [
        {
          "key":"token",
          "value":acessToken
        }
      ]
  
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-type': 'application/json',
            //'schoolId': String(schoolId),
            'Authorization': 'Bearer'+ JSON.stringify(accessKey)
          })
        };
        this.http.get(URL,httpOptions)
        .subscribe(res => {
          resolve(res)
        }, (err) => {
          console.log(err)
          reject(err);
        });
      });
      return promise
  }

  syncStudentToServer(studentsData: IStudentRecord[], acessToken: string){
    let finalizedCount = 0;
    let indexServerData = 0;
    let syncedData = [];
    this.syncFailedCount = 0;
    this.syncSuccessCount = 0;
    let studentDataIndex = []
    let promise = new Promise < any > (async (resolve, reject) => {
      await studentsData.forEach(async (studentData: IStudentRecord, index) => {
          if(!studentData.sync_status){
            studentDataIndex.push(index)
            finalizedCount++;
          }
      });

      if (finalizedCount == 0) {
        resolve(studentsData);
      }
      while (finalizedCount >= 0) {

        if (finalizedCount == 0) {
          resolve(studentsData);
          break;
        }
        finalizedCount--
        try {
          await this.sentStudentDataToServer(studentsData,studentDataIndex[indexServerData],acessToken);
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

  sentStudentDataToServer(studentsData: IStudentRecord[],indexServerData,acessToken){
    let promise = new Promise < any > ((resolve, reject) => {
    //let URL: string = ConstantService.baseUrl +'studentAttendance'
    let URL: string = ConstantService.baseUrl +'attendance'

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

  syncStudentMealToServer(studentsData: IStudentRecord[], acessToken: string){
    let finalizedCount = 0;
    let indexServerData = 0;
    let syncedData = [];
    this.syncSMSuccessCount = 0;
    this.syncSMFailedCount = 0;
    let studentDataIndex = []
    let promise = new Promise < any > (async (resolve, reject) => {
      await studentsData.forEach(async (studentData: IStudentRecord, index) => {
          if(!studentData.sync_status){
            studentDataIndex.push(index)
            finalizedCount++;
          }
      });

      if (finalizedCount == 0) {
        resolve(studentsData);
      }
      while (finalizedCount >= 0) {

        if (finalizedCount == 0) {
          resolve(studentsData);
          break;
        }
        finalizedCount--
        try {
          await this.sentStudentMealDataToServer(studentsData,studentDataIndex[indexServerData],acessToken);
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

  sentStudentMealDataToServer(studentsData: IStudentRecord[],indexServerData,acessToken){
    let promise = new Promise < any > ((resolve, reject) => {
    let URL: string = ConstantService.baseUrl +'studentAttendance'
    // let URL: string = ConstantService.baseUrl +'attendance'

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
            this.syncSMSuccessCount++
            studentsData[indexServerData].sync_status = true;
          }else {
            this.syncSMFailedCount++
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
    let cchDataIndex = []
    let promise = new Promise < any > (async (resolve, reject) => {
      await cchsData.forEach(async (cchData: ICCHRecord, index) => {
          if(!cchData.sync_status){
            cchDataIndex.push(index)
            finalizedCount++;
          }
      });

      if (finalizedCount == 0) {
        resolve(cchsData);
      }
      while (finalizedCount >= 0) {

        if (finalizedCount == 0) {
          resolve(cchsData);
          break;
        }
        finalizedCount--
        try {
          await this.sentToServerCchData(cchsData,cchDataIndex[indexServerData],acessToken);
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
        "currDate":this.datepipe.transform(cchsRecord[indexServerData].record_date,"dd-MM-YYYY"),
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

  syncToServerMealManagementData(mealManagementData: any[], acessToken: string, schoolId: any){
    let finalizedCount = 0;
    let indexServerData = 0;
    let syncedData = [];
    this.syncFailedCountForMMData = 0;
    this.syncSuccessCountForMMData = 0;
    let mealManagementDataIndex = []
    let promise = new Promise < any > (async (resolve, reject) => {
      await mealManagementData.forEach(async (mealManagementData: any, index) => {
          if(!mealManagementData.sync_status){
            mealManagementDataIndex.push(index)
            finalizedCount++;
          }
      });

      if (finalizedCount == 0) {
        resolve(syncedData);
      }
      while (finalizedCount >= 0) {

        if (finalizedCount == 0) {
          resolve(mealManagementData);
          break;
        }
        finalizedCount--
        try {
          await this.sentToServerMealManagementData(mealManagementData,mealManagementDataIndex[indexServerData],acessToken,schoolId);
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

  sentToServerMealManagementData(mealManagementRecord: any[],indexServerData,acessToken,schoolId){
    let promise = new Promise < any > ((resolve, reject) => {
      let URL: string = ConstantService.baseUrl +'mealManagementDetails'
  
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
      let key1 = null;
      let key2 = null;
      if(mealManagementRecord[indexServerData].status){
        let geoInfo1 = {
          "administrativeArea": mealManagementRecord[indexServerData].stage1GeoInfo.administrativeArea == undefined?null:mealManagementRecord[indexServerData].stage1GeoInfo.administrativeArea,
          "areasOfInterest": mealManagementRecord[indexServerData].stage1GeoInfo.areasOfInterest == undefined?null:mealManagementRecord[indexServerData].stage1GeoInfo.areasOfInterest[0],
          "countryCode": mealManagementRecord[indexServerData].stage1GeoInfo.countryCode == undefined?null:mealManagementRecord[indexServerData].stage1GeoInfo.countryCode,
          "countryName": mealManagementRecord[indexServerData].stage1GeoInfo.countryName == undefined?null:mealManagementRecord[indexServerData].stage1GeoInfo.countryName,
          "latitude": mealManagementRecord[indexServerData].stage1GeoInfo.latitude,
          "locality": mealManagementRecord[indexServerData].stage1GeoInfo.locality == undefined?null:mealManagementRecord[indexServerData].stage1GeoInfo.locality,
          "longitude": mealManagementRecord[indexServerData].stage1GeoInfo.longitude,
          "postalCode": mealManagementRecord[indexServerData].stage1GeoInfo.postalCode == undefined?null:mealManagementRecord[indexServerData].stage1GeoInfo.postalCode,
          "subAdministrativeArea": mealManagementRecord[indexServerData].stage1GeoInfo.subAdministrativeArea == undefined?null:mealManagementRecord[indexServerData].stage1GeoInfo.subAdministrativeArea
        }
        let geoInfo2
        if(mealManagementRecord[indexServerData].stage2GeoInfo == undefined){
          geoInfo2 = null;
        }else{
          geoInfo2 = {
            "administrativeArea": mealManagementRecord[indexServerData].stage2GeoInfo.administrativeArea == undefined?null:mealManagementRecord[indexServerData].stage2GeoInfo.administrativeArea,
            "areasOfInterest": mealManagementRecord[indexServerData].stage2GeoInfo.areasOfInterest == undefined?null:mealManagementRecord[indexServerData].stage2GeoInfo.areasOfInterest[0],
            "countryCode": mealManagementRecord[indexServerData].stage2GeoInfo.countryCode == undefined?null:mealManagementRecord[indexServerData].stage2GeoInfo.countryCode,
            "countryName": mealManagementRecord[indexServerData].stage2GeoInfo.countryName == undefined?null:mealManagementRecord[indexServerData].stage2GeoInfo.countryName,
            "latitude": mealManagementRecord[indexServerData].stage2GeoInfo.latitude,
            "locality": mealManagementRecord[indexServerData].stage2GeoInfo.locality == undefined?null:mealManagementRecord[indexServerData].stage2GeoInfo.locality,
            "longitude": mealManagementRecord[indexServerData].stage2GeoInfo.longitude,
            "postalCode": mealManagementRecord[indexServerData].stage2GeoInfo.postalCode == undefined?null:mealManagementRecord[indexServerData].stage2GeoInfo.postalCode,
            "subAdministrativeArea": mealManagementRecord[indexServerData].stage2GeoInfo.subAdministrativeArea == undefined?null:mealManagementRecord[indexServerData].stage2GeoInfo.subAdministrativeArea
          }
        }
        let geoInfo3
        if(mealManagementRecord[indexServerData].stage3GeoInfo == undefined){
          geoInfo3 = null;
        }else{
          geoInfo3 = {
            "administrativeArea": mealManagementRecord[indexServerData].stage3GeoInfo.administrativeArea == undefined?null:mealManagementRecord[indexServerData].stage3GeoInfo.administrativeArea,
            "areasOfInterest": mealManagementRecord[indexServerData].stage3GeoInfo.areasOfInterest == undefined?null:mealManagementRecord[indexServerData].stage3GeoInfo.areasOfInterest[0],
            "countryCode": mealManagementRecord[indexServerData].stage3GeoInfo.countryCode == undefined?null:mealManagementRecord[indexServerData].stage3GeoInfo.countryCode,
            "countryName": mealManagementRecord[indexServerData].stage3GeoInfo.countryName == undefined?null:mealManagementRecord[indexServerData].stage3GeoInfo.countryName,
            "latitude": mealManagementRecord[indexServerData].stage3GeoInfo.latitude,
            "locality": mealManagementRecord[indexServerData].stage3GeoInfo.locality == undefined?null:mealManagementRecord[indexServerData].stage3GeoInfo.locality,
            "longitude": mealManagementRecord[indexServerData].stage3GeoInfo.longitude,
            "postalCode": mealManagementRecord[indexServerData].stage3GeoInfo.postalCode == undefined?null:mealManagementRecord[indexServerData].stage3GeoInfo.postalCode,
            "subAdministrativeArea": mealManagementRecord[indexServerData].stage3GeoInfo.subAdministrativeArea == undefined?null:mealManagementRecord[indexServerData].stage3GeoInfo.subAdministrativeArea,
          }
        }
        
        key1 = {
          "stage1Image": mealManagementRecord[indexServerData].stage1Image == undefined?null:mealManagementRecord[indexServerData].stage2Image,
          "stage1Remark": mealManagementRecord[indexServerData].stage1Remark == undefined?null:mealManagementRecord[indexServerData].stage1Remark,
          "stage1DateTime": mealManagementRecord[indexServerData].stage1DateTime == undefined?null:mealManagementRecord[indexServerData].stage1DateTime,
          "stage1GeoInfo": geoInfo1,
          "stage2Image": mealManagementRecord[indexServerData].stage2Image == undefined?null:mealManagementRecord[indexServerData].stage2Image,
          "stage2Remark": mealManagementRecord[indexServerData].stage2Remark == undefined?null:mealManagementRecord[indexServerData].stage2Remark,
          "stage2DateTime": mealManagementRecord[indexServerData].stage2DateTime == undefined?null:mealManagementRecord[indexServerData].stage2DateTime,
          "stage2GeoInfo": geoInfo2,
          "stage3Image": mealManagementRecord[indexServerData].stage3Image == undefined?null:mealManagementRecord[indexServerData].stage3Image,
          "stage3Remark": mealManagementRecord[indexServerData].stage3Remark == undefined?null:mealManagementRecord[indexServerData].stage3Remark,
          "stage3DateTime": mealManagementRecord[indexServerData].stage3DateTime == undefined?null:mealManagementRecord[indexServerData].stage3DateTime,
          "stage3GeoInfo": geoInfo3,
        }
      }else{
        key2 = {
          "reasonId": mealManagementRecord[indexServerData].reasonId,
          "remarks": mealManagementRecord[indexServerData].remarks
        }
      }
      let data = {
        "schoolId": schoolId,
        "date":this.datepipe.transform(mealManagementRecord[indexServerData].date,"dd-MM-YYYY h:mm:ss"),
        "status": mealManagementRecord[indexServerData].status,
        "key1": key1,
        "key2": key2
      }
  
        this.http.post(URL, data,httpOptions)
        .subscribe(async (res: any)=> {
          console.log(res)
          if(res.outcome){
            this.syncSuccessCountForMMData++
            mealManagementRecord[indexServerData].sync_status = true;
          }else {
            this.syncFailedCountForMMData++
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
