import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrEditModalComponent } from './add-or-edit-modal.component';

describe('AddOrEditModalComponent', () => {
  let component: AddOrEditModalComponent;
  let fixture: ComponentFixture<AddOrEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOrEditModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOrEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
