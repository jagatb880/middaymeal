import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MealManagementPage } from './meal-management.page';

const routes: Routes = [
  {
    path: '',
    component: MealManagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MealManagementPageRoutingModule {}
