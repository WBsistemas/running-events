create table public.events (
  id uuid not null default gen_random_uuid (),
  title text not null,
  time text not null,
  location text not null,
  distance text not null,
  capacity integer not null,
  participants integer null default 0,
  description text not null,
  image_url text not null,
  registration_url text null,
  price text not null,
  event_type text not null,
  latitude double precision null,
  longitude double precision null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  date timestamp without time zone null,
  constraint events_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists events_location_idx on public.events using gin (to_tsvector('portuguese'::regconfig, location)) TABLESPACE pg_default;

create index IF not exists events_title_idx on public.events using gin (to_tsvector('portuguese'::regconfig, title)) TABLESPACE pg_default;

create index IF not exists events_description_idx on public.events using gin (to_tsvector('portuguese'::regconfig, description)) TABLESPACE pg_default;

create table public.users (
  id uuid not null,
  email text not null,
  name text null,
  role public.user_role not null default 'organizador'::user_role,
  phone text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_users_timestamp BEFORE
update on users for EACH row
execute FUNCTION update_modified_column ();

create trigger update_users_updated_at BEFORE
update on users for EACH row
execute FUNCTION update_updated_at_column ();