import { describe, it, expect } from 'vitest';
import { generateUniqueFilename } from './compliance';

describe('generateUniqueFilename', () => {
  it('creates unique names preserving extension', () => {
    const a = generateUniqueFilename('doc.pdf');
    const b = generateUniqueFilename('doc.pdf');
    expect(a).not.toBe(b);
    expect(a.endsWith('.pdf')).toBe(true);
  });
});
