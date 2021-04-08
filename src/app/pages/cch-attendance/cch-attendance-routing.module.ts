import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CchAttendancePage } from './cch-attendance.page';

const routes: Routes = [
  {
    path: '',
    component: CchAttendancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CchAttendancePageRoutingModule {}
