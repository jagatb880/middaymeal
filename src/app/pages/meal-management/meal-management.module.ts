import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MealManagementPageRoutingModule } from './meal-management-routing.module';

import { MealManagementPage } from './meal-management.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MealManagementPageRoutingModule
  ],
  declarations: [MealManagementPage]
})
export class MealManagementPageModule {}
