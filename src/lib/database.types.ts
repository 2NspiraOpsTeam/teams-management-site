/**
 * Teams Management - Database Types (D1 Schema)
 * Phase 1 Data Model
 */

export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

export interface JSONObject { [key: string]: JSONValue; }
export interface JSONArray { [index: number]: JSONValue; }

// Core Entities - Public (Published only)
export interface BuildingPublic {
  id: string;
  name: string;
  slug: string;
  description_public?: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    neighborhood?: string;
  };
  amenities_public: AmenitiesPublic[];
  gallery: MediaAssignmentPublic[];
  latitude?: number | null;
  longitude?: number | null;
  geocode_status?: 'pending' | 'verified' | 'failed' | null;
  map_verified?: boolean;
  publication_state: PublicationState;
  management_context?: {
    team_name?: string;
    notes?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AmenitiesPublic {
  id: string;
  name: string;
  category: 'wellness' | 'fitness' | 'dining' | 'concierge' | 'workspace' | 'lifestyle';
}

export interface MediaAssignmentPublic {
  asset_id: string;
  is_cover: boolean;
  order_index: number;
  caption?: string;
  alt_text?: string;
}

// Core Entities - Internal (Private in Phase 1)
export interface UnitInternal {
  id: string;
  building_id: string;
  unit_identifier: string;
  floor_number: number;
  layout_id: string;
  status: 'available_internal' | 'occupied' | 'under_construction' | 'maintenance';
  specifications?: {
    square_footage?: number;
    ceiling_height_feet?: number;
    special_features?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface Layout {
  id: string;
  name: string;
  description?: string;
  specifications: {
    window_type?: 'bay' | 'garden' | 'sliding' | 'standard';
    ceiling_height_feet?: number;
  };
  dimensions: {
    width_feet: number;
    depth_feet: number;
  };
  floor_plan_asset_key?: string;
  asset_version: number;
  reused_by_count: number;
  created_at: string;
  updated_at: string;
}

// Media Architecture
export interface MediaAsset {
  id: string;
  storage_key: string;
  file_type: string;
  dimensions?: { width: number; height: number };
  size_bytes: number;
  checksum: string;
  provenance: string;
  visibility: 'public' | 'internal' | 'private';
  uploaded_by?: string;
  created_at: string;
}

export interface MediaAssignment {
  asset_id: string;
  building_id?: string;
  unit_id?: string;
  layout_id?: string;
  gallery_set_id?: string;
  is_cover: boolean;
  order_index: number;
  caption?: string;
  alt_text?: string;
  purpose?: string; // e.g., "lobby", "kitchen", "terrace"
}

// Public Content
export interface Inquiry {
  id: string;
  source: 'web' | 'tenant_gateway';
  category: 'general' | 'property' | 'owner_business';
  contact_info_hash: string; // Encrypted reference
  status: 'submitted' | 'routing_followup' | 'resolved';
  routing_destination?: string;
  created_at: string;
  resolved_at?: string;
}

// Audit/Historical Events
export interface HistoricalEvent {
  event_id: string;
  schema_version: number;
  timestamp: string;
  client_scope: string; // e.g., "teams"
  entity_type: 'building' | 'unit' | 'media' | 'content' | 'inquiry' | 'permission';
  entity_id: string;
  change_type: 
    | 'created' 
    | 'updated' 
    | 'published' 
    | 'archived' 
    | 'uploaded' 
    | 'assigned' 
    | 'permission_changed';
  actor_source?: string; // User ID or system event
  previous_values?: JSONObject;
  new_values?: JSONObject;
}

// Users & Roles (Internal)
export interface User {
  id: string;
  email: string;
  active_state: 'active' | 'suspended';
  created_at: string;
}

export interface Role {
  id: string;
  name: 'public' | 'tenant' | 'internal_manager' | 'maintenance' | 'vendor' | 'administrator';
  description: string;
  permissions: string[]; // JSON array of action scopes
}

export interface UserAssignment {
  user_id: string;
  role_id: string;
  scope_type: 'global' | 'property' | 'unit_specific';
  resource_ids?: string[]; // Array of building/unit IDs, or omitted for global
  granted_at: string;
}

export type PublicationState = 'draft' | 'internal_review' | 'published' | 'archived';
