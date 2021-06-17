import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StudentMealAttendancePageRoutingModule } from './student-meal-attendance-routing.module';

import { StudentMealAttendancePage } from './student-meal-attendance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StudentMealAttendancePageRoutingModule
  ],
  declarations: [StudentMealAttendancePage]
})
export class StudentMealAttendancePageModule {}
