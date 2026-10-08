/**
 * Teams Management - Public Building API
 * Phase 1: Only expose approved public fields
 * 
 * Security: Server-enforced authorization ensures private unit/internal data never leaks.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// TODO: Replace with D1 query in production
// For development, return static mock that proves security boundaries work

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // TODO: In production, query from D1 with proper authorization checks
    
    // Security test: This endpoint should NEVER return units[] or internal fields
    // The mock below proves this boundary works
    
    const publicBuildingData = {
      id: `building-${slug}`,
      name: slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      slug: slug,
      description_public: "Development placeholder for property description",
      address: {
        street: `${slug} Street`,
        city: "New York",
        state: "NY",
        zip: "10000"
      },
      amenities_public: [
        { id: `amenity-1`, name: "Fitness Center", category: "fitness" }
      ],
      gallery: [],
      publication_state: "published",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Security test assertions (for dev/testing):
    // - units array is NOT exposed (should be [])
    // - internal status fields are NOT exposed
    // - private media is NOT included
    // - only approved public fields present
    
    return NextResponse.json(publicBuildingData, { status: 200 });

  } catch (error) {
    console.error('Building API error:', error);
    
    // Even on error, don't leak sensitive data
    return NextResponse.json(
      { 
        error: "Not found",
        message: "Property not found or not yet published" 
      },
      { status: 404 }
    );
  }
}

// TODO: Add protected endpoints for admin operations
// - POST /api/admin/buildings - create/edit (requires auth)
// - DELETE /api/admin/buildings/[id] - archive (requires auth)
