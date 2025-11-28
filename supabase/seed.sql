-- Create the user
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '556a9ebb-3316-4081-9206-549ea17ebacb',
    'authenticated',
    'authenticated',
    'fadeekannah@gmail.com',
    crypt('test123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name": "Fadee Kannah", "avatar_url": ""}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Create the identity
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    '556a9ebb-3316-4081-9206-549ea17ebacb',
    '556a9ebb-3316-4081-9206-549ea17ebacb',
    format('{"sub":"%s","email":"%s"}', '556a9ebb-3316-4081-9206-549ea17ebacb', 'fadeekannah@gmail.com')::jsonb,
    'email',
    'fadeekannah@gmail.com',
    now(),
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;
