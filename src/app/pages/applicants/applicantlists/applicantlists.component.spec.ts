import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantlistsComponent } from './applicantlists.component';

describe('ApplicantlistsComponent', () => {
  let component: ApplicantlistsComponent;
  let fixture: ComponentFixture<ApplicantlistsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantlistsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantlistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
