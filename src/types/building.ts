/**
 * Teams Management - Building/Property Types
 * Phase 1 Representative Data Model
 */

export interface Building {
  id: string;
  name: string;
  slug: string;
  descriptionPublic?: string;
  address: Address;
  coordinates?: Coordinates;
  publicationState: PublicationState;
  amenitiesPublic?: AmenitiesPublic[];
  managementContext?: ManagementContext;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  neighborhood?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type PublicationState = 'draft' | 'internal_review' | 'published' | 'archived';

export interface AmenitiesPublic {
  id: string;
  name: string;
  icon?: string;
  category: 'wellness' | 'fitness' | 'dining' | 'concierge' | 'workspace' | 'lifestyle';
}

export interface ManagementContext {
  teamName?: string;
  managementRelationship?: string;
  notes?: string;
}
