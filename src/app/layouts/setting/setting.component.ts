import { Component } from '@angular/core';
import { AuthServiceService } from '../../services/auth-service.service';

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css'
})
export class SettingComponent {
  constructor(private authService: AuthServiceService){
  }
  logout(){
    this.authService.logout();
  }
}
