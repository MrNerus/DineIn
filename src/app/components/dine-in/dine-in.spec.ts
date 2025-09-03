import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DineIn } from './dine-in';

describe('DineIn', () => {
  let component: DineIn;
  let fixture: ComponentFixture<DineIn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DineIn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DineIn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
