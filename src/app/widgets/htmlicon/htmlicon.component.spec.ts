import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmliconComponent } from './htmlicon.component';

describe('HtmliconComponent', () => {
  let component: HtmliconComponent;
  let fixture: ComponentFixture<HtmliconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HtmliconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HtmliconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
