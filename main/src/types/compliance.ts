export const DOCUMENT_CATEGORIES = ['driver', 'safety', 'dqf', 'inspection', 'accident'] as const;
export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number];
