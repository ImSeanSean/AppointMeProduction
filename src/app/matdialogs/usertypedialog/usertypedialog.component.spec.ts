import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsertypedialogComponent } from './usertypedialog.component';

describe('UsertypedialogComponent', () => {
  let component: UsertypedialogComponent;
  let fixture: ComponentFixture<UsertypedialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsertypedialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsertypedialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
