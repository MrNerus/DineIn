import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-booking',
  imports: [ReactiveFormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingComponent {
  private fb = inject(FormBuilder);

  bookingForm = this.fb.group({
    name: ['', Validators.required],
    contact: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    date: ['', Validators.required],
    time: ['', Validators.required],
    remarks: [''],
    numberOfPeople: [1, [Validators.required, Validators.min(1)]]
  });

  onSubmit() {
    if (this.bookingForm.valid) {
      console.log(this.bookingForm.value);
      // Here you would typically send the data to a server
      this.bookingForm.reset();
    }
  }
}