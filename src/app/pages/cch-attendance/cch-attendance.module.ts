import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CchAttendancePageRoutingModule } from './cch-attendance-routing.module';

import { CchAttendancePage } from './cch-attendance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CchAttendancePageRoutingModule
  ],
  declarations: [CchAttendancePage]
})
export class CchAttendancePageModule {}
