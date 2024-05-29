import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationTeacherComponent } from './notification-teacher.component';

describe('NotificationTeacherComponent', () => {
  let component: NotificationTeacherComponent;
  let fixture: ComponentFixture<NotificationTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationTeacherComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificationTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
