import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guard/guard.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'add', loadChildren: './add/add.module#AddPageModule', canActivate: [AuthGuard] },
  { path: 'modal-team', loadChildren: './modal-team/modal-team.module#ModalTeamPageModule' },
  { path: 'resume', loadChildren: './resume/resume.module#ResumePageModule', canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
