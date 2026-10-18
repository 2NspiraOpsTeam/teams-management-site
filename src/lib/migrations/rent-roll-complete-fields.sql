-- Source-only metadata. No leases, billing, identity or assignment changes.
ALTER TABLE operations_rent_roll_source ADD COLUMN move_in_date TEXT;
ALTER TABLE operations_rent_roll_source ADD COLUMN rentredi TEXT;
ALTER TABLE operations_rent_roll_source ADD COLUMN utility_reimbursement TEXT;
ALTER TABLE operations_rent_roll_source ADD COLUMN additional_notes TEXT;
