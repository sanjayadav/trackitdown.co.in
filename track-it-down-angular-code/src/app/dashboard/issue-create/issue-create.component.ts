import { Component, OnInit} from '@angular/core';
import { AppService } from '../../app.service';
import { CookieService } from 'ngx-cookie-service';
import{Location} from '@angular/common';
import{ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
declare var $:any;
@Component({
  selector: 'app-issue-create',
  templateUrl: './issue-create.component.html',
  styleUrls: ['./issue-create.component.css']
})
export class IssueCreateComponent implements OnInit {

  public authToken: any;
  public userInfo: any;

  constructor(private AppService:AppService, private _route:ActivatedRoute, private router: Router,private toastr: ToastrService,private location:Location,private cookieService:CookieService) {}

  public issueTitle: string;
  public issueDescription: string;
  public issueStatus: string;
  public possibleStatus=["Backlog","In-Progress","In-Test","Completed"];

  ngOnInit() {
    //Authenticate User
    this.authToken = this.cookieService.get('authtoken');

    this.userInfo = this.AppService.getUserInfoFromLocalstorage();
  }

  public createIssue():any{
 
      let title= this.issueTitle;
      let description =this.issueDescription;
      let status=this.issueStatus;
    
    console.log(title, description, status);

    this.AppService.createIssue(title, description, status).subscribe(

      data=>{
        console.log("issue created");
        console.log(data);
        this.toastr.success('Issue Posted Succesfully!','Success');
        setTimeout(()=>{
          this.router.navigate(['/dashboard']);
        },1000)
      },
      error=>{
        console.log("some error occured");
        console.log(error);
        alert("Some error occured.");
      }
    )

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


