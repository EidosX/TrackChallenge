create type tc.poll_state as enum (
  'submissions', -- Can submit, not listen
  'votes',       -- Can listen and vote
  'ended',       -- Can no longer vote
  'published'    -- Can see results
);

create table tc.polls (
  poll_id serial primary key,
  name text not null,
  creator_id int not null references tc.users (user_id) on delete cascade,
  state tc.poll_state not null default 'submissions',
  votes_end timestamptz not null default now() + interval '5 minutes'
);

create table tc.participations (
  participation_id serial primary key,
  poll_id int references tc.polls (poll_id) on delete set null,
  user_id int not null references tc.users (user_id) on delete cascade,
  link text not null,
  title text not null,
  description text not null,
  unique (poll_id, user_id)
);

create table tc_priv.votes (
  poll_id int not null references tc.polls (poll_id) on delete cascade,
  voter_id int references tc.users (user_id) on delete set null,
  participation_id int not null references tc.participations (participation_id) on delete cascade,
  primary key (poll_id, voter_id)
);

-- used to identify participations when showing anonymous results
create table tc_priv.participation_hashs (
  participation_id int primary key references tc.participations (participation_id) on delete cascade,
  unique_hash text not null unique default md5(random()::text) 
);

create function tc.create_poll(_name text) returns tc.polls as $$
  insert into tc.polls (creator_id, name) 
  values (tc.get_my_id(), _name) 
  returning *;
$$ language sql volatile;

create function tc.delete_poll(_poll_id int) returns tc.polls as $$
declare
  _poll tc.polls;
  _current_user tc.users;
begin
  select * into _current_user from tc.get_my_user();
  select * into _poll from tc.polls where poll_id = _poll_id;
  if _poll.user_id <> _current_user.user_id and rank_value(_current_user.rank) < rank_value('admin') then
    raise exception 'You can''t delete this participation';
  end if;
  delete from tc.polls where poll_id = _poll.poll_id; 
  return _poll;
end
$$ language plpgsql volatile;


create function tc.create_participation(
  _poll_id int, _link text, _title text, _description text
) returns tc.participations as $$ 
declare
  _participation tc.participations;
begin
  insert into tc.participations (poll_id, user_id, link, title, description)
  values (_poll_id, tc.get_my_id(), _link, coalesce(_title, ''), coalesce(_description, ''))
  returning * into _participation;

  insert into tc_priv.participation_hashs (participation_id) 
  values (_participation.participation_id);
  return _participation;
end $$ language plpgsql volatile;

create function tc.delete_participation(_participation_id int) returns tc.participations as $$
declare
  _participation tc.participations;
  _current_user tc.users;
begin
  select * into _current_user from tc.get_my_user();
  select * into _participation from tc.participations 
  where participation_id = _participation_id;
  if _participation.user_id <> _current_user.user_id and rank_value(_current_user.rank) < rank_value('admin') then
    raise exception 'You can''t delete this participation';
  end if;
  delete from tc.participations where participation_id = _participation.participation_id;
  return _participation;
end
$$ language plpgsql volatile;

create function tc.vote_for(_participation_id int) returns tc_priv.votes as $$
declare
  _poll_id int;
  _res tc_priv.votes;
begin
  select poll_id into _poll_id from tc.participations 
  where participation_id = _participation_id;
  delete from tc_priv.votes where poll_id = _poll_id and voter_id = tc.get_my_id();
  insert into tc_priv.votes (poll_id, voter_id, participation_id) 
  values (_poll_id, tc.get_my_id(), _participation_id)
  returning * into _res;
  return _res;
end $$ language plpgsql volatile security definer;

create function tc.polls_anonymous_results(_poll tc.polls) returns table (
  unique_hash text,
  votes int
) as $$
  select unique_hash, coalesce(count(voter_id)::int, 0) as votes
  from tc_priv.participation_hashs 
  join tc.participations using (participation_id)
  left join tc_priv.votes using (participation_id)
  where participations.poll_id = _poll.poll_id
  group by unique_hash
  order by unique_hash;
$$ language sql stable security definer;

create function tc.participations_results(_participation tc.participations) returns int as $$
declare
  _current_user tc.users;
  _poll tc.polls;
begin
  select * into _poll from tc.polls where poll_id = _participation.poll_id;
  select * into _current_user from tc.get_my_user_or_null();
  if _poll.state <> 'published'
     and rank_value(_current_user.rank) < rank_value('admin')
     and coalesce(_poll.creator_id <> _current_user.user_id, true)
  then raise exception 'You are not allowed to see results yet'; end if;
  
  return (select coalesce(count(voter_id)::int, 0)
          from tc_priv.votes where participation_id = _participation.participation_id);
end
$$ language plpgsql stable security definer;

create function tc.participations_hash(_participation tc.participations) returns text as $$
declare
  _current_user tc.users;
  _poll tc.polls;
begin
  select * into _poll from tc.polls where poll_id = _participation.poll_id;
  select * into _current_user from tc.get_my_user_or_null();
  if _poll.state <> 'published'
     and rank_value(_current_user.rank) < rank_value('admin')
     and coalesce(_poll.creator_id <> _current_user.user_id, true)
  then raise exception 'You are not allowed to see hash-participation matchings yet'; end if;
  
  return (select unique_hash from tc_priv.participation_hashs 
          where participation_id = _participation.participation_id);
end
$$ language plpgsql stable security definer;

create function tc_priv.check_no_self_vote() returns trigger as $$
begin
  if NEW.voter_id = (select user_id from tc.participations where participation_id = NEW.participation_id) then
    raise exception 'Self vote';
  end if;
  return NEW;
end
$$ language plpgsql;

CREATE TRIGGER no_self_vote_trigger BEFORE INSERT OR UPDATE ON tc_priv.votes
FOR EACH ROW EXECUTE PROCEDURE tc_priv.check_no_self_vote();