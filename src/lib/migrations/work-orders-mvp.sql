-- Additive companion tables; preserves legacy requests, status CHECK and all history.
-- scheduled maps to tenant-facing In Progress; in_review maps to Under Review.
CREATE TABLE work_order_details (
 number INTEGER PRIMARY KEY AUTOINCREMENT,
 request_id TEXT NOT NULL UNIQUE REFERENCES tenant_maintenance_requests(id),
 permission_to_enter INTEGER CHECK(permission_to_enter IN (0,1)),
 access_instructions TEXT NOT NULL DEFAULT '',
 revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>=1),
 payload_hash TEXT NOT NULL DEFAULT '',
 completed_at TEXT
);
INSERT INTO work_order_details(request_id,completed_at)
 SELECT id,CASE WHEN status='completed' THEN updated_at ELSE NULL END FROM tenant_maintenance_requests ORDER BY submitted_at,id;
CREATE TABLE work_order_events (
 id TEXT PRIMARY KEY,
 request_id TEXT NOT NULL REFERENCES tenant_maintenance_requests(id),
 kind TEXT NOT NULL CHECK(kind IN ('submitted','status','update','internal')),
 visibility TEXT NOT NULL CHECK(visibility IN ('tenant','internal')),
 status TEXT,
 body TEXT NOT NULL DEFAULT '',
 payload_hash TEXT,
 actor_type TEXT NOT NULL CHECK(actor_type IN ('tenant','admin','system')),
 actor_id TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_work_order_events_request ON work_order_events(request_id,created_at);
-- Only reconstruct facts known from the legacy record, never invent intermediate history.
INSERT INTO work_order_events(id,request_id,kind,visibility,status,body,actor_type,actor_id,created_at)
 SELECT 'legacy-submitted-'||id,id,'submitted','tenant','submitted','Request received.','system','legacy',submitted_at FROM tenant_maintenance_requests;
INSERT INTO work_order_events(id,request_id,kind,visibility,status,body,actor_type,actor_id,created_at)
 SELECT 'legacy-current-'||id,id,'status','tenant',status,'Current status imported; earlier status history is unavailable.','system','legacy',updated_at FROM tenant_maintenance_requests WHERE status!='submitted';
CREATE TABLE work_order_photos (
 id TEXT PRIMARY KEY,
 request_id TEXT NOT NULL REFERENCES tenant_maintenance_requests(id),
 event_id TEXT NOT NULL REFERENCES work_order_events(id),
 mime TEXT NOT NULL CHECK(mime IN ('image/jpeg','image/png','image/webp')),
 bytes INTEGER NOT NULL CHECK(bytes BETWEEN 12 AND 650000),
 content_base64 TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_work_order_photos_request ON work_order_photos(request_id);
-- Shared outbox: channel boundary supports future transports without implementing SMS.
CREATE TABLE work_order_notifications (
 id TEXT PRIMARY KEY,
 request_id TEXT NOT NULL REFERENCES tenant_maintenance_requests(id),
 event_id TEXT NOT NULL REFERENCES work_order_events(id),
 audience TEXT NOT NULL CHECK(audience IN ('management','tenant')),
 channel TEXT NOT NULL DEFAULT 'email' CHECK(channel='email'),
 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','sent','failed','unknown')),
 attempts INTEGER NOT NULL DEFAULT 0,
 provider_id TEXT,
 error_code TEXT,
 last_attempt_at TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 UNIQUE(event_id,audience,channel)
);
CREATE INDEX idx_work_order_notifications_state ON work_order_notifications(state,created_at);
-- Keep the previous deployed application compatible during rollout or code rollback.
-- Its INSERT still receives a reference and submission timeline automatically.
CREATE TRIGGER work_order_request_created AFTER INSERT ON tenant_maintenance_requests BEGIN
 INSERT INTO work_order_details(request_id) VALUES (NEW.id);
 INSERT INTO work_order_events(id,request_id,kind,visibility,status,body,actor_type,actor_id,created_at)
 VALUES ('submitted-'||NEW.id,NEW.id,'submitted','tenant','submitted','','tenant',NEW.tenant_id,NEW.submitted_at);
END;
