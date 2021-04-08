import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeacherAttendancePageRoutingModule } from './teacher-attendance-routing.module';

import { TeacherAttendancePage } from './teacher-attendance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeacherAttendancePageRoutingModule
  ],
  declarations: [TeacherAttendancePage]
})
export class TeacherAttendancePageModule {}
