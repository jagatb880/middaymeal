import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ConstantService } from 'src/app/services/constant.service';
import { Storage } from '@ionic/storage';
import { SharedService } from 'src/app/services/shared.service';

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
  menuList: any;
  menuOnDate: any;
  selectedWeek: any;

  constructor(private datepipe: DatePipe, private storage: Storage, private sharedSvc: SharedService) { 
  }

  ngOnInit() {
    this.maxDate = this.datepipe.transform(new Date(), ConstantService.message.maxDate)
    this.currentDate = new Date().toISOString();
    this.selectedSegment = "procurement";
    this.selectedWeek = this.datepipe.transform(this.currentDate,'full').split(',')[0].trim()
    this.storage.get(ConstantService.dbKeyNames.mealManagementData).then((data:any)=>{
      console.log(data)
      this.reasonList = data.reason;
      this.menuList = data.menu;
      if(this.selectedWeek == 'Sunday'){
        this.sharedSvc.showAlert("Warning","Sunday is off, choose other date");
      }else{
        this.menuList.forEach(menu => {
          if(menu.day == this.selectedWeek){
            this.menuOnDate = menu.items
          }
        });
      }
    })
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
    this.selectedWeek = this.datepipe.transform(this.currentDate,'full').split(',')[0].trim();
    if(this.selectedWeek == 'Sunday'){
      this.sharedSvc.showAlert("Warning","Sunday is off, choose other date");
    }else{
      this.menuList.forEach(menu => {
        if(menu.day == this.selectedWeek){
          this.menuOnDate = menu.items
        }
      });
    }
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
