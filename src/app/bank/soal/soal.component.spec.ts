import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoalComponent } from './soal.component';

describe('SoalComponent', () => {
  let component: SoalComponent;
  let fixture: ComponentFixture<SoalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
