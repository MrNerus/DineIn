import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetApp } from './get-app';

describe('GetApp', () => {
  let component: GetApp;
  let fixture: ComponentFixture<GetApp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetApp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetApp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
