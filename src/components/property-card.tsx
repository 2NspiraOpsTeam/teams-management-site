'use client';

import Link from 'next/link';
import type { BuildingPublic } from '@/lib/database.types';

interface PropertyCardProps {
  building: BuildingPublic;
}

export function PropertyCard({ building }: PropertyCardProps) {
  return (
    <article className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      {/* Image Container */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 flex items-end p-6">
        <span className="text-white text-lg font-serif font-semibold">{building.name}</span>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold text-slate-900 mb-2">
          {building.name}
        </h3>
        
        <p className="text-sm text-slate-500 mb-3">
          {building.address.neighborhood ? `${building.address.neighborhood}, ` : ''}{building.address.city} {building.address.zip}
        </p>
        
        {/* Description */}
        {building.description_public && <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {building.description_public}
        </p>}

        {/* Amenities preview */}
        {building.amenities_public.slice(0, 3).map((amenity) => (
          <div key={amenity.id} className="flex items-center text-xs text-slate-500 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2" />
            {amenity.name}
          </div>
        ))}

        {/* Link to property detail */}
        <Link
          href={`/properties/${building.slug}`}
          className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors mt-4"
        >
          Explore this property
          <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
