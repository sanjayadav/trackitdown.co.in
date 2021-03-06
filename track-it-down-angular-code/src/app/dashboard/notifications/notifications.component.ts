import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import { CookieService } from 'ngx-cookie-service';
import{Location} from '@angular/common';
import{ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
declare var $:any;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})

export class NotificationsComponent implements OnInit  {
  public currentIssue;
  public authToken: any;
  public userInfo: any;
  constructor(private AppService:AppService,private cookieService:CookieService, private _route:ActivatedRoute, private router: Router,private toastr: ToastrService,private location:Location) { }

  ngOnInit() {
    //Authenticate User
    this.authToken = this.cookieService.get('authtoken');

    this.userInfo = this.AppService.getUserInfoFromLocalstorage();
    console.log("issueview ngonit is called");
    let myIssueId = this._route.snapshot.paramMap.get('issueId');
    console.log(myIssueId);

    this.currentIssue = this.AppService.getSingleIssueInformation(myIssueId).subscribe(
      data =>{
        console.log(data);
        this.currentIssue=data["data"];
      },
      error=>{
        console.log("some error occured");
        console.log(error);
      }
    );
  }

  public goBackToPreviousPage():any{
    this.location.back();
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
