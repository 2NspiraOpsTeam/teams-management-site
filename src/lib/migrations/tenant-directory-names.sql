-- Additive optional staff-confirmed name components. Never split imported source names automatically.
-- tenant_accounts.display_name remains the shared display name; login email and IDs remain unchanged.
ALTER TABLE operations_tenants ADD COLUMN first_name TEXT;
ALTER TABLE operations_tenants ADD COLUMN last_name TEXT;
