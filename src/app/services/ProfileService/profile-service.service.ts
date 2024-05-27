import { Injectable } from '@angular/core';
import { User } from '../../interfaces/User';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileServiceService {
  private profile = new BehaviorSubject<any>(null);
  currentProfile = this.profile.asObservable();

  updateProfile(profile: any){
    this.profile.next(profile);
  }
}
