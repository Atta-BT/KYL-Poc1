CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SEQUENCE IF NOT EXISTS service_request_no_seq START 1;

CREATE OR REPLACE FUNCTION next_service_request_no()
RETURNS text AS $$
  SELECT 'REQ-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('service_request_no_seq')::text, 4, '0');
$$ LANGUAGE SQL;

CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_no text NOT NULL UNIQUE DEFAULT next_service_request_no(),
  title text NOT NULL CHECK (char_length(trim(title)) > 0),
  request_type text NOT NULL CHECK (
    request_type IN (
      'บริการ Find Fulltext 4U',
      'บริการตรวจการคัดลอกผลงาน (iThenticate)',
      'บริการนำส่งหนังสือ (Book Delivery)'
    )
  ),
  requester_name text NOT NULL CHECK (char_length(trim(requester_name)) > 0),
  requester_email text NOT NULL CHECK (requester_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  detail text NOT NULL CHECK (char_length(trim(detail)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_service_requests_created_at
  ON service_requests (created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_service_requests_type
  ON service_requests (request_type)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_service_requests_search
  ON service_requests USING gin (
    to_tsvector(
      'simple',
      coalesce(request_no, '') || ' ' ||
      coalesce(title, '') || ' ' ||
      coalesce(requester_name, '') || ' ' ||
      coalesce(requester_email, '')
    )
  )
  WHERE deleted_at IS NULL;

CREATE OR REPLACE FUNCTION set_service_request_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_requests_updated_at ON service_requests;
CREATE TRIGGER service_requests_updated_at
BEFORE UPDATE ON service_requests
FOR EACH ROW
EXECUTE FUNCTION set_service_request_updated_at();

