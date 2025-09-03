
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { OrderComponent } from './components/order/order.component';
import { DineInComponent } from './components/dine-in/dine-in.component';
import { BookingComponent } from './components/booking/booking.component';
import { LocationComponent } from './components/location/location.component';
import { GetAppComponent } from './components/get-app/get-app.component';
import { ContactComponent } from './components/contact/contact.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'order', component: OrderComponent },
  { path: 'dine-in', component: DineInComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'location', component: LocationComponent },
  { path: 'get-app', component: GetAppComponent },
  { path: 'contact', component: ContactComponent },
];
