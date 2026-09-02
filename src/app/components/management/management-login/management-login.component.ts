import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-management-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './management-login.html',
  styleUrl: './management-login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementLoginComponent implements OnInit {
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  public loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/management/overview']);
    }
  }

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.value;
    this.authService.login(username, password);
  }

  public fillDemoCredentials(): void {
    this.loginForm.patchValue({
      username: 'admin',
      password: 'admin123'
    });
  }
}

