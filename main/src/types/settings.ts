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
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  dotNumber?: string;
  mcNumber?: string;
  operatingAuthority?: string;
  usdotStatus?: string;
  ein?: string;
  businessHours?: BusinessHours;
  bank?: BankDetails;
}

export interface UserPreferences {
  displayName?: string;
  avatarUrl?: string;
  language?: string;
  timeZone?: string;
  dateFormat?: string;
  theme?: 'light' | 'dark';
  units?: 'imperial' | 'metric';
  currency?: string;
  numberFormat?: string;
}

export interface SystemConfig {
  featureToggles?: Record<string, boolean>;
  modules?: Record<string, boolean>;
  defaultPermissions?: Record<string, string[]>;
  maintenance?: {
    enabled: boolean;
    message?: string;
    start?: string;
    end?: string;
  };
  backup?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
  };
}
