create function tc.new_poll(session_id text, name text) returns tc.poll
as $$
declare
  "user" tc.user;
  poll tc.poll;
begin
  select * into "user" from tc.session_user(session_id);
  if "user" is null then 
    raise exception 'You must be logged in to create a poll'; end if;
  if "user".rank <> 'admin' and "user".rank <> 'dev' then 
    raise exception 'You must be an admin or mod to create a poll'; end if;
  
  insert into tc.poll (name, creator_id) values (name, "user".id) returning * into poll;
  return poll;
end;
$$ language plpgsql volatile security definer;

create function tc.submit_participation(session_id text, poll_id int, link text, name text, description text) returns tc.participation
as $$
declare
  "user" tc.user;
  participation tc.participation;
  hash_key text;
begin
  select * into "user" from tc.session_user(session_id);
  if "user" is null then 
    raise exception 'You must be logged in to submit a participation'; end if;
  
  insert into tc.participation (poll_id, user_id, link, name, description) values (poll_id, "user".id, link, name, description) returning * into participation;
  insert into tc_private.participation_hash_key (participation_id, hash_key) values (participation.id, md5(random()::text));
  return participation;
end;
$$ language plpgsql volatile security definer;

create function tc.poll_results_anonymous(poll tc.poll) returns table (
  participation_hash text,
  votes bigint
) as $$
begin
  return query 
  select participation_hash_key.hash_key as participation_hash, count(voter_id) as votes
  from tc_private.participation_hash_key
  left join tc_private.vote using (participation_id)
  where poll_id = poll.id
  group by participation_hash_key.hash_key;
end
$$ language plpgsql stable security definer;

create function tc.poll_results(poll tc.poll, sessionId text) returns table (
  participation_id int,
  votes bigint
) as $$
declare
  "user" tc.user;
begin
  select * into "user" from tc.session_user(sessionId);
  if not poll.results_public and "user".id <> poll.creator_id
  and ("user" is null or ("user".rank <> 'admin' and "user".rank <> 'dev')) then 
    raise exception 'You cannot see the results until the poll is published';
  end if;

  return query
  select participation.id as participation_id, count(vote.voter_id) as votes
  from tc.participation participation
  left join tc_private.vote vote on vote.participation_id = participation.id
  where poll.id = participation.poll_id
  group by participation.id;
end
$$ language plpgsql stable security definer;