import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { ToastrModule} from 'ngx-toastr';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import 'hammerjs';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import { DashboardRouteGuardService } from './dashboard-route-guard.service';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule} from '@angular/material/form-field'
import { CdkTableModule} from '@angular/cdk/table';
import { MatInputModule,MatAutocompleteModule,MatPaginatorModule,MatSortModule,MatTableModule,MatTabsModule} from '@angular/material';
import { IssueViewComponent } from './issue-view/issue-view.component';
import { IssueEditComponent } from './issue-edit/issue-edit.component';
import { IssueCreateComponent } from './issue-create/issue-create.component';
import { WatchersComponent } from './watchers/watchers.component';
import { NotificationsComponent } from './notifications/notifications.component';

@NgModule({
  exports: [
    CdkTableModule,
    MatInputModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
  ]
})
export class myMaterialModule {}
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    myMaterialModule,
    ToastrModule.forRoot(),
    RouterModule.forChild([ 
      { path: 'dashboard', component: DashboardPageComponent, canActivate:[DashboardRouteGuardService] },
      { path:'issue/:issueId', component: IssueViewComponent,canActivate:[DashboardRouteGuardService]},
      { path:'create', component:IssueCreateComponent,canActivate:[DashboardRouteGuardService]},
      { path:'edit/:issueId',component:IssueEditComponent,canActivate:[DashboardRouteGuardService]},
      { path:'watchers/:issueId',component:WatchersComponent,canActivate:[DashboardRouteGuardService]},
      { path:'notifications/:issueId',component:NotificationsComponent,canActivate:[DashboardRouteGuardService]}
    ])
  ],
  declarations: [
    DashboardPageComponent,
    IssueViewComponent, 
    IssueEditComponent, 
    IssueCreateComponent,
    WatchersComponent,
    NotificationsComponent
  ],
  providers:[DashboardRouteGuardService]
})
export class DashboardModule { }
