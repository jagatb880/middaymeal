import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'student-attendance',
    loadChildren: () => import('./pages/student-attendance/student-attendance.module').then( m => m.StudentAttendancePageModule)
  },
  {
    path: 'cch-attendance',
    loadChildren: () => import('./pages/cch-attendance/cch-attendance.module').then( m => m.CchAttendancePageModule)
  },
  {
    path: 'meal-management',
    loadChildren: () => import('./pages/meal-management/meal-management.module').then( m => m.MealManagementPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
