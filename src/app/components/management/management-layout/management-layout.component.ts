import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ManagementService } from '../../../services/management.service';

@Component({
  selector: 'app-management-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './management-layout.html',
  styleUrl: './management-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementLayoutComponent {
  public authService = inject(AuthService);
  public managementService = inject(ManagementService);
  private router = inject(Router);

  public readonly isSidebarCollapsed = signal<boolean>(false);
  public readonly isMobileMenuOpen = signal<boolean>(false);

  public toggleSidebar(): void {
    this.isSidebarCollapsed.update(val => !val);
  }

  public toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(val => !val);
  }

  public closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  public logout(): void {
    this.authService.logout();
  }
}

