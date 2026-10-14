-- Additive lookup index: public inquiry throttling must not scan the entire private inbox.
CREATE INDEX IF NOT EXISTS idx_inquiries_source_contact_created ON inquiries(source, contact_info_hash, created_at);
