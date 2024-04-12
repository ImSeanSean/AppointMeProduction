import { Component, OnInit } from '@angular/core';
import { Teacher } from '../../interfaces/Teacher';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-teacher-card',
  standalone: true,
  imports: [NgFor],
  templateUrl: './teacher-card.component.html',
  styleUrl: './teacher-card.component.css'
})
export class TeacherCardComponent implements OnInit{
  private apiUrl = 'http://localhost/appointme/pdo/api/get_consultants';
  teachers: Teacher[] = [];

  constructor(private http: HttpClient, private router: Router) {};

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.apiUrl);
  }

  changeRoute(teacherId: number): void {
    this.router.navigate(['/dashboard/appointment-view', teacherId]);
  }

  ngOnInit(): void {
    this.getTeachers().subscribe(
      (data: Teacher[]) => {
        this.teachers = data;
        console.log(this.teachers);
      },
      (error) => {
        console.error('Error fetching teachers:', error);
      }
    );
  }
}
