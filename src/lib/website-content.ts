import catalog from './website-content-catalog.json';
export const websitePages = catalog;
export class ContentValidationError extends Error {}
export type ContentValues = Record<string,string>;
export const contentPage = (id: string) => websitePages.find(page => page.id === id);
export function defaultContent(id: string): ContentValues {
  return Object.fromEntries((contentPage(id)?.fields || []).map(field => [field.key,field.default]));
}
export function validateContent(id: string, input: unknown): ContentValues {
  const page = contentPage(id);
  if (!page || !input || typeof input !== 'object' || Array.isArray(input)) throw new ContentValidationError('Choose a website page and complete its text fields.');
  const values = input as Record<string,unknown>;
  if (Object.keys(values).length !== page.fields.length || Object.keys(values).some(key => !page.fields.some(field => field.key === key))) throw new ContentValidationError('The page fields have changed. Reload this page before saving.');
  for (const field of page.fields) {
    const value = values[field.key];
    if (typeof value !== 'string' || !value.trim() || value.length > field.maxLength || /[<>\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value)) throw new ContentValidationError(`${field.label}: enter plain text, up to ${field.maxLength} characters.`);
  }
  return values as ContentValues;
}
