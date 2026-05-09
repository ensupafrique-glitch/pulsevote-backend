create table if not exists magic_link_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_magic_link_tokens_email_created_at on magic_link_tokens(email, created_at desc);

create table if not exists auth_challenges (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  email text not null,
  challenge text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_auth_challenges_email_kind_created_at on auth_challenges(email, kind, created_at desc);

create table if not exists passkey_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  webauthn_user_id text not null,
  credential_id bytea not null unique,
  public_key bytea not null,
  counter integer not null default 0,
  transports jsonb not null default '[]'::jsonb,
  backed_up boolean not null default false,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_passkey_credentials_user_id_created_at on passkey_credentials(user_id, created_at desc);
