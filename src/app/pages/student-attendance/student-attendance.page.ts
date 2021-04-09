import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IClass } from '../../interfaces/class';
import { ISection } from 'src/app/interfaces/section';
import { IStudent } from 'src/app/interfaces/student';
import { IStudentRecord } from 'src/app/interfaces/studentRecord';
import { SharedService } from 'src/app/services/shared.service';
import { ActionSheetController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-student-attendance',
  templateUrl: './student-attendance.page.html',
  styleUrls: ['./student-attendance.page.scss'],
})
export class StudentAttendancePage implements OnInit {

  classList: IClass[];
  sectionList: ISection[];
  studentList: IStudent[];
  currentClassCode: any;
  currentSectionCode: any;
  currentDate: any;
  maxDate: any;
  studentDataList: IClass[];
  studentRecord: IStudentRecord[];
  studentRecords: IStudentRecord[];
  constructor(private datepipe: DatePipe, private sharedSvc: SharedService, private constantSvc: ConstantService,
    private actionSheetCtrl: ActionSheetController, private storage: Storage) { }

  ngOnInit() {
    this.studentList = [];
    this.sectionList = [];
    this.currentClassCode = "";
    this.currentSectionCode = "";
    this.studentRecord = [];
    this.studentRecords = []
    this.maxDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd')

    this.studentDataList = [
      {
        "name":"Class-1",
        "code":1,
        "sections":[
          {
            "name":"Section-A",
            "code":1,
            "students":[
              {
                "name":"Pritish Ranjan Sahoo",
                "student_id": 1,
                "addmission_no":13,
                "attendance":true
              },
              {
                "name":"Pritish Ranjan Sahoo",
                "student_id": 2,
                "addmission_no":13,
                "attendance":true
              },
              {
                "name":"Pritish Ranjan Sahoo",
                "student_id": 3,
                "addmission_no":13,
                "attendance":true
              },
              {
                "name":"Pritish Ranjan Sahoo",
                "student_id": 4,
                "addmission_no":13,
                "attendance":true
              },
              {
                "name":"Pritish Ranjan Sahoo",
                "student_id": 5,
                "addmission_no":13,
                "attendance":true
              },
              {
                "name":"Pritish Ranjan Sahoo",
                "student_id": 6,
                "addmission_no":13,
                "attendance":true
              },
              {
                "name":"Pritish Ranjan Sahoo",
                "student_id": 7,
                "addmission_no":13,
                "attendance":true
              },
              {
                "name":"Pritish Ranjan Sahoo",
                "student_id": 8,
                "addmission_no":13,
                "attendance":true
              }
            ]
          },
          {
            "name":"Section-B",
            "code":2,
            "students":[
              {
                "name":"Hari Sankar Sahoo",
                "student_id": 1,
                "addmission_no":13,
                "attendance":true
              },
              {
                "name":"Hari Sankar Sahoo",
                "student_id": 2,
                "addmission_no":13,
                "attendance":true
              },
            ]
          },
          {
            "name":"Section-C",
            "code":3,
            "students":[]
          }
        ]
      },
      {
        "name":"Class-2",
        "code":2,
        "sections":[]
      }
    ]
    if(this.studentDataList.length > 0){
      this.classList = this.studentDataList
    }
  }

  selectClass(){
    this.currentSectionCode = "";
    this.currentDate = "";
    this.sharedSvc.imageData = undefined;
    let studentClass: IClass[] = this.studentDataList.filter(a=> a.code == this.currentClassCode);
    this.sectionList = studentClass[0].sections
  }

  selectSection(){
    this.currentDate = "";
    this.sharedSvc.imageData = undefined;
    this.studentList = [];
  }

  changeDate(currentDate) {
    if(currentDate != ""){
      this.currentDate = currentDate;
      this.storage.get(ConstantService.dbKeyNames.studentAttendanceData).then(attendanceData=>{
        if(attendanceData != null){
          console.log(attendanceData);
          this.studentRecords = attendanceData;
          let fetchedStudentData = this.studentRecords.filter(data=> data.record_date.substr(0,10) == currentDate.substr(0,10))
          if(fetchedStudentData.length == 0){
            let studentSection: ISection[] = this.sectionList.filter(data=> data.code == this.currentSectionCode);
            this.studentList = studentSection[0].students;
          }else{

          }
        }else{
          let studentSection: ISection[] = this.sectionList.filter(data=> data.code == this.currentSectionCode);
          this.studentList = studentSection[0].students;
        }
      }).catch(err=>{
        console.log(err)
      })
    }
  }

  /**
   * This method is used to show a action sheet with list of action to choose the user.
   * @memberof CrewNewExpensePage
   */
  async uploadphoto() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select File Explorer',
      buttons: [{
        text: 'Load from File Explorer',
        handler: () => {
          this.sharedSvc.openGallery();
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.sharedSvc.openCamera();
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }

  deleteReceipt(){
    this.sharedSvc.imageData = undefined;
  }

  saveRecord() {
    if(this.sharedSvc.imageData != undefined){
      this.sharedSvc.showAlert("Warning","Please upload a photo.")
    }else{
      let studentAttendanceData: IStudentRecord = {
          record_date: this.currentDate,
          class_code: this.currentClassCode,
          section_code: this.currentSectionCode,
          student_ids: [],
          sync_status: false,
          image_base64: this.sharedSvc.imageData
      }
      this.studentRecords.push(studentAttendanceData)
      this.storage.set(ConstantService.dbKeyNames.studentAttendanceData,this.studentRecords).then(data=>{
        this.sharedSvc.showMessage("Record successfully saved offline.")
      })
    }
  }

}
