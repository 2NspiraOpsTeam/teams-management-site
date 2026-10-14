export const categories = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  "heating-cooling": "Heating / Cooling",
  appliance: "Appliances",
  "doors-windows-locks": "Doors / Windows / Locks",
  "pest-control": "Pest Control",
  general: "General Maintenance",
  other: "Other",
} as const;
export const statuses = {
  submitted: "Submitted",
  in_review: "Under Review",
  scheduled: "In Progress",
  completed: "Completed",
  closed: "Closed",
} as const;
export const statusDescriptions: Record<string, string> = {
  submitted: "Your request has been received.",
  in_review: "Management is reviewing your request.",
  scheduled: "Your maintenance request is being addressed.",
  completed: "The reported work has been completed.",
  closed: "Your request has been finalized.",
};
export type PhotoInput = { mime: string; data: string };
export type Order = {
  id: string;
  number: number;
  revision: number;
  category: string;
  description: string;
  status: string;
  submitted_at: string;
  updated_at: string;
  completed_at: string | null;
  property_name: string;
  unit_identifier: string;
  email?: string;
  display_name?: string;
  address_json?: string;
  permission_to_enter: number | null;
  access_instructions: string;
  preferred_contact: string;
  staff_notes?: string;
  building_id?: string;
};
export type Activity = {
  id: string;
  kind: string;
  status: string | null;
  body: string;
  actor_type: string;
  actor_id?: string;
  created_at: string;
  visibility: string;
};
export type Photo = { id: string; event_id: string; mime: string };
export type Detail = {
  request: Order;
  events: Activity[];
  photos: Photo[];
  notifications?: {
    id: string;
    state: string;
    audience: string;
    error_code: string | null;
    attempts: number;
  }[];
};
export function label(value: string, map: Record<string, string>) {
  return map[value] || value;
}
export function date(value: string) {
  return new Date(
    value.includes("T") ? value : value.replace(" ", "T") + "Z",
  ).toLocaleString();
}
export function address(value?: string) {
  try {
    const a = JSON.parse(value || "{}");
    return [
      a.street || a.street_address || a.address,
      a.city,
      a.state,
      a.zip || a.postal_code,
    ]
      .filter(Boolean)
      .join(", ");
  } catch {
    return "";
  }
}
