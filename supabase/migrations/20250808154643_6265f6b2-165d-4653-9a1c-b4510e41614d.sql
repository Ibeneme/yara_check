-- Add tracking_code column to existing report tables if not already present
ALTER TABLE persons ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;
ALTER TABLE household_items ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;
ALTER TABLE personal_belongings ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;
ALTER TABLE hacked_accounts ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;
ALTER TABLE business_reputation_reports ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;

-- Create an index on tracking_code for fast lookups
CREATE INDEX IF NOT EXISTS idx_persons_tracking_code ON persons(tracking_code);
CREATE INDEX IF NOT EXISTS idx_devices_tracking_code ON devices(tracking_code);
CREATE INDEX IF NOT EXISTS idx_vehicles_tracking_code ON vehicles(tracking_code);
CREATE INDEX IF NOT EXISTS idx_household_tracking_code ON household_items(tracking_code);
CREATE INDEX IF NOT EXISTS idx_personal_tracking_code ON personal_belongings(tracking_code);
CREATE INDEX IF NOT EXISTS idx_accounts_tracking_code ON hacked_accounts(tracking_code);
CREATE INDEX IF NOT EXISTS idx_reputation_tracking_code ON business_reputation_reports(tracking_code);