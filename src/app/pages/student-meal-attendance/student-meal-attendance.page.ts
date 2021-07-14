import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { IClass } from '../../interfaces/class';
import { ISection } from 'src/app/interfaces/section';
import { IStudent } from 'src/app/interfaces/student';
import { IStudentRecord } from 'src/app/interfaces/studentRecord';
import { SharedService } from 'src/app/services/shared.service';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ConstantService } from 'src/app/services/constant.service';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-student-meal-attendance',
  templateUrl: './student-meal-attendance.page.html',
  styleUrls: ['./student-meal-attendance.page.scss'],
})
export class StudentMealAttendancePage implements OnInit {

  classList: IClass[];
  sectionList: ISection[];
  studentList: IStudent[];
  currentClassName: any;
  currentSectionName: any;
  currentDate: any;
  maxDate: any;
  studentDataList: IClass[];
  studentRecords: IStudentRecord[];
  studentMealRecords: IStudentRecord[];
  absentRecords: number[];
  photoCapturedDate: string;
  syncedDisabled: boolean;
  hideView: boolean;
  totalCount: number;
  absentCount: number;
  presentCount: number;
  studentFetchData: any;
  studentSavedData: any;
  studentMealSavedData: any;
  constructor(private datepipe: DatePipe, public sharedSvc: SharedService, private diagnostic: Diagnostic,
    private platform: Platform, private storage: Storage, private location: Location,
    private networkSvc: NetworkService, private changeDeector: ChangeDetectorRef) {
    }

  ngOnInit() {
    this.studentList = [];
    this.sectionList = [];
    this.currentClassName = "";
    this.currentSectionName = "";
    this.sharedSvc.imageData = undefined;
    this.studentRecords = [];
    this.studentMealRecords = []
    this.absentRecords = [];
    this.syncedDisabled = false;
    this.hideView = false;
    this.maxDate = this.datepipe.transform(new Date(), ConstantService.message.maxDate);
  }

  ionViewWillEnter(){
    if(this.sharedSvc.teacherRole){
      this.studentFetchData = ConstantService.dbKeyNames.studentData;
      this.studentSavedData = ConstantService.dbKeyNames.studentAttendanceData;
      this.studentMealSavedData = ConstantService.dbKeyNames.studentMealAttendanceData;
    }else{
      this.studentFetchData = ConstantService.dbKeyNames.hmstudentData;
      this.studentSavedData = ConstantService.dbKeyNames.hmstudentAttendanceData;
      this.studentMealSavedData = ConstantService.dbKeyNames.hmstudentMealAttendanceData;
    }
    this.fetchAllStudentData();
  }

  fetchAllStudentData(){
    this.storage.get(this.studentFetchData).then(data=>{
      if(data)
      this.studentDataList = data;
      if (this.studentDataList.length > 0) {
        this.classList = this.studentDataList
      }
    }).catch(error=>{
      console.log(error)
    })
  }

  selectClass() {
    this.currentSectionName = "";
    this.currentDate = "";
    this.sharedSvc.imageData = undefined;
    this.photoCapturedDate = undefined;
    let studentClass: IClass[] = this.studentDataList.filter(a => a.className == this.currentClassName);
    this.sectionList = studentClass[0].section
  }

  selectSection() {
    this.currentDate = "";
    this.sharedSvc.imageData = undefined;
    this.photoCapturedDate = undefined;
    this.studentList = [];
  }

