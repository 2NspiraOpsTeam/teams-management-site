'use client';

import Link from 'next/link';
import type { BuildingPublic } from '@/lib/database.types';
import Image from 'next/image';

interface PropertyCardProps {
  building: BuildingPublic;
}

export function PropertyCard({ building }: PropertyCardProps) {
  const featuredImage = building.gallery[0]?.asset_id 
    ? `/media/buildings/${building.slug}/gallery/cover.jpg` 
    : `/images/property-placeholder.jpg`;

  return (
    <article className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      {/* Image Container */}
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <Image
          src={featuredImage}
          alt={`${building.name} exterior`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold text-slate-900 mb-2">
          {building.name}
        </h3>
        
        <p className="text-sm text-slate-500 mb-3">
          {building.address.neighborhood}, {building.address.city} {building.address.zip}
        </p>
        
        {/* Description */}
        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {building.description_public}
        </p>

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
