import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeacherAttendancePage } from './teacher-attendance.page';

const routes: Routes = [
  {
    path: '',
    component: TeacherAttendancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherAttendancePageRoutingModule {}
