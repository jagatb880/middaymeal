import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-student-attendance',
  templateUrl: './student-attendance.page.html',
  styleUrls: ['./student-attendance.page.scss'],
})
export class StudentAttendancePage implements OnInit {

  classList: any[];
  sectionList: any[];
  studentList: any[];
  currentClass: any;
  currentSection: any;
  currentDate: any;
  maxDate: any;
  constructor(private datepipe: DatePipe) { }

  ngOnInit() {
    debugger
    this.maxDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd')
    this.classList=[
      {
        "name":"Class-1",
        "code":1
      },
      {
        "name":"Class-2",
        "code":2
      },
      {
        "name":"Class-3",
        "code":3
      },
      {
        "name":"Class-4",
        "code":4
      },
      {
        "name":"Class-5",
        "code":5
      },
      {
        "name":"Class-6",
        "code":6
      },
      {
        "name":"Class-7",
        "code":7
      },
    ]
    this.sectionList=[
      {
        "name":"Section-A",
        "code":1
      },
      {
        "name":"Section-B",
        "code":2
      },
      {
        "name":"Section-C",
        "code":3
      },
      {
        "name":"Section-D",
        "code":4
      },
      {
        "name":"Section-E",
        "code":5
      }
    ]

    this.studentList = [
      {
        "name":"Pritish Ranjan Sahoo",
        "roll_no":13,
        "attendance":true
      },
      {
        "name":"Pritish Ranjan Sahoo",
        "roll_no":13,
        "attendance":true
      },
      {
        "name":"Pritish Ranjan Sahoo",
        "roll_no":13,
        "attendance":true
      },
      {
        "name":"Pritish Ranjan Sahoo",
        "roll_no":13,
        "attendance":true
      },
      {
        "name":"Pritish Ranjan Sahoo",
        "roll_no":13,
        "attendance":true
      },
      {
        "name":"Pritish Ranjan Sahoo",
        "roll_no":13,
        "attendance":true
      },
      {
        "name":"Pritish Ranjan Sahoo",
        "roll_no":13,
        "attendance":false
      },
      {
        "name":"Pritish Ranjan Sahoo",
        "roll_no":13,
        "attendance":false
      }
    ]
  }

  selectClass(){
    this.currentSection = "";
    this.currentDate = "";
  }

  selectSection(){
    this.currentDate = "";
  }

  changeDate(currentDate) {
  }

}
