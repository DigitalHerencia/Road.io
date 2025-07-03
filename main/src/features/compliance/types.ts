export const DOCUMENT_CATEGORIES = [
  'driver',
  'safety',
  'dqf',
  'inspection',
  'accident',
  'ifta',
] as const;
export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number];

export const DOCUMENT_STATUSES = ['ACTIVE', 'UNDER_REVIEW'] as const;
export type DocumentStatus = typeof DOCUMENT_STATUSES[number];

export interface RegulatorySettings {
  dotRules: boolean;
  environmental: boolean;
}

export interface HazmatSettings {
  emergencyContact?: string;
}

export interface ComplianceConfig {
  regulatory: RegulatorySettings;
  hazmat: HazmatSettings;
}
