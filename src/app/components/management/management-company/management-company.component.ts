import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyInfo, RedirectUrl } from '../../../interfaces/DTO';
import { ManagementService } from '../../../services/management.service';

@Component({
  selector: 'app-management-company',
  imports: [ReactiveFormsModule],
  templateUrl: './management-company.html',
  styleUrl: './management-company.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementCompanyComponent implements OnInit {
  public managementService = inject(ManagementService);
  private fb = inject(FormBuilder);

  public readonly activeTab = signal<'basic' | 'socials' | 'delivery' | 'notice'>('basic');

  public companyForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    logo: ['', [Validators.required]],
    favicon: ['', [Validators.required]],
    apps: this.fb.group({
      googlePlayStore: [''],
      appleAppStore: ['']
    }),
    socials: this.fb.group({
      facebook: [''],
      instagram: ['']
    }),
    deliveryPartners: this.fb.array([]),
    notice: this.fb.array([])
  });

  constructor() {
    // Reactively populate when companyInfo becomes available in signal
    effect(() => {
      const info = this.managementService.companyInfo();
      if (info) {
        this.populateForm(info);
      }
    });
  }

  ngOnInit(): void {
    const current = this.managementService.companyInfo();
    if (current) {
      this.populateForm(current);
    }
  }

  public get deliveryPartners(): FormArray {
    return this.companyForm.get('deliveryPartners') as FormArray;
  }

  public get noticeImages(): FormArray {
    return this.companyForm.get('notice') as FormArray;
  }

  public setTab(tab: 'basic' | 'socials' | 'delivery' | 'notice'): void {
    this.activeTab.set(tab);
  }

  public populateForm(info: CompanyInfo): void {
    this.companyForm.patchValue({
      name: info.name || '',
      logo: info.logo || '',
      favicon: info.favicon || '',
      apps: {
        googlePlayStore: info.apps?.googlePlayStore || '',
        appleAppStore: info.apps?.appleAppStore || ''
      },
      socials: {
        facebook: info.socials?.facebook || '',
        instagram: info.socials?.instagram || ''
      }
    });

    // Populate Delivery Partners FormArray
    this.deliveryPartners.clear();
    if (info.deliveryPartners && info.deliveryPartners.length > 0) {
      for (const partner of info.deliveryPartners) {
        this.deliveryPartners.push(
          this.fb.group({
            name: [partner.name || '', Validators.required],
            url: [partner.url || '', Validators.required]
          })
        );
      }
    }

    // Populate Notice Images FormArray
    this.noticeImages.clear();
    if (info.notice && info.notice.length > 0) {
      for (const imgUrl of info.notice) {
        this.noticeImages.push(new FormControl(imgUrl, Validators.required));
      }
    }
  }

  public addDeliveryPartner(): void {
    this.deliveryPartners.push(
      this.fb.group({
        name: ['', Validators.required],
        url: ['', Validators.required]
      })
    );
  }

  public removeDeliveryPartner(index: number): void {
    this.deliveryPartners.removeAt(index);
  }

  public addNoticeImage(): void {
    this.noticeImages.push(new FormControl('', Validators.required));
  }

  public removeNoticeImage(index: number): void {
    this.noticeImages.removeAt(index);
  }

  public onSubmit(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      this.managementService.showNotification('Por favor corrija os campos obrigatórios.', 'error');
      return;
    }

    const formValue = this.companyForm.value;

    const updatedCompanyInfo: CompanyInfo = {
      name: formValue.name,
      logo: formValue.logo,
      favicon: formValue.favicon,
      apps: {
        googlePlayStore: formValue.apps?.googlePlayStore || null,
        appleAppStore: formValue.apps?.appleAppStore || null
      },
      socials: {
        facebook: formValue.socials?.facebook || null,
        instagram: formValue.socials?.instagram || null
      },
      deliveryPartners: formValue.deliveryPartners || [],
      notice: formValue.notice && formValue.notice.length > 0 ? formValue.notice : null
    };

    this.managementService.updateCompanyInfo(updatedCompanyInfo).subscribe();
  }
}

