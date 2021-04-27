import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuComponent } from './su.component';

describe('SuComponent', () => {
  let component: SuComponent;
  let fixture: ComponentFixture<SuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
