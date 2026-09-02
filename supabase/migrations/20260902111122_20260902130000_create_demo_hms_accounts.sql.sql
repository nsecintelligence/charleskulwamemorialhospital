/*
# Create demo HMS accounts and assign roles

1. Purpose
- Creates 4 demo auth users for the Hospital Management System (admin, doctor, nurse, staff).
- Each user gets a corresponding role in the user_roles table.
- The existing admin user (nsecintelligence@gmail.com) also gets the admin role.

2. Accounts Created
- admin@ckmhospital.org / Admin123! — role: admin
- doctor@ckmhospital.org / Doctor123! — role: doctor
- nurse@ckmhospital.org / Nurse123! — role: nurse
- staff@ckmhospital.org / Staff123! — role: staff

3. Security
- All passwords are hashed using bcrypt via crypt() + gen_salt('bf').
- Email confirmation is set to now() so login works immediately.
- user_roles entries are inserted for all 5 users (including the existing admin).
*/

-- Insert demo users into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_sso_user
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  email,
  crypt(password, gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false
FROM (VALUES
  ('admin@ckmhospital.org', 'Admin123!'),
  ('doctor@ckmhospital.org', 'Doctor123!'),
  ('nurse@ckmhospital.org', 'Nurse123!'),
  ('staff@ckmhospital.org', 'Staff123!')
) AS t(email, password)
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = t.email
);

-- Insert identities (provider_id = user_id, email column is generated)
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  u.id,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
FROM auth.users u
WHERE u.email IN ('admin@ckmhospital.org', 'doctor@ckmhospital.org', 'nurse@ckmhospital.org', 'staff@ckmhospital.org')
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i WHERE i.user_id = u.id
  );

-- Assign roles for all demo users + existing admin
INSERT INTO user_roles (user_id, role)
SELECT u.id, r.role
FROM auth.users u
JOIN (VALUES
  ('admin@ckmhospital.org', 'admin'),
  ('doctor@ckmhospital.org', 'doctor'),
  ('nurse@ckmhospital.org', 'nurse'),
  ('staff@ckmhospital.org', 'staff'),
  ('nsecintelligence@gmail.com', 'admin')
) AS r(email, role) ON u.email = r.email
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id
);
