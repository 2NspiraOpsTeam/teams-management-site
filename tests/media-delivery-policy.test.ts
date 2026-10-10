import { describe, expect, it } from 'vitest';
import { isDeliverablePublicMedia, type MediaRow } from '../src/lib/media-management';

const media = (storage_key:string) => ({ storage_key } as MediaRow);

describe('preview media delivery policy', () => {
  it.each([
    ['/preview-properties/1374-1st-ave/image-10.jpg'],
    ['/preview-properties/225-e-83rd-st/image-13.jpg'],
    ['/preview-properties/171-e-74th-st/image-07.jpg'],
    ['/preview-properties/349-351-w-46th-st/image-16.jpg'],
    ['/preview-properties/1365-1st-ave/image-08.jpg'],
    ['/preview-properties/42-70-156th-st-flushing/image-14.jpg'],
  ])('allows the approved gallery asset %s', (path) => {
    expect(isDeliverablePublicMedia(media(path))).toBe(true);
  });

  it.each([
    ['/preview-properties/1374-1st-ave/image-11.jpg'],
    ['/preview-properties/225-e-83rd-st/unapproved.jpg'],
    ['/preview-properties/unapproved-property/image-01.jpg'],
  ])('continues to reject unapproved static media %s', (path) => {
    expect(isDeliverablePublicMedia(media(path))).toBe(false);
  });

  it('continues to allow API-backed media', () => {
    expect(isDeliverablePublicMedia(media('uploads/building/photo.jpg'))).toBe(true);
  });
});
