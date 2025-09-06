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