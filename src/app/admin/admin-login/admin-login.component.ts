import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthServiceService } from '../../services/auth-service.service';
import { UserInformationService } from '../../services/user-information/user-information.service';
import { NavbarComponent } from "../../layouts/navbar/navbar.component";

@Component({
    selector: 'app-admin-login',
    standalone: true,
    templateUrl: './admin-login.component.html',
    styleUrl: './admin-login.component.css',
    imports: [NavbarComponent, FormsModule, ReactiveFormsModule]
})
export class AdminLoginComponent {
  onSubmit: any;
  formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder, private authsService: AuthServiceService, private router: Router, private userInformation: UserInformationService) {
    this.formGroup = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  loginTeacher() {
    if (this.formGroup.valid) {
      this.authsService.loginAdmin(this.formGroup.value)
      .subscribe(token => {
        if (token != false) {
          console.log('Correct Authentication')
          localStorage.setItem('token', token);
          localStorage.setItem('user', 'admin')
          const decodedToken: any = jwtDecode(token);
          const userId = decodedToken.user_id;
          localStorage.setItem('id', userId)
          this.router.navigate(['admin/dashboard/user-management'])
        } else {
          console.log('Wrong Authentication')
        }
      },
        error => {
          console.error('Login failed:', error);
        });
    }
  }
  ngOnInit(): void {

  }
}
