import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-get-app',
  imports: [],
  templateUrl: './get-app.html',
  styleUrl: './get-app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GetAppComponent {
  redirectToAppStore() {
    window.location.href = 'https://www.apple.com/app-store/';
  }

  redirectToPlayStore() {
    window.location.href = 'https://play.google.com/store';
  }
}