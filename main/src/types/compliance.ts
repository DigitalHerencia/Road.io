export const DOCUMENT_CATEGORIES = ['driver', 'safety'] as const;
export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number];
