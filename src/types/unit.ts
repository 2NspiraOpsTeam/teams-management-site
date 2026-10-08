/**
 * Teams Management - Unit Types
 * Phase 1 Representative Data Model (Internal Only)
 */

export interface Unit {
  id: string;
  buildingId: string;
  unitIdentifier: string; // e.g., "A1", "2B", "PH-A"
  floorNumber: number;
  layoutId: string;
  status: UnitStatus;
  specifications?: Specifications;
  mediaAssignments: MediaAssignment[];
  createdAt: string;
  updatedAt: string;
}

export type UnitStatus = 
  | 'available_internal'   // Available for lease (internal record)
  | 'occupied'            // Currently occupied
  | 'under_construction'   // Not yet ready
  | 'maintenance';        // Temporary status

export interface Specifications {
  squareFootage?: number;
  ceilingHeight?: number;
  windowType?: string;
  specialFeatures?: string[];
}

export interface MediaAssignment {
  assetId: string;
  isCover: boolean;
  orderIndex: number;
  caption?: string;
  altText?: string;
}