  changeDate(currentDate) {
    if (currentDate != "") {
      let week = new Date(currentDate)
      let weekName = week.toString().substring(0,3)
      if(weekName != "Sun"){
        this.currentDate = currentDate;
        this.absentRecords = [];
        this.syncedDisabled = false;
        this.hideView = false;
        this.sharedSvc.imageData = undefined;
        this.sharedSvc.geocoderResult = undefined;
        this.photoCapturedDate = undefined;
        this.totalCount = 0;
        this.presentCount = 0;
        this.absentCount = 0;
        let studentSection: ISection[] = this.sectionList.filter(data => data.sectionName == this.currentSectionName);
        let tempStudentList = JSON.parse(JSON.stringify(studentSection[0].student));
        let studentList: IStudent[] = [...tempStudentList]
        this.storage.get(this.studentSavedData).then(attendanceData => {
          if (attendanceData != null) {
            console.log(attendanceData);
            this.studentRecords = attendanceData;
            let fetchedStudentData: IStudentRecord[] = this.studentRecords.filter(data => (data.record_date.substr(0, 10) == currentDate.substr(0, 10)) &&
              (data.class_name == this.currentClassName) && (data.section_name == this.currentSectionName))
            if (fetchedStudentData.length == 0) {
              this.studentList = tempStudentList;
              this.totalCount = 0;
              this.presentCount = 0;
              this.hideView = true;
              this.sharedSvc.showAlert(ConstantService.message.warning,'Please fillup the student attendance first for same class, section and date.')
            } else {
              let filterMealDatas = []
              for (let i = 0; i < studentList.length; i++) {
                studentList[i]['hide'] = true
                for (let j = 0; j < fetchedStudentData[0].student_ids.length; j++) {
                  if (studentList[i].studentId == fetchedStudentData[0].student_ids[j]) {
                    studentList[i].attendance = false;
                    studentList[i]['hide'] = false;
                    filterMealDatas.push(i)
                  }
                }
              }
              for (let i = 0; i < studentList.length; i++) {
                for (let j = 0; j < filterMealDatas.length; j++) {
                  if(studentList[i] == filterMealDatas[j]){
                    studentList.splice(i,1)
                  }
                }
              }
              this.totalCount = studentList.length-filterMealDatas.length;
              this.absentCount = 0;
              this.presentCount = this.totalCount - this.absentCount
              this.storage.get(this.studentMealSavedData).then(mealAttendanceData=>{
                if(mealAttendanceData == null){
                  this.studentList = studentList;
                }else{
                  this.studentMealRecords = mealAttendanceData;
                  let fetchedStudentMealData: IStudentRecord[] = this.studentMealRecords.filter(data => (data.record_date.substr(0, 10) == currentDate.substr(0, 10)) &&
                    (data.class_name == this.currentClassName) && (data.section_name == this.currentSectionName))
                    if (fetchedStudentMealData.length == 0) {
                      this.studentList = studentList;
                    }else{
                      this.absentRecords = fetchedStudentMealData[0].student_ids;
                      this.totalCount = studentList.length-filterMealDatas.length;
                      this.absentCount = this.absentRecords.length
                      this.presentCount = this.totalCount - this.absentCount
                      for (let i = 0; i < studentList.length; i++) {
                        for (let j = 0; j < fetchedStudentMealData[0].student_ids.length; j++) {
                          if (studentList[i].studentId == fetchedStudentMealData[0].student_ids[j]) {
                            studentList[i].attendance = false;
                          }
                        }
                      }
                      this.studentList = studentList;
                      this.syncedDisabled = fetchedStudentMealData[0].sync_status;
                      this.sharedSvc.imageData = fetchedStudentMealData[0].image_base64;
                      this.sharedSvc.geocoderResult = fetchedStudentMealData[0].geo_coder_info;
                      this.photoCapturedDate = this.datepipe.transform(this.currentDate,ConstantService.message.dateTimeFormat);
                    }
                }
              })
              
            }
          } else {
            this.studentList = tempStudentList;
            this.totalCount = 0;
            this.presentCount = 0
            this.hideView = true;
            this.sharedSvc.showAlert(ConstantService.message.warning,'Please fillup the student attendance first for same class, section and date.')
          }
          if(String(new Date()).substr(0,15) == String(new Date(currentDate)).substr(0,15)){
            this.syncedDisabled = false;
          }else{
            this.syncedDisabled = true;
          }
        }).catch(err => {
          console.log(err)
        })
      }else{
        this.syncedDisabled = true;
        this.sharedSvc.showAlert("Warning", "Sunday is off, choose other date");
      }
    }
  }

