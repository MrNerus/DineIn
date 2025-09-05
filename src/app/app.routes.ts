
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { OrderComponent } from './components/order/order/order.component';
import { BookingComponent } from './components/booking/booking.component';
import { LocationComponent } from './components/location/location.component';
import { GetAppComponent } from './components/get-app/get-app.component';
import { ContactComponent } from './components/contact/contact.component';
import { OrderLocationComponent } from './components/order/order-location/order-location.component';
import { DineInAndTakeawayComponent } from './components/dine-in/dine-in-and-takeaway/dine-in-and-takeaway.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'order/:branchId', component: OrderComponent },
  { path: 'dine-in-and-takeaway', component: DineInAndTakeawayComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'location', component: LocationComponent },
  { path: 'get-app', component: GetAppComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'order', component: OrderLocationComponent },
  { path: 'DineIn/', component: HomeComponent },
  { path: 'DineIn/order', component: OrderComponent },
  { path: 'DineIn/dine-in', component: DineInComponent },
  { path: 'DineIn/booking', component: BookingComponent },
  { path: 'DineIn/location', component: LocationComponent },
  { path: 'DineIn/get-app', component: GetAppComponent },
  { path: 'DineIn/contact', component: ContactComponent },
  { path: 'DineIn/order', component: OrderLocationComponent },
];
