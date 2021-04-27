import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSoalComponent } from './list-soal.component';

describe('ListSoalComponent', () => {
  let component: ListSoalComponent;
  let fixture: ComponentFixture<ListSoalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListSoalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListSoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
