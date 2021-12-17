create type tc.rank as enum ('user', 'admin', 'dev');

create table tc.users (
  user_id serial primary key,
  name text not null check (name ~ '^[a-zA-Z0-9_]{3,20}$'),
  bio text not null default '',
  rank tc.rank not null default 'user',
  created_at timestamptz not null default now()
);

create table tc.twitch_infos (
  user_id int primary key references tc.users(user_id) on delete cascade,
  twitch_id int not null,
  twitch_nickname text not null
);