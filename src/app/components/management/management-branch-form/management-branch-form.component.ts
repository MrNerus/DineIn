import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Branch } from '../../../interfaces/DTO';
import { ManagementService } from '../../../services/management.service';

@Component({
  selector: 'app-management-branch-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './management-branch-form.html',
  styleUrl: './management-branch-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementBranchFormComponent implements OnInit {
  public managementService = inject(ManagementService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public readonly branchId = signal<string | number | null>(null);
  public readonly originalIdentifier = signal<string | null>(null);
  public readonly isEditMode = signal<boolean>(true);
  public readonly isFormLoading = signal<boolean>(true);
  public readonly isSavingBranch = signal<boolean>(false);
  public readonly activeSection = signal<'info' | 'schedule' | 'redirects' | 'reviews'>('info');

  public branchForm: FormGroup = this.fb.group({
    id: [''],
    isActive: [false],
    identifier: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
    name: ['', [Validators.required]],
    address: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    lat: [38.7552, [Validators.required]],
    long: [-9.2202, [Validators.required]],
    openingTime: this.fb.array([]),
    redirects: this.fb.group({
      reservation: [''],
      delivery: [''],
      pickup: [''],
      location: [''],
      dinein1: ['assets/pdfs/Menu.pdf'],
      dinein2: ['']
    }),
    reviews: this.fb.array([])
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('identifier');
    if (idParam && idParam !== 'create') {
      this.isEditMode.set(true);
      this.loadBranchData(idParam);
    } else {
      this.isEditMode.set(false);
      this.branchId.set(null);
      this.originalIdentifier.set(null);
      this.isFormLoading.set(false);
      this.initEmptyForm();
    }
  }

  private initEmptyForm(): void {
    this.branchForm.reset({
      id: null,
      isActive: true,
      identifier: '',
      name: '',
      address: '',
      phone: '',
      lat: 38.7552,
      long: -9.2202,
      redirects: {
        reservation: '',
        delivery: '',
        pickup: '',
        location: '',
        dinein1: 'assets/pdfs/Menu.pdf',
        dinein2: ''
      }
    });

    this.openingTimeArray.clear();
    this.addOpeningTime();

    this.reviewsArray.clear();
  }

  public get openingTimeArray(): FormArray {
    return this.branchForm.get('openingTime') as FormArray;
  }

  public get reviewsArray(): FormArray {
    return this.branchForm.get('reviews') as FormArray;
  }

  public setSection(section: 'info' | 'schedule' | 'redirects' | 'reviews'): void {
    this.activeSection.set(section);
  }

  private loadBranchData(idOrIdentifier: string): void {
    this.isFormLoading.set(true);

    this.managementService.getBranchFromBackend(idOrIdentifier).subscribe({
      next: (branch) => {
        this.populateFormData(branch);
        this.isFormLoading.set(false);
      },
      error: (err) => {
        this.isFormLoading.set(false);
        console.error('Failed to load branch from backend:', err);
        this.managementService.showNotification(`Restaurante "${idOrIdentifier}" não encontrado no servidor.`, 'error');
        this.router.navigate(['/management/branches']);
      }
    });
  }

  private populateFormData(branch: Branch): void {
    this.branchId.set(branch.id || null);
    this.originalIdentifier.set(branch.identifier);

    this.branchForm.patchValue({
      id: branch.id || '',
      isActive: branch.isActive !== false,
      identifier: branch.identifier,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      lat: branch.lat,
      long: branch.long,
      redirects: {
        reservation: branch.redirects?.reservation || '',
        delivery: branch.redirects?.delivery || '',
        pickup: branch.redirects?.pickup || '',
        location: branch.redirects?.location || '',
        dinein1: branch.redirects?.pdf?.dinein1 || 'assets/pdfs/Menu.pdf',
        dinein2: branch.redirects?.pdf?.dinein2 || ''
      }
    });

    // Populate Opening Times
    this.openingTimeArray.clear();
    if (branch.openingTime && branch.openingTime.length > 0) {
      for (const item of branch.openingTime) {
        this.openingTimeArray.push(
          this.fb.group({
            dayPt: [item.dayPt || 'Segunda a domingo', Validators.required],
            dayEn: [item.dayEn || 'Monday to Sunday', Validators.required],
            timePt: [item.timePt || '', Validators.required],
            timeEn: [item.timeEn || '', Validators.required]
          })
        );
      }
    } else {
      this.addOpeningTime();
    }

    // Populate Reviews
    this.reviewsArray.clear();
    if (branch.reviews && branch.reviews.length > 0) {
      for (const rev of branch.reviews) {
        this.reviewsArray.push(
          this.fb.group({
            name: [rev.name || '', Validators.required],
            url: [rev.url || '', Validators.required]
          })
        );
      }
    }
  }

  public addOpeningTime(): void {
    this.openingTimeArray.push(
      this.fb.group({
        dayPt: ['Segunda a domingo', Validators.required],
        dayEn: ['Monday to Sunday', Validators.required],
        timePt: ['das 11h às 15h30, das 18h às 23h', Validators.required],
        timeEn: ['11 AM to 3:30 PM, 6 PM to 11 PM', Validators.required]
      })
    );
  }

  public removeOpeningTime(index: number): void {
    this.openingTimeArray.removeAt(index);
  }

  public addReview(): void {
    this.reviewsArray.push(
      this.fb.group({
        name: ['', Validators.required],
        url: ['', Validators.required]
      })
    );
  }

  public removeReview(index: number): void {
    this.reviewsArray.removeAt(index);
  }

  public saveFullBranch(): void {
    const infoControls = ['identifier', 'name', 'address', 'phone', 'lat', 'long'];
    let hasError = false;

    for (const ctrl of infoControls) {
      const control = this.branchForm.get(ctrl);
      if (control && control.invalid) {
        control.markAsTouched();
        hasError = true;
      }
    }

    if (hasError) {
      this.activeSection.set('info');
      this.managementService.showNotification('Please fill in all required General Info fields (Identifier, Name, Address, Phone).', 'error');
      return;
    }

    if (this.openingTimeArray.invalid) {
      this.activeSection.set('schedule');
      this.openingTimeArray.markAllAsTouched();
      this.managementService.showNotification('Please fill in all opening hours fields correctly.', 'error');
      return;
    }

    const redirectsGroup = this.branchForm.get('redirects');
    if (redirectsGroup && redirectsGroup.invalid) {
      this.activeSection.set('redirects');
      redirectsGroup.markAllAsTouched();
      this.managementService.showNotification('Please check URL formatting in Redirects.', 'error');
      return;
    }

    if (this.reviewsArray.invalid) {
      this.activeSection.set('reviews');
      this.reviewsArray.markAllAsTouched();
      this.managementService.showNotification('Please fill in all platform names and URLs.', 'error');
      return;
    }

    const val = redirectsGroup?.value || {};
    const payload: Partial<Branch> = {
      id: this.branchId() ? Number(this.branchId()) : (null as any),
      identifier: this.branchForm.get('identifier')?.value?.trim(),
      name: this.branchForm.get('name')?.value?.trim(),
      address: this.branchForm.get('address')?.value?.trim(),
      phone: this.branchForm.get('phone')?.value?.trim(),
      lat: Number(this.branchForm.get('lat')?.value),
      long: Number(this.branchForm.get('long')?.value),
      isActive: Boolean(this.branchForm.get('isActive')?.value),
      openingTime: this.openingTimeArray.value.map((item: any) => ({
        dayPt: item.dayPt?.trim() || '',
        dayEn: item.dayEn?.trim() || '',
        day: `${item.dayPt?.trim() || ''} (${item.dayEn?.trim() || ''})`,
        timePt: item.timePt?.trim() || '',
        timeEn: item.timeEn?.trim() || ''
      })),
      redirects: {
        reservation: val.reservation?.trim() || '',
        delivery: val.delivery?.trim() || '',
        pickup: val.pickup?.trim() || '',
        location: val.location?.trim() || '',
        googleReview: null,
        pdf: {
          dinein1: val.dinein1?.trim() || '',
          dinein2: val.dinein2?.trim() || ''
        }
      },
      reviews: this.reviewsArray.value.map((r: any) => ({
        name: r.name?.trim() || '',
        url: r.url?.trim() || ''
      }))
    };

    this.isSavingBranch.set(true);
    this.managementService.saveBranch(payload).subscribe({
      next: (savedBranch) => {
        this.isSavingBranch.set(false);
        if (savedBranch) {
          this.branchId.set(savedBranch.id || null);
          this.originalIdentifier.set(savedBranch.identifier);
          this.isEditMode.set(true);
          this.branchForm.patchValue({ id: savedBranch.id });
          const targetKey = savedBranch.id ? String(savedBranch.id) : savedBranch.identifier;
          this.router.navigate(['/management/branches/edit', targetKey], { replaceUrl: true });
        }
      },
      error: () => {
        this.isSavingBranch.set(false);
      }
    });
  }

  public toggleActiveDirectly(): void {
    const targetKey = this.branchId() ? String(this.branchId()) : this.originalIdentifier();
    if (!targetKey) return;

    this.managementService.toggleBranchStatus(targetKey).subscribe({
      next: (success) => {
        if (success) {
          const current = this.branchForm.get('isActive')?.value;
          this.branchForm.get('isActive')?.setValue(!current);
        }
      }
    });
  }
}
