create table tc_private.session (
  id text primary key,
  -- user_id is null while the user hasn't validated their twitch auth code
  user_id int references tc.user(id) default null,
  created timestamp not null default now(),
  duration interval not null
);

create function tc.session_user(session_id text) returns tc.user
as $$
declare
  sess tc_private.session;
  user tc.user;
begin
  select user_id into sess
  from tc_private.session 
  where id = nullif(session_id, '') and created + duration < now();
  select * into user from tc.user where id = sess.user_id;
  return user;
end
$$ language plpgsql stable security definer;
comment on function tc.session_user(text) is 'Returns the user associated with the session id. Returns null if the session doesn''t exist, isn''t validated yet or has expired';

create function tc.create_anonymous_session() returns text
as $$
declare
  session_id text;
begin
  insert into tc_private.session (id, duration) values (md5(random()::text), interval '10 minutes') 
  returning id into session_id;
  return session_id;
end
$$ language plpgsql volatile security definer;

create function tc_private.associate_session(
  session_id text, _twitch_name text, _twitch_id text
) returns tc.user as $$
declare
  user tc.user;
  _user_id int;
begin
  insert into tc.user (twitch_name, twitch_id, rank) 
  values (_twitch_name, _twitch_id, 'user')
  on conflict (twitch_id) do nothing;
  select * into user from tc.user where twitch_id = _twitch_id;

  update tc_private.session
  set (user_id, created, duration) = ("user".id, now(), interval '1 hour 30 minutes' )
  where id = nullif(session_id, '');
  return user;
end
$$ language plpgsql volatile;

create function tc_private.clear_expired_sessions() returns trigger
as $$  
begin
  delete from tc_private.session where created + duration < now();
  return new;
end;
$$ language plpgsql;

create trigger tc_private_clear_expired_sessions_T1 after insert on tc_private.session
execute procedure tc_private.clear_expired_sessions();