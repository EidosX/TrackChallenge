create type tc.rank as enum ('user', 'admin', 'dev');

create table tc.user (
  id serial primary key,
  display_name text check (display_name ~ '^[A-Za-z0-9._]{3,20}$'),
  twitch_name text not null,
  twitch_id text not null unique,
  rank tc.rank not null default 'user',
  created_at timestamp not null default now()
);