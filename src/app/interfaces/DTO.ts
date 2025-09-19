export interface Branch {
  identifier: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  long: number;
  socials: SocialMedia[];
  deliveryTime: TimeTable[];
  pickupTime: TimeTable[];
  openingTime: TimeTable[];
  redirects: Redirects;

}

export interface SocialMedia {
  svg: string;
  image: string;
  name: string;
  url: string;
}

export interface TimeTable {
    day: string;
    time: string;
}

export interface Redirects {
  reservation: string | null;
  delivery: string | null;
  pickup: string | null;
  googleReview: string | null;
  pdf: PdfMenu;
}

export interface PdfMenu {
  takeaway: string | null;
  dinein1: string | null;
  dinein2: string | null;
}