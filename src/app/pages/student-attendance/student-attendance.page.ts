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
  studentRecord: IStudentRecord[];
  studentRecords: IStudentRecord[];
  absentRecords: number[];
  photoCapturedDate: string;
  syncedDisabled: boolean;
  constructor(private datepipe: DatePipe, private sharedSvc: SharedService, private diagnostic: Diagnostic,
    private platform: Platform, private storage: Storage, private location: Location,
    private changeDeector: ChangeDetectorRef) {
      // this.platform.ready().then(() => {
      //   this.platform.resume.subscribe(() => {    
      //       this.takeLocationPermission();
      //   });
      //  });
    }

  ngOnInit() {
    this.studentList = [];
    this.sectionList = [];
    this.currentClassName = "";
    this.currentSectionName = "";
    this.sharedSvc.imageData = undefined;
    this.studentRecord = [];
    this.studentRecords = [];
    this.absentRecords = [];
    this.syncedDisabled = false;
    this.maxDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd')
    this.fetchAllStudentData();
  }

  fetchAllStudentData(){
    this.storage.get(ConstantService.dbKeyNames.studentData).then(data=>{
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
    let studentClass: IClass[] = this.studentDataList.filter(a => a.className == this.currentClassName);
    this.sectionList = studentClass[0].section
  }

  selectSection() {
    this.currentDate = "";
    this.sharedSvc.imageData = undefined;
    this.studentList = [];
  }

  changeDate(currentDate) {
    if (currentDate != "") {
      this.currentDate = currentDate;
      this.absentRecords = [];
      this.syncedDisabled = false;
      this.sharedSvc.imageData = undefined;
      this.sharedSvc.geocoderResult = undefined;
      this.photoCapturedDate = undefined;
      let studentSection: ISection[] = this.sectionList.filter(data => data.sectionName == this.currentSectionName);
      let tempStudentList = JSON.parse(JSON.stringify(studentSection[0].student));
      let studentList: IStudent[] = [...tempStudentList]
      this.storage.get(ConstantService.dbKeyNames.studentAttendanceData).then(attendanceData => {
        if (attendanceData != null) {
          console.log(attendanceData);
          this.studentRecords = attendanceData;
          let fetchedStudentData: IStudentRecord[] = this.studentRecords.filter(data => (data.record_date.substr(0, 10) == currentDate.substr(0, 10)) &&
            (data.class_name == this.currentClassName) && (data.section_name == this.currentSectionName))
          if (fetchedStudentData.length == 0) {
            this.studentList = tempStudentList;
          } else {
            this.absentRecords = fetchedStudentData[0].student_ids;
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
            this.photoCapturedDate = this.datepipe.transform(this.currentDate,"dd-MM-YYYY HH:mm:ss");
            this.studentList = studentList;
          }
        } else {
          this.studentList = tempStudentList;
        }
      }).catch(err => {
        console.log(err)
      })
    }
  }

  switchAttendance(student_id: number, attendance: boolean) {
    if (!attendance) {
      this.absentRecords.push(student_id);
    } else {
      const index = this.absentRecords.indexOf(student_id);
      if (index > -1) {
        this.absentRecords.splice(index, 1);
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
    this.photoCapturedDate = undefined;
    this.diagnostic.isLocationEnabled().then((isEnabled) => {
      if (!isEnabled && this.platform.is('cordova')) {
        //handle confirmation window code here and then call switchToLocationSettings
        this.sharedSvc.showAlertCallBack("Warning", "For geo tagging with photo you must need to enable the location permission.").then(data => {
          if (data) {
            this.diagnostic.switchToLocationSettings();
          } else {
            this.sharedSvc.showMessage("Enable location permission manually")
          }
        })
      } else {
        this.sharedSvc.openCamera().then(data=>{
          this.photoCapturedDate = this.datepipe.transform(this.currentDate,"dd-MM-YYYY HH:mm:ss");
          console.log("Reverse Geo Location"+JSON.stringify(this.sharedSvc.geocoderResult));
        });
      }
    })
  }

  deleteReceipt() {
    this.sharedSvc.imageData = undefined;
    this.photoCapturedDate = undefined;
    this.changeDeector.detectChanges();
  }

  saveRecord() {
    if (this.sharedSvc.imageData == undefined) {
      this.sharedSvc.showAlert("Warning", "Please upload a photo.")
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
      this.storage.get(ConstantService.dbKeyNames.studentAttendanceData).then((fetchedData: IStudentRecord[])=>{
        if(fetchedData == null){
          this.storage.set(ConstantService.dbKeyNames.studentAttendanceData, this.studentRecords).then(data => {
            this.sharedSvc.showMessage("Record successfully saved offline.")
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
            this.storage.set(ConstantService.dbKeyNames.studentAttendanceData, fetchedData).then(data => {
              this.sharedSvc.showMessage("Record successfully updated offline.")
              this.location.back();
            })
          }else{
            this.storage.set(ConstantService.dbKeyNames.studentAttendanceData, this.studentRecords).then(data => {
              this.sharedSvc.showMessage("Record successfully saved offline.")
              this.location.back();
            })
          }
        }
      })
    }
  }
}