  switchAttendance(student_id: number, attendance: boolean) {
    if (!attendance) {
      this.absentRecords.push(student_id);
      this.presentCount--
      this.absentCount++
    } else {
      const index = this.absentRecords.indexOf(student_id);
      if (index > -1) {
        this.absentRecords.splice(index, 1);
        this.presentCount++
        this.absentCount--
      }
    }
  }

  /**
   * This method is used to show a action sheet with list of action to choose the user.
   */
  async uploadphoto() {
    this.takeLocationPermission();
  }

  takeLocationPermission(){
    //if(this.networkSvc.online){
      this.photoCapturedDate = undefined;
      this.diagnostic.isLocationEnabled().then((isEnabled) => {
        if (!isEnabled && this.platform.is('cordova')) {
          //handle confirmation window code here and then call switchToLocationSettings
          this.sharedSvc.showAlertCallBack(ConstantService.message.somethingWentWrong,ConstantService.message.geoTagForPhoto).then(data => {
            if (data) {
              this.diagnostic.switchToLocationSettings();
            } else {
              this.sharedSvc.showMessage(ConstantService.message.enableGeoLocation)
            }
          })
        } else {
          this.sharedSvc.chckAppGpsPermission(this.networkSvc.online).then(data=>{
            this.photoCapturedDate = this.datepipe.transform(this.currentDate,ConstantService.message.dateTimeFormat);
            console.log("Reverse Geo Location"+JSON.stringify(this.sharedSvc.geocoderResult));
          }).catch(error=>{
            setTimeout(() => {
              console.log(error)
              this.sharedSvc.imageData = undefined;
              this.sharedSvc.showAlert(ConstantService.message.somethingWentWrong,ConstantService.message.internetOrLocationOff)
            }, 1000);
          });
        }
      })
    // }else{
    //   this.sharedSvc.showMessage(ConstantService.message.checkInternetConnection)
    // }
  }

  deleteReceipt() {
    this.sharedSvc.imageData = undefined;
    this.photoCapturedDate = undefined;
    this.changeDeector.detectChanges();
  }

  saveRecord() {
    if (this.sharedSvc.imageData == undefined) {
      this.sharedSvc.showAlert(ConstantService.message.warning, ConstantService.message.uploadPhoto)
    } else {
      let studentAttendanceData: IStudentRecord = {
        record_date: this.currentDate,
        class_name: this.currentClassName,
        section_name: this.currentSectionName,
        student_ids: this.absentRecords,
        sync_status: false,
        image_base64: this.sharedSvc.imageData,
        geo_coder_info: this.sharedSvc.geocoderResult
      }
      this.studentMealRecords.push(studentAttendanceData)
      this.storage.get(this.studentMealSavedData).then((fetchedData: IStudentRecord[])=>{
        if(fetchedData == null){
          this.storage.set(this.studentMealSavedData, this.studentMealRecords).then(data => {
            this.sharedSvc.showMessage(ConstantService.message.recordSaved)
            this.location.back();
          })
        }else{
          let updateDataStatus: boolean = false;
          for (let i = 0; i < fetchedData.length; i++) {
            if(fetchedData[i].record_date.substr(0,10) == this.currentDate.substr(0,10) && fetchedData[i].class_name == this.currentClassName &&
              fetchedData[i].section_name == this.currentSectionName){
                fetchedData[i] = studentAttendanceData;
                updateDataStatus = true;
            }
          }
          if(updateDataStatus){
            this.storage.set(this.studentMealSavedData, fetchedData).then(data => {
              this.sharedSvc.showMessage(ConstantService.message.recordUpdate)
              this.location.back();
            })
          }else{
            this.storage.set(this.studentMealSavedData, this.studentMealRecords).then(data => {
              this.sharedSvc.showMessage(ConstantService.message.recordSaved)
              this.location.back();
            })
          }
        }
      })
    }
  }
}
