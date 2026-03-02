-- NJ Temporary Tag Supabase schema

create table if not exists services (
  id text primary key,
  title text not null,
  description text,
  price integer not null default 15000,
  image text,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  service_id text,
  service_title text,
  price integer,
  insurance_type text,
  insurance_company text,
  insurance_policy text,
  insurance_fee integer default 0,
  delivery_date text,
  delivery_time text,
  delivery_method text,
  delivery_email text,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  vin text,
  car_make_model text,
  color text,
  payment_status text default 'paid',
  details_complete boolean default false,
  telegram_sent boolean default false,
  telegram_recipients text,
  telegram_errors text,
  created_at timestamptz default now()
);

alter table orders add column if not exists delivery_email text;

create table if not exists activity (
  id uuid primary key default gen_random_uuid(),
  type text,
  payload jsonb,
  created_at timestamptz default now()
);

insert into services (id, title, description, price) values
  ('default', 'Standard Temp Tag', 'Same-day temporary vehicle tag. Email, driver, or mail delivery.', 15000)
on conflict (id) do nothing;
