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
  selector: 'app-student-attendance',
  templateUrl: './student-attendance.page.html',
  styleUrls: ['./student-attendance.page.scss'],
})
export class StudentAttendancePage implements OnInit {

  classList: IClass[];
  sectionList: ISection[];
  studentList: IStudent[];
  currentClassName: any;
  currentSectionName: any;
  currentDate: any;
  maxDate: any;
  studentDataList: IClass[];
  studentRecords: IStudentRecord[];
  absentRecords: number[];
  photoCapturedDate: string;
  syncedDisabled: boolean;
  totalCount: number;
  absentCount: number;
  presentCount: number;
  studentFetchData: any;
  studentSavedData: any;
  studentMealAttendanceData: any;
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
    this.absentRecords = [];
    this.syncedDisabled = false;
    this.maxDate = this.datepipe.transform(new Date(), ConstantService.message.maxDate)
  }

  ionViewWillEnter(){
    if(this.sharedSvc.teacherRole){
      this.studentFetchData = ConstantService.dbKeyNames.studentData;
      this.studentSavedData = ConstantService.dbKeyNames.studentAttendanceData;
      this.studentMealAttendanceData = ConstantService.dbKeyNames.studentMealAttendanceData
    }else{
      this.studentFetchData = ConstantService.dbKeyNames.hmstudentData;
      this.studentSavedData = ConstantService.dbKeyNames.hmstudentAttendanceData;
      this.studentMealAttendanceData = ConstantService.dbKeyNames.hmstudentAttendanceData
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
              this.totalCount = studentList.length;
              this.presentCount = studentList.length
            } else {
              this.absentRecords = fetchedStudentData[0].student_ids;
              this.totalCount = studentList.length;
              this.absentCount = this.absentRecords.length
              this.presentCount = this.totalCount - this.absentCount
              for (let i = 0; i < studentList.length; i++) {
                for (let j = 0; j < fetchedStudentData[0].student_ids.length; j++) {
                  if (studentList[i].studentId == fetchedStudentData[0].student_ids[j]) {
                    studentList[i].attendance = false;
                  }
                }
              }
              this.syncedDisabled = fetchedStudentData[0].sync_status;
              this.sharedSvc.imageData = fetchedStudentData[0].image_base64;
              this.sharedSvc.geocoderResult = fetchedStudentData[0].geo_coder_info;
              this.photoCapturedDate = this.datepipe.transform(this.currentDate,ConstantService.message.dateTimeFormat);
              this.studentList = studentList;
              this.storage.get(this.studentMealAttendanceData).then(studentMealDatas=>{
                if(studentMealDatas != null){
                  let fetchedStudentMealData: IStudentRecord[] = studentMealDatas.filter(data => (data.record_date.substr(0, 10) == currentDate.substr(0, 10)) &&
              (data.class_name == this.currentClassName) && (data.section_name == this.currentSectionName))
                  if(fetchedStudentMealData.length > 0){
                    if(!this.syncedDisabled){
                      this.syncedDisabled = true;
                      this.sharedSvc.showAlert(ConstantService.message.warning,'You are not allowed to change any student attendance, once after feeling the student meal attendance')
                    }
                  }
                }
              })
            }
          } else {
            this.studentList = tempStudentList;
            this.totalCount = studentList.length;
            this.presentCount = studentList.length
          }
          if(String(new Date()).substr(0,15) == String(new Date(currentDate)).substr(0,15)){
            // this.syncedDisabled = false;
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
    // const actionSheet = await this.actionSheetCtrl.create({
    //   header: 'Select File Explorer',
    //   buttons: [{
    //     text: 'Load from File Explorer',
    //     handler: () => {
    //       this.sharedSvc.openGallery();
    //     }
    //   },
    //   {
    //     text: 'Use Camera',
    //     handler: () => {
    //       this.sharedSvc.openCamera();
    //     }
    //   },
    //   {
    //     text: 'Cancel',
    //     role: 'cancel'
    //   }
    //   ]
    // });
    // await actionSheet.present();
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
      this.studentRecords.push(studentAttendanceData)
      this.storage.get(this.studentSavedData).then((fetchedData: IStudentRecord[])=>{
        if(fetchedData == null){
          this.storage.set(this.studentSavedData, this.studentRecords).then(data => {
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
            this.storage.set(this.studentSavedData, fetchedData).then(data => {
              this.sharedSvc.showMessage(ConstantService.message.recordUpdate)
              this.location.back();
            })
          }else{
            this.storage.set(this.studentSavedData, this.studentRecords).then(data => {
              this.sharedSvc.showMessage(ConstantService.message.recordSaved)
              this.location.back();
            })
          }
        }
      })
    }
  }
}
