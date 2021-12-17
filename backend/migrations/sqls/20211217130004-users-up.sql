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

create function tc_priv.upsert_twitch_user(
  _twitch_id int, _twitch_nickname text, _name text, _bio text)
returns tc.users as $$
declare
  _user_id int;
  _user tc.users;
begin
  if not exists (select 1 from tc.twitch_infos where twitch_id = _twitch_id) then
    insert into tc.users (name, bio) values (_name, _bio)
    returning user_id into _user_id;
    insert into tc.twitch_infos (user_id, twitch_id, twitch_nickname)
    values (_user_id, _twitch_id, _twitch_nickname);
  else
    update tc.twitch_infos set twitch_nickname = _twitch_nickname 
    where twitch_id = _twitch_id;
  end if;
  select * into _user from tc.users where user_id = _user_id;
  return _user;
end
$$ language plpgsql volatile;