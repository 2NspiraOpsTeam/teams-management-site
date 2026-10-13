'use client';

export default function PropertyLocationMap({ name, latitude, longitude, showPin, fullHeight = false }: { name: string; latitude: number; longitude: number; showPin: boolean; fullHeight?: boolean }) {
  const coordinates = `${latitude},${longitude}`;
  const mapUrl = showPin
    ? `https://www.google.com/maps?q=${encodeURIComponent(coordinates)}&z=16&output=embed`
    : `https://www.google.com/maps?ll=${encodeURIComponent(coordinates)}&z=16&output=embed`;

  return <iframe
    src={mapUrl}
    title={showPin ? `Google Maps location of ${name}` : `Google Maps street area near ${name}; exact property location not verified`}
    className={fullHeight ? 'h-full w-full border-0 bg-stone-100' : 'h-[380px] w-full border-0 bg-stone-100 sm:h-[460px]'}
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    allowFullScreen
  />;
}
