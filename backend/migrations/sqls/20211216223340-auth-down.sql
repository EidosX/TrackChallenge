drop trigger tc_private_clear_expired_sessions_T1 on tc_private.session;
drop function tc_private.clear_expired_sessions;
drop function tc_private.associate_session;
drop function tc.create_anonymous_session;
drop function tc.session_user;
drop table tc_private.session;