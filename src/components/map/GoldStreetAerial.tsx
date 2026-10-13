'use client';

import { PropertyLocationPanel } from './PropertyLocationPanel';

export function GoldStreetAerial({ name = '61 Gold St', latitude = 40.709506004338, longitude = -74.005146181808 }: { name?: string; latitude?: number; longitude?: number; showFootprint?: boolean }) {
  return <section aria-label={`${name} location`}>
    <div className="h-[480px] overflow-hidden rounded-lg border border-stone-300 bg-stone-100 sm:h-[650px] lg:h-[740px]">
      <PropertyLocationPanel name={name} latitude={latitude} longitude={longitude} showPin fullHeight />
    </div>
    <p className="mt-2 text-sm text-slate-600">Interactive Google Map. Open the map to explore satellite imagery and directions.</p>
  </section>;
}
