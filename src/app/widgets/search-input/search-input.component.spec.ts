import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchInputComponent } from './search-input.component';

describe('SearchInputComponent', () => {
  let fixture: ComponentFixture<SearchInputComponent>;
  let component: SearchInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should emit the current search value when the search button is clicked', () => {
    component.model = 'Ada';
    fixture.detectChanges();

    const spy = jasmine.createSpy('modelChange');
    component.modelChange.subscribe(spy);

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(spy).toHaveBeenCalledWith('Ada');
  });
});
