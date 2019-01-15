import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from "@angular/router";
import { AppService } from '../../app.service';
import{Location} from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import {ToastrService} from 'ngx-toastr';
declare var $:any;

@Component({
  selector: 'app-issue-view',
  templateUrl: './issue-view.component.html',
  styleUrls: ['./issue-view.component.css']
})
export class IssueViewComponent implements OnInit {

  public currentIssue;
  public currentIssueComments;
  public authToken: any;
  public userInfo: any;
  public data:any;

  constructor(private _route:ActivatedRoute, private router:Router, public AppService:AppService,private location:Location, private cookieService:CookieService, private toastr:ToastrService) 
  { }
  
  ngOnInit() {
    //Authenticate User
    this.authToken = this.cookieService.get('authtoken');
    this.userInfo = this.AppService.getUserInfoFromLocalstorage();

    let myIssueId = this._route.snapshot.paramMap.get('issueId');
    this.AppService.getSingleIssueInformation(myIssueId).subscribe(
      data =>{
        console.log(data);
        this.currentIssue=data["data"];
      },
      error=>{
        console.log("some error occured");
        console.log(error);
      }
    );
    
    this.AppService.viewCommentsFunction(myIssueId).subscribe(
      data =>{
        this.currentIssueComments=data;
    },
    error=>{
      console.log("some error occured");
      console.log(error);
    });
  }

  public viewNotifications():any{
    this.router.navigate(['/notifications/'+this.currentIssue.issueId]);
  }

  public deleteThisIssue():any{
    this.AppService.deleteIssue(this.currentIssue.issueId).subscribe(
      data=>{
        console.log(data);
        this.toastr.success("Issuse Deleted Successfully.");
        setTimeout(()=>{
          this.router.navigate(['/dashboard']);
        },1000)
      },

      error=>{
        console.log("Some error occured.");
        console.log(error); 
        this.toastr.error(error);
      }
    )
  }

  public addYourself():any{
    this.AppService.addYourselfFunction(this.currentIssue.issueId).subscribe((apiResponse)=>{
      if (apiResponse.status === 200){
       this.data=apiResponse.data;
       this.toastr.success(apiResponse.message)
      }
      else{
        this.toastr.error(apiResponse.message)
      }
    })
  }

  public userComment: string;
  public postComment():any{
    let comment= this.userComment;
    this.AppService.postCommentFunction(this.currentIssue.issueId,comment).subscribe(
      data=>{
        console.log(data);
        this.toastr.success("Comment Posted Succesfully!","Success");
       
      },
      error=>{
        console.log("Some error occured.");
        console.log(error);
        this.toastr.error('Some Error Occured!','Error');
      }
    )
  }

  public viewComments():any{
    this.AppService.viewCommentsFunction(this.currentIssue.issueId).subscribe(
      data =>{
        this.currentIssueComments=data;
    },
    error=>{
      console.log("some error occured");
      console.log(error);
    });
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

  ngOnDestroy() {
  }

}
