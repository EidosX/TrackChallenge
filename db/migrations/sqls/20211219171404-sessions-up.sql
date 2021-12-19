create table tc_priv.sessions (
  session_id text primary key default md5(random()::text),
  user_id int references tc.users (user_id) on delete cascade not null,
  created_at timestamptz not null default now(),
  expires_in interval not null default interval '2 months'
);

