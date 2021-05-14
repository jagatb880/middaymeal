import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ConstantService } from 'src/app/services/constant.service';

@Component({
  selector: 'app-meal-management',
  templateUrl: './meal-management.page.html',
  styleUrls: ['./meal-management.page.scss'],
})
export class MealManagementPage implements OnInit {
  
  mealStatus:boolean
  mealSwitch: any;
  maxDate: string;
  currentDate: string;
  reasonList: any;
  currentReason: any;
  selectedSegment: any;
  constructor(private datepipe: DatePipe) { 
  }

  ngOnInit() {
    this.maxDate = this.datepipe.transform(new Date(), ConstantService.message.maxDate)
    this.currentDate = new Date().toISOString();
    this.selectedSegment = "procurement"
    this.reasonList = [
      {
          "reason": "Not Prepared",
          "reasonId": 1,
          "remark": "Not Prepared"
      },
      {
          "reason": "No Cook Present",
          "reasonId": 2,
          "remark": "No Cook Present"
      },
      {
          "reason": "Rason Not Available",
          "reasonId": 3,
          "remark": "Rason Not Available"
      },
      {
          "reason": "Others",
          "reasonId": 4,
          "remark": "Others"
      }
  ]
  }
  togle(){
    if(!this.mealSwitch)
    {
      this.mealStatus =false;
      console.log(this.mealStatus);
    }
    else{
      this.mealStatus = true;
      console.log(this.mealStatus);
    }

  }

  changeDate(currentDate){
    console.log(currentDate)
  }

  selectReason(){

  }

  segmentChanged(){

  }

  mealNotSubmit(){

  }

  goToPreaparation(){
    this.selectedSegment = 'preaparation'
  }

  goToProcurement(){
    this.selectedSegment = 'procurement'
  }

  goToDistribution(){
    this.selectedSegment = 'distribution'
  }

  mealSubmit(){

  }
}
