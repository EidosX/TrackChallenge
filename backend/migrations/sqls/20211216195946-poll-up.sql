create table tc.poll (
  id serial primary key,
  name text not null,
  creator_id int not null references tc.user(id) on delete cascade,
  created_at timestamp not null default now(),
  results_public boolean not null default false
);

create table tc.participation (
  id serial primary key,
  poll_id int references tc.poll(id) on delete set null,
  user_id int references tc.user(id) on delete cascade,
  link text not null,
  name text,
  description text,
  created_at timestamp not null default now()
);

-- We use this to hash participation ids when requesting anonymous results
create table tc_private.participation_hash_key (
  participation_id int references tc.participation(id) on delete cascade primary key,
  hash_key text not null
);

create table tc_private.vote (
  poll_id int not null references tc.poll(id) on delete cascade,
  -- it is okay not to delete cascade here, because a vote doesn't hold any
  -- information about the voter, so there are no privacy concerns.
  voter_id int references tc.user (id) on delete set null,
  participation_id int not null references tc.participation(id) on delete cascade,

  primary key (poll_id, voter_id)
);