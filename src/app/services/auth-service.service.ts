import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { mainPort } from '../app.component';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  
  private response:any;

  constructor(private http:HttpClient, private router: Router) { }
  register(data:any): Observable<any> {
    return this.http.post(`${mainPort}/pdo/api/register`, data);
  }
  registerTeacher(data:any): Observable<any>{
    return this.http.post(`${mainPort}/pdo/api/register_teacher`, data);
  }
  login(data: any): Observable<any> {
    return this.http.post(`${mainPort}/pdo/api/login`, data);
  }
  loginTeacher(data:any): Observable<any>{
    return this.http.post(`${mainPort}/pdo/api/login_teacher`, data);
  }
  logout(): void {
    localStorage.clear();
    console.log('logout')
    this.router.navigate([''])
  }
  getToken(): any{
    return localStorage.getItem('token');
  }
}
