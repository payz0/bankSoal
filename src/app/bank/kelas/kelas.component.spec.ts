import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KelasComponent } from './kelas.component';

describe('KelasComponent', () => {
  let component: KelasComponent;
  let fixture: ComponentFixture<KelasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KelasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KelasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
