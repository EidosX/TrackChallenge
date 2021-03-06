drop trigger no_self_vote_trigger ON tc_priv.votes;
drop function tc_priv.check_no_self_vote;
drop function tc.participations_hash;
drop function tc.participations_results;
drop function tc.polls_anonymous_results;
drop function tc.vote_for;
drop function tc.delete_participation;
drop function tc.create_participation;
drop function tc.delete_poll;
drop function tc.create_poll;
drop table tc_priv.participation_hashs;
drop table tc_priv.votes;
drop table tc.participations;
drop table tc.polls;
drop type tc.poll_state;