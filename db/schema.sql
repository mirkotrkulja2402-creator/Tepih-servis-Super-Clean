-- Super Clean: central PostgreSQL schema
create table if not exists app_settings(
  setting_key text primary key,
  setting_value jsonb not null default '{}'::jsonb
);

create table if not exists users(
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  display_name text not null,
  role text not null default 'user',
  password_hash text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists customers(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  city text,
  map_query text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists price_list(
  id bigserial primary key,
  name text not null,
  unit text not null,
  price numeric(12,2) not null default 0,
  category text,
  active boolean not null default true
);

create table if not exists orders(
  id uuid primary key default gen_random_uuid(),
  order_no integer not null,
  customer_id uuid references customers(id),
  customer_name text not null,
  address text,
  phone text,
  note text,
  map_query text,
  carpet_count integer default 0,
  order_date date not null default current_date,
  pickup_method text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists measurements(
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  carpet_no integer not null,
  item_name text,
  length_m numeric(10,2),
  width_m numeric(10,2),
  area_m2 numeric(12,2) generated always as (coalesce(length_m,0)*coalesce(width_m,0)) stored,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists invoices(
  id uuid primary key default gen_random_uuid(),
  invoice_no integer not null,
  order_id uuid references orders(id),
  customer_name text,
  invoice_date date not null default current_date,
  payment_method text,
  bank_due_date date,
  total numeric(12,2) not null default 0,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists invoice_items(
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete restrict,
  price_item_id bigint references price_list(id),
  item_name text not null,
  length_m numeric(10,2),
  width_m numeric(10,2),
  area_m2 numeric(12,2),
  quantity numeric(12,2) default 1,
  unit_price numeric(12,2) default 0,
  discount numeric(12,2) default 0
);

create table if not exists payments(
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete restrict,
  paid boolean not null default false,
  amount numeric(12,2) default 0,
  paid_at timestamptz,
  changed_by uuid references users(id)
);

create table if not exists vehicles(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  driver text,
  registration text,
  active boolean not null default true
);

create table if not exists route_assignments(
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id),
  order_id uuid references orders(id),
  invoice_id uuid references invoices(id),
  assigned_at timestamptz not null default now()
);

create table if not exists internal_gari(
  id uuid primary key default gen_random_uuid(),
  entry_name text not null default 'GARI',
  entry_date date not null default current_date,
  length_m numeric(10,2),
  width_m numeric(10,2),
  area_m2 numeric(12,2),
  price_per_m2 numeric(12,2),
  total numeric(12,2)
);

create table if not exists activity_log(
  id bigserial primary key,
  user_id uuid references users(id),
  action text not null,
  module text,
  document_id text,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create table if not exists permissions(
  id bigserial primary key,
  role text not null,
  module text not null,
  permission text not null,
  allowed boolean not null default false,
  unique(role,module,permission)
);

insert into app_settings(setting_key,setting_value)
values
('company','{"name":"Super Clean","subtitle":"TEPIH SERVIS","phone":"066 311 221","city":"Banja Luka"}'),
('deliveryPrice','5'),
('theme','"clean-blue"')
on conflict(setting_key) do nothing;
