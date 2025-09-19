
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { OrderComponent } from './components/order/order/order.component';
import { BookingComponent } from './components/booking/booking/booking.component';
import { LocationComponent } from './components/location/location.component';
import { GetAppComponent } from './components/get-app/get-app.component';
import { ContactComponent } from './components/contact/contact.component';
import { OrderLocationComponent } from './components/order/order-location/order-location.component';
import { DineInAndTakeawayComponent } from './components/dine-in/dine-in-and-takeaway/dine-in-and-takeaway.component';
import { bookingLocationComponent } from './components/booking/booking-location/booking-location.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { DineInLocationComponent } from './components/dine-in/dine-in-location/dine-in-location.component';
import { DineInCategoryComponent } from './components/dine-in/dine-in-category/dine-in-category.component';
import { OrderOptionComponent } from './components/order/order-option/order-option.component';
import { GoogleReviewComponent } from './components/google-review/google-review.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'order', component: OrderOptionComponent },
  { path: 'order/:orderType', component: OrderLocationComponent },
  { path: 'order/:orderType/:branchId', component: OrderComponent },
  { path: 'dine-in-and-takeaway', component: DineInLocationComponent },
  { path: 'dine-in-and-takeaway/:branchId', component: DineInAndTakeawayComponent },
  { path: 'dine-in-and-takeaway/:branchId/dine-in', component: DineInCategoryComponent },
  { path: 'booking', component: bookingLocationComponent },
  { path: 'booking/:branchId', component: BookingComponent },
  { path: 'location', component: LocationComponent },
  { path: 'get-app', component: GetAppComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'order', component: OrderLocationComponent },
  { path: 'privacy-policy', component: PrivacyComponent },
  { path: 'google-review', component: GoogleReviewComponent },
  { path: 'DineIn/', component: HomeComponent },
  { path: 'DineIn/order/:branchId', component: OrderComponent },
  { path: 'DineIn/dine-in-and-takeaway', component: DineInAndTakeawayComponent },
  { path: 'DineIn/booking', component: bookingLocationComponent },
  { path: 'DineIn/booking/:branchId', component: BookingComponent },
  { path: 'DineIn/location', component: LocationComponent },
  { path: 'DineIn/get-app', component: GetAppComponent },
  { path: 'DineIn/contact', component: ContactComponent },
  { path: 'DineIn/order', component: OrderLocationComponent },
  { path: 'DineIn/privacy-policy', component: PrivacyComponent },
];
