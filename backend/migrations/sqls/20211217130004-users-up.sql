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
  twitch_id int not null unique,
  twitch_nickname text not null
);

create function tc_priv.upsert_twitch_user(
  _twitch_id int, _twitch_nickname text, _name text, _bio text)
returns tc.users as $$
declare
  _user tc.users;
  _user_id int;
begin
  select user_id into _user_id from tc.twitch_infos where twitch_id = _twitch_id;
  if _user_id is null then
    insert into tc.users (name, bio) values (_name, _bio)
    returning * into _user;
    insert into tc.twitch_infos (user_id, twitch_id, twitch_nickname)
    values (_user.user_id, _twitch_id, _twitch_nickname);
  else
    select into _user * from tc.users where user_id = _user_id;
    update tc.twitch_infos set twitch_nickname = _twitch_nickname
    where user_id = _user_id;
  end if;
  return _user;
end
$$ language plpgsql volatile;

create function tc.get_my_id() returns int as $$
  select current_setting('user.id', true)::int;
$$ language sql stable;
comment on function tc.get_my_id() is 'Returns the current user id. Useful for testing.';

create function tc.get_my_user() returns tc.users as $$
  select * from tc.users where user_id = tc.get_my_id();
$$ language sql stable;