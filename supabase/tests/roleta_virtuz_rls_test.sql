begin;
select plan(14);

select ok((select relrowsecurity from pg_class where oid = 'public.prizes'::regclass), 'RLS prizes');
select ok((select relrowsecurity from pg_class where oid = 'public.spins'::regclass), 'RLS spins');
select ok((select relrowsecurity from pg_class where oid = 'public.app_settings'::regclass), 'RLS settings');
select ok((select relrowsecurity from pg_class where oid = 'public.event_sessions'::regclass), 'RLS sessions');
select ok((select relrowsecurity from pg_class where oid = 'public.stock_adjustments'::regclass), 'RLS adjustments');
select ok(has_table_privilege('anon', 'public.prizes', 'SELECT'), 'anon can select prizes');
select ok(not has_table_privilege('anon', 'public.prizes', 'INSERT'), 'anon cannot insert prizes');
select ok(has_table_privilege('authenticated', 'public.prizes', 'INSERT'), 'authenticated role has insert grant, restricted by RLS');
select ok(has_function_privilege('anon', 'public.spin_wheel(uuid)', 'EXECUTE'), 'anon can execute safe spin RPC');

insert into public.prizes (id, name, color, initial_stock, current_stock, weight, active)
values ('00000000-0000-0000-0000-000000000101', 'Prêmio de teste', '#08C900', 1, 1, 1, true);

set local role anon;
select lives_ok(
  $$ select * from public.spin_wheel('00000000-0000-0000-0000-000000000201') $$,
  'public RPC performs a spin'
);
reset role;

select is((select current_stock from public.prizes where id = '00000000-0000-0000-0000-000000000101'), 0, 'spin decrements last unit');
select is((select count(*)::integer from public.spins where client_spin_id = '00000000-0000-0000-0000-000000000201'), 1, 'spin is recorded once');

set local role anon;
select lives_ok(
  $$ select * from public.spin_wheel('00000000-0000-0000-0000-000000000201') $$,
  'duplicate client id is idempotent'
);
reset role;

select is((select count(*)::integer from public.spins where client_spin_id = '00000000-0000-0000-0000-000000000201'), 1, 'duplicate call does not add another spin');

select * from finish();
rollback;
