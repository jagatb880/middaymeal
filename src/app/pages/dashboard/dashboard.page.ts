import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ConstantService } from 'src/app/services/constant.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  constructor(private router: Router,private storage: Storage, private sharedSvc: SharedService) { }

  ngOnInit() {
  }

  studentAttendance(){
    this.storage.get(ConstantService.dbKeyNames.studentData).then(data=>{
      if(data == null){
        this.sharedSvc.showAlert(ConstantService.message.warning,ConstantService.message.noStudentRecord)
      }else{
        this.router.navigate(['student-attendance'])
      }
    })
  }

  cchAttendance(){
    this.storage.get(ConstantService.dbKeyNames.cchData).then(data=>{
      if(data == null){
        this.sharedSvc.showAlert(ConstantService.message.warning,ConstantService.message.noCCHRecord)
      }else{
        this.router.navigate(['cch-attendance'])
      }
    })
  }

  

}
