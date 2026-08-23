-- ============================================================
-- 礼诚天下招商平台 - Supabase 数据库初始化脚本
-- 在 Supabase 控制台的 SQL Editor 里整段粘贴并 Run 一次即可
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- 管理员表 ----------
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  role text not null default 'staff' check (role in ('staff','super')),
  created_at timestamptz not null default now()
);

-- 默认超级管理员：admin / 123456（登录后请立刻在"账号设置"里修改密码）
insert into admins (username, password_hash, role)
values ('admin', crypt('123456', gen_salt('bf')), 'super')
on conflict (username) do nothing;

-- ---------- 招商 / 代理申请数据表 ----------
create table if not exists submissions (
  id bigint generated always as identity primary key,
  type text not null check (type in ('supplier','agent')),
  fields jsonb not null,
  status text not null default '待处理',
  created_at timestamptz not null default now()
);

-- ---------- 开启行级安全（RLS），默认所有人都读不到、改不了 ----------
alter table admins enable row level security;
alter table submissions enable row level security;

-- 前台表单：允许任何人新增一条申请记录，但不允许查看/修改别人的记录
drop policy if exists "public can submit" on submissions;
create policy "public can submit" on submissions
  for insert
  to anon
  with check (true);

-- admins 表：不给 anon 任何直接权限，所有访问都必须走下面的函数

-- ---------- 内部校验函数：核对账号密码，返回角色（不对外暴露） ----------
create or replace function verify_admin(p_username text, p_password text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  select a.role into v_role
  from admins a
  where a.username = p_username
    and a.password_hash = crypt(p_password, a.password_hash);
  return v_role;
end;
$$;
revoke all on function verify_admin(text,text) from public;

-- ---------- 登录 ----------
create or replace function login_admin(p_username text, p_password text)
returns table(username text, role text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select a.username, a.role
  from admins a
  where a.username = p_username
    and a.password_hash = crypt(p_password, a.password_hash);
end;
$$;
revoke all on function login_admin(text,text) from public;
grant execute on function login_admin(text,text) to anon;

-- ---------- 查看招商数据（任意已登录管理员可用） ----------
create or replace function list_submissions(p_username text, p_password text)
returns setof submissions
language plpgsql
security definer
set search_path = public
as $$
begin
  if verify_admin(p_username, p_password) is null then
    raise exception '未授权';
  end if;
  return query select * from submissions order by created_at desc;
end;
$$;
revoke all on function list_submissions(text,text) from public;
grant execute on function list_submissions(text,text) to anon;

-- ---------- 更新申请状态（任意已登录管理员可用） ----------
create or replace function update_submission_status(p_username text, p_password text, p_id bigint, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if verify_admin(p_username, p_password) is null then
    raise exception '未授权';
  end if;
  update submissions set status = p_status where id = p_id;
end;
$$;
revoke all on function update_submission_status(text,text,bigint,text) from public;
grant execute on function update_submission_status(text,text,bigint,text) to anon;

-- ---------- 修改自己的密码（任意已登录管理员可用） ----------
create or replace function change_password(p_username text, p_password text, p_new_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if verify_admin(p_username, p_password) is null then
    raise exception '当前密码错误';
  end if;
  update admins set password_hash = crypt(p_new_password, gen_salt('bf')) where username = p_username;
end;
$$;
revoke all on function change_password(text,text,text) from public;
grant execute on function change_password(text,text,text) to anon;

-- ---------- 以下三个函数仅限 role = 'super' 的账号使用 ----------
create or replace function list_admins(p_username text, p_password text)
returns table(username text, role text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if verify_admin(p_username, p_password) is distinct from 'super' then
    raise exception '未授权';
  end if;
  return query select a.username, a.role from admins a order by a.created_at;
end;
$$;
revoke all on function list_admins(text,text) from public;
grant execute on function list_admins(text,text) to anon;

create or replace function add_admin(p_username text, p_password text, p_new_username text, p_new_password text, p_new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if verify_admin(p_username, p_password) is distinct from 'super' then
    raise exception '未授权';
  end if;
  if p_new_role not in ('staff','super') then
    raise exception '无效角色';
  end if;
  insert into admins(username, password_hash, role)
  values (p_new_username, crypt(p_new_password, gen_salt('bf')), p_new_role);
end;
$$;
revoke all on function add_admin(text,text,text,text,text) from public;
grant execute on function add_admin(text,text,text,text,text) to anon;

create or replace function delete_admin(p_username text, p_password text, p_target_username text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if verify_admin(p_username, p_password) is distinct from 'super' then
    raise exception '未授权';
  end if;
  select count(*) into v_count from admins;
  if v_count <= 1 then
    raise exception '至少保留一个管理员账号';
  end if;
  delete from admins where username = p_target_username;
end;
$$;
revoke all on function delete_admin(text,text,text) from public;
grant execute on function delete_admin(text,text,text) to anon;
