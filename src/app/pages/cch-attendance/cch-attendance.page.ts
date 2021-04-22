import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ConstantService } from 'src/app/services/constant.service';
import { ICCHData } from 'src/app/interfaces/cchData';
import { SharedService } from 'src/app/services/shared.service';
import { ICCHRecord } from 'src/app/interfaces/cchRecord';
import { DatePipe, Location } from '@angular/common';

@Component({
  selector: 'app-cch-attendance',
  templateUrl: './cch-attendance.page.html',
  styleUrls: ['./cch-attendance.page.scss'],
})
export class CchAttendancePage implements OnInit {

  cchList: ICCHData[];
  cchDataList: ICCHData[];
  absentRecords: number[];
  syncedDisabled: boolean;
  currentDate: any;
  cchRecords: ICCHRecord[];
  maxDate: string
  constructor(private storage: Storage, private sharedSvc: SharedService, private datepipe: DatePipe,
    private location: Location) { }

  ngOnInit() {
    this.cchList = [];
    this.cchDataList = [];
    this.absentRecords = [];
    this.syncedDisabled = false;
    this.absentRecords = [];
    this.cchRecords = []
    this.maxDate = this.datepipe.transform(new Date(), ConstantService.message.maxDate)
    this.fetchAllCchData()
  }

  fetchAllCchData(){
    this.storage.get(ConstantService.dbKeyNames.cchData).then(data=>{
      if(data)
      this.cchDataList = data;
    }).catch(error=>{
      console.log(error)
    })
  }

  changeDate(currentDate){
    if (currentDate != "") {
      this.currentDate = currentDate;
      this.cchList = [];
      this.absentRecords = [];
      this.syncedDisabled = false;
      let tempCchList = JSON.parse(JSON.stringify(this.cchDataList));
      let cchList: ICCHData[] = [...tempCchList]
      this.storage.get(ConstantService.dbKeyNames.cchAttendanceData).then(attendanceData => {
        if (attendanceData != null) {
          console.log(attendanceData);
          this.cchRecords = attendanceData;
          let fetchedCchData: ICCHRecord[] = this.cchRecords.filter(data => (data.record_date.substr(0, 10) == currentDate.substr(0, 10)))
          if (fetchedCchData.length == 0) {
            this.cchList = tempCchList;
          } else {
            this.absentRecords = fetchedCchData[0].cch_ids;
            for (let i = 0; i < cchList.length; i++) {
              for (let j = 0; j < fetchedCchData[0].cch_ids.length; j++) {
                if (cchList[i].aadharNo == fetchedCchData[0].cch_ids[j]) {
                  cchList[i].attendance = false;
                }
              }
            }
            this.syncedDisabled = fetchedCchData[0].sync_status;
            this.cchList = cchList;
          }
        } else {
          this.cchList = tempCchList;
        }
      }).catch(err => {
        console.log(err)
      })
    }
  }

  switchAttendance(cch_code: number, attendance: boolean) {
    if (!attendance) {
      this.absentRecords.push(cch_code);
    } else {
      const index = this.absentRecords.indexOf(cch_code);
      if (index > -1) {
        this.absentRecords.splice(index, 1);
      }
    }
  }

  saveRecord() {
    let cchAttendanceData: ICCHRecord = {
      record_date: this.currentDate,
      cch_ids: this.absentRecords,
      sync_status: false,
      schoolId: String(this.sharedSvc.schoolId)
    }
    this.cchRecords.push(cchAttendanceData)
    this.storage.get(ConstantService.dbKeyNames.cchAttendanceData).then((fetchedData: ICCHRecord[])=>{
      if(fetchedData == null){
        this.storage.set(ConstantService.dbKeyNames.cchAttendanceData, this.cchRecords).then(data => {
          this.sharedSvc.showMessage(ConstantService.message.recordSaved)
          this.location.back();
        })
      }else{
        let updateDataStatus: boolean = false;
        for (let i = 0; i < fetchedData.length; i++) {
          if(fetchedData[i].record_date.substr(0,10) == this.currentDate.substr(0,10)){
              fetchedData[i] = cchAttendanceData;
              updateDataStatus = true;
          }
        }
        if(updateDataStatus){
          this.storage.set(ConstantService.dbKeyNames.cchAttendanceData, fetchedData).then(data => {
            this.sharedSvc.showMessage(ConstantService.message.recordUpdate)
            this.location.back();
          })
        }else{
          this.storage.set(ConstantService.dbKeyNames.cchAttendanceData, this.cchRecords).then(data => {
            this.sharedSvc.showMessage(ConstantService.message.recordSaved)
            this.location.back();
          })
        }
      }
    })
  }
}
