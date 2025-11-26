-- Seed newsletter subscribers (optional initial data)
INSERT INTO newsletters (email)
VALUES 
  ('subscriber1@example.com'),
  ('subscriber2@example.com'),
  ('subscriber3@example.com')
ON CONFLICT (email) DO NOTHING;
