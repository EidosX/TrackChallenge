create table tc.polls (
  poll_id serial primary key,
  creator_id int not null references tc.users (user_id) on delete cascade,
  finished boolean not null default false
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

create function tc.create_poll() returns tc.polls as $$
  insert into tc.polls (creator_id) values (tc.get_my_id()) returning *;
$$ language sql volatile;

create function tc.delete_poll(_poll_id int) returns tc.polls as $$
declare
  _poll_user_id tc.participations;
  _current_user tc.users := tc.get_my_user();
begin
  select user_id into _poll_user_id from tc.participations 
  where poll_id = _poll_user_id;
  if _poll.user_id <> _current_user.id and _current_user.rank < 'admin' then
    raise exception 'You can''t delete this participation';
  end if;
  delete from tc.polls where poll_id = _poll_id; 
end
$$ language plpgsql volatile;


create function tc.create_participation(
  _poll_id int, _link text, _title text, _description text
) returns tc.participations as $$
  insert into tc.participations (poll_id, user_id, link, title, description)
  values (_poll_id, tc.get_my_id(), _link, coalesce(_title, ''), coalesce(_description, ''))
  returning *;
$$ language sql volatile;

create function tc.delete_participation(_participation_id int) returns tc.participations as $$
declare
  _participation_user_id tc.participations;
  _current_user tc.users := tc.get_my_user();
begin
  select user_id into _participation_user_id from tc.participations 
  where participation_id = _participation_id;
  if _participation.user_id <> _current_user.id and _current_user.rank < 'admin' then
    raise exception 'You can''t delete this participation';
  end if;
  delete from tc.participations where participation_id = _participation_id; 
end
$$ language plpgsql volatile;

create function tc.vote_for(_participation_id int) returns tc_priv.votes as $$
declare
  _poll_id int;
begin
  select poll_id into _poll_id from tc.participations 
  where participation_id = _participation_id;
  delete from tc_priv.votes where poll_id = _poll_id and voter_id = tc.get_my_id();
  insert into tc_priv.votes (poll_id, voter_id, participation_id) 
  values (_poll_id, tc.get_my_id(), participation_id)
  returning *;
end $$ language plpgsql volatile security definer;