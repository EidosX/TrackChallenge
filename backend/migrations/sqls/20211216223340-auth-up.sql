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
  insert into tc_private.session (id, duration) values (md5(random()::text), '10 minutes') 
  returning id into session_id;
  return session_id;
end
$$ language plpgsql volatile security definer;

create function tc_private.associate_session(
  session_id text, user_id int, long_live boolean) returns void
as $$
begin
  update tc_private.session 
  set user_id = user_id,
      created = now(),
      duration = case when long_live then '1 month' else '1 hour 30 minutes' end
  where id = nullif(session_id, '');
end
$$ language plpgsql volatile security definer;