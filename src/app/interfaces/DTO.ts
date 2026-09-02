export interface Company {
  companyInfo: CompanyInfo,
  branchInfo: Branch[],
}

export interface CompanyInfo {
  name: string;
  logo: string;
  favicon: string;
  apps: AppUrl;
  socials: SocialMedia;
  deliveryPartners: RedirectUrl[];
  notice?: string[] | null;
}

export interface Branch {
  id?: string | number;
  identifier: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  long: number;
  isActive?: boolean;
  deliveryTime?: TimeTable[];
  pickupTime?: TimeTable[];
  openingTime: TimeTable[];
  redirects: Redirects;
  reviews: RedirectUrl[];
}

export interface SocialMedia {
  facebook: string | null;
  instagram: string | null;
}

export interface TimeTable {
  dayPt?: string;
  dayEn?: string;
  timePt: string;
  timeEn: string;
}

export interface Redirects {
  reservation: string | null;
  delivery: string | null;
  pickup: string | null;
  googleReview: string | null;
  location: string | null;
  pdf: PdfMenu;
}

export interface PdfMenu {
  dinein1: string | null;
  dinein2: string | null;
}

export interface MenuItem {
  id: number;
  category: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface CategoryItem {
  id: number;
  name: string;
  description: string;
  items: MenuItem[];
}

export interface RedirectUrl {
  name: string;
  url: string;
}

export interface AppUrl {
  googlePlayStore: string | null;
  appleAppStore: string | null;
}