/**
 * Teams Management - Layout/Floor Plan Types
 * Phase 1 Representative Data Model
 */

export interface Layout {
  id: string;
  name: string; // e.g., "Studio A", "One Bedroom A"
  description?: string;
  specifications: Specifications;
  dimensions: Dimensions;
  floorPlanAssetKey?: string; // R2 reference
  assetVersion: number;
  reusedByCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Specifications {
  windowType?: WindowType;
  ceilingHeightFeet?: number;
  specialFeatures?: string[];
  accessibilityNotes?: string;
}

export type WindowType = 'bay' | 'garden' | 'sliding' | 'standard';

export interface Dimensions {
  widthFeet: number;
  depthFeet: number;
  heightCeilingFeet?: number;
}
