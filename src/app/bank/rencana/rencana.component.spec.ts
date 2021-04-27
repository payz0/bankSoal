import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RencanaComponent } from './rencana.component';

describe('RencanaComponent', () => {
  let component: RencanaComponent;
  let fixture: ComponentFixture<RencanaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RencanaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RencanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
