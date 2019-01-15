import {Component,OnInit,ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { AppService } from './../../app.service';
import { Router } from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

declare var $: any;
 @Component({
    selector: 'app-dashboard-page',
    templateUrl: './dashboard-page.component.html',
    styleUrls: ['./dashboard-page.component.css']
  })
  export class DashboardPageComponent implements OnInit {

    public authToken: any;
    public userInfo: any;
    public issues: IssueData[] = [];
    displayedColumns = ['title', 'description', 'status', 'reporter','date'];
    dataSource: MatTableDataSource<IssueData>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

  constructor(public AppService: AppService,
    public router: Router,
    private toastr: ToastrService,
    private cookieService: CookieService) {
   
  }
  ngOnInit() {

    //Authenticate User
    this.authToken = this.cookieService.get('authtoken');

    this.userInfo = this.AppService.getUserInfoFromLocalstorage();

    //Dashboard Table
    // Assign the data to the data source for the table to render
   
    this.AppService.allIssuesFunction().subscribe(
      data =>{  
        console.log(data)
        this.issues=data["data"];
        this.dataSource = new MatTableDataSource(this.issues);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error=>{
        console.log("some error occured");
        console.log(error);
      }
    );
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  public logout: any = () => {

    this.AppService.logout()
      .subscribe((apiResponse) => {

        if (apiResponse.status === 200) {
          console.log("logout called")
          this.cookieService.delete('authtoken');

          this.cookieService.delete('receiverId');

          this.cookieService.delete('receiverName');
          
          this.cookieService.delete('session');

          this.cookieService.delete('session.sig');

          this.router.navigate(['/home']);

        } else {
          this.toastr.error(apiResponse.message)

        } // end condition

      }, (err) => {
        this.toastr.error('some error occured')

      });

  } // end logout

  public toggleCollapsed: any = () => {
        if ($(window).outerWidth() > 1194) {
            $('nav.side-navbar').toggleClass('shrink');
            $('.page').toggleClass('active');
        } else {
            $('nav.side-navbar').toggleClass('show-sm');
            $('.page').toggleClass('active-sm');
        }
    };
}


export interface IssueData {
  title: string;
  description: string;
  status: string;
  reporter: string;
  date: string;
}
