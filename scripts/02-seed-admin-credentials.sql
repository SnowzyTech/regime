-- Seed admin credentials
-- Password: Admin@Regime123! (hashed with base64 for demo - use bcrypt in production)

INSERT INTO admin_credentials (email, password)
VALUES ('admin@regime.com', 'QWRtaW5AUmVnaW1lMTIzIQ==')
ON CONFLICT (email) DO NOTHING;
