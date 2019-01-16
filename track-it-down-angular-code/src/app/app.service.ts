import { Injectable } from '@angular/core';
//import observable related code
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';


//importing http client to make the request
import {HttpClient,HttpHeaders} from '@angular/common/http';
import{HttpErrorResponse,HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private url='http://localhost:3000/api/v1';

  constructor(private http:HttpClient, private cookieService:CookieService) { }

  public signupFunction(data):Observable<any>{
    const params = new HttpParams()
    .set('firstName' , data.firstName)
    .set('lastName' , data.lastName)
    .set('mobile' , data.mobile)
    .set('email' , data.email)
    .set('password' , data.password)
    .set('apiKey' , data.apiKey);

    return this.http.post(`${this.url}/users/signup`,params);
  }//end of signupFunction

  public signinFunction(data):Observable<any>{
    const params = new HttpParams()
    .set ('email', data.email)
    .set('password',data.password);

    return this.http.post(`${this.url}/users/login`,params);
  }

  public googleSignin(){
    window.open(`${this.url}/users/auth/google`,'_self');
  //or use
  // window.location.replace(`${this.url}/users/auth/google`);
  }
  public facebookSignin(){
    window.open(`${this.url}/users/auth/facebook`,'_self');
  //or use
  // window.location.replace(`${this.url}/users/auth/google`);
  }
  public twitterSignin(){
    window.open(`${this.url}/users/auth/twitter`,'_self');
  //or use
  // window.location.replace(`${this.url}/users/auth/google`);
  }
   
  public getUserInfoFromLocalstorage=()=>{
    return JSON.parse(localStorage.getItem('userInfo'));
  }
  public setUserInfoInLocalStorage=(data)=>{
    localStorage.setItem('userInfo',JSON.stringify(data));
  }
  public logout(): Observable<any> {

    const params = new HttpParams()
      .set('authToken',this.cookieService.get('authtoken'))

    return this.http.post(`${this.url}/users/logout`, params);

  } // end logout function

//******************************Dashboard Routes***************************/
  public allIssuesFunction(): Observable<any>{
    return this.http.get(`${this.url}/dashboard`);
  }
  //function to display single issue
  public getSingleIssueInformation(currentIssueId): Observable<any>{
    return this.http.get(`${this.url}/dashboard/view/`+currentIssueId);
  }
  //function to create issue
  public createIssue(title, description, status): Observable<any>{
    const params = new HttpParams()
    .set('authToken',this.cookieService.get('authtoken'))
    .set('title' , title)
    .set('description' , description)
    .set('status' , status)
    return this.http.post(`${this.url}/dashboard/create`,params);  
  }
  //function to delete issue
   public deleteIssue(issueId): Observable<any>{
    const params = new HttpParams()
    .set('authToken',this.cookieService.get('authtoken'))
    .set('issueId' , issueId)
    .set('data', null)
    return this.http.post(`${this.url}/dashboard/`+issueId+'/delete',params);
  }
  //function to edit issue
  public editIssue(title, description, status, color,issueId): Observable<any>{
    const params = new HttpParams()
    .set('authToken',this.cookieService.get('authtoken'))
    .set('title' , title)
    .set('description' , description)
    .set('status' , status)
    .set('color', color)
    return this.http.put(`${this.url}/dashboard/`+issueId+'/edit',params);
  }
  //function to add yourself as watcher
  public addYourselfFunction(issueId):Observable<any>{
    const params = new HttpParams()
    .set('authToken',this.cookieService.get('authtoken'))
    return this.http.post(`${this.url}/dashboard/`+issueId+'/viewers',params);
  }
  //function to add others as watcher
  public issueWatchersFunction(issueId,watcherEmail):Observable<any>{
    const params = new HttpParams()
    .set('authToken',this.cookieService.get('authtoken'))
    .set('addOtherViewer',watcherEmail)
    return this.http.post(`${this.url}/dashboard/`+issueId+'/otherViewers',params);
  }

  //function to post a comment
  public postCommentFunction(issueId,comment):Observable<any>{
    const params = new HttpParams()
    .set('authToken',this.cookieService.get('authtoken'))
    .set('userComment',comment)
    return this.http.post(`${this.url}/dashboard/`+issueId+'/postComment',params);
  }

  //function to view comments without reloading page
  public viewCommentsFunction(issueId):Observable<any>{
    const params = new HttpParams()
    .set('authToken',this.cookieService.get('authtoken'))
    return this.http.post(`${this.url}/dashboard/`+issueId+'/viewComments',params);
  }

  //exception handler
  private handleError(err: HttpErrorResponse){
    let errorMessage = '';

    if (err.error instanceof Error) {

      errorMessage = `An error occurred: ${err.error.message}`;

    } else {

      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;

    } // end condition *if

    console.error(errorMessage);

    return Observable.throw(errorMessage);

  }
}
