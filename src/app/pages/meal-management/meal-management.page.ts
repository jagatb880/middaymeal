import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-meal-management',
  templateUrl: './meal-management.page.html',
  styleUrls: ['./meal-management.page.scss'],
})
export class MealManagementPage implements OnInit {
  all:boolean
  attendance: any;
  constructor() { 
  }

  ngOnInit() {
  }
  togle(){
    if(!this.attendance)
    {
      this.all =false;
      console.log(this.all);
    }
    else{
      this.all = true;
      console.log(this.all);
    }

  }
}
