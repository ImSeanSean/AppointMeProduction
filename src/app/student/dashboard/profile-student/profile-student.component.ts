import { Component, OnInit, inject } from '@angular/core';
import { User } from '../../../interfaces/User';
import { ProfileServiceService } from '../../../services/ProfileService/profile-service.service';

@Component({
  selector: 'app-profile-student',
  standalone: true,
  imports: [],
  templateUrl: './profile-student.component.html',
  styleUrl: './profile-student.component.css'
})
export class ProfileStudentComponent implements OnInit{
  private profileService = inject(ProfileServiceService)
  user: User[] = [];

  ngOnInit(): void {
      this.profileService.currentProfile.subscribe(profile=>{
        this.user[0] = profile
      })
  }
}
