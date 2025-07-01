export interface BusinessHours {
  [day: string]: { open: string; close: string } | null;
}

export interface BankDetails {
  accountNumber?: string;
  routingNumber?: string;
}

export interface CompanyProfile {
  companyName: string;
  legalEntity: string;
  dotNumber?: string;
  usdotStatus?: string;
  ein?: string;
  businessHours?: BusinessHours;
  bank?: BankDetails;
}
