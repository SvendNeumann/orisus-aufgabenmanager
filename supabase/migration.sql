create extension if not exists pgcrypto;

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  display_name text not null,
  location_id uuid references locations(id),
  function_title text,
  role text check (role in ('employee','admin')) not null,
  pin_hash text not null,
  active boolean default true,
  failed_login_attempts integer default 0,
  locked_until timestamptz null,
  created_at timestamptz default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  area text,
  location_id uuid references locations(id),
  assigned_employee_id uuid references employees(id),
  interval_type text check (interval_type in ('daily','weekly','monthly','custom')) not null,
  due_time time null,
  due_weekday integer null,
  due_day_of_month integer null,
  proof_type text check (proof_type in ('none','photo','text','number')) not null,
  photo_required boolean default false,
  comment_required boolean default false,
  value_required boolean default false,
  value_unit text null,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists task_occurrences (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  occurrence_date date not null,
  assigned_employee_id uuid references employees(id),
  original_employee_id uuid references employees(id),
  status text check (status in ('open','completed','overdue','delegation_requested','delegated','rejected')) not null,
  due_at timestamptz null,
  completed_at timestamptz null,
  completed_by_employee_id uuid references employees(id) null,
  comment text null,
  value_text text null,
  value_number numeric null,
  photo_url text null,
  created_at timestamptz default now()
);

create table if not exists checklists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_id uuid references locations(id),
  interval_type text check (interval_type in ('daily','weekly','monthly','custom')) not null,
  due_time time null,
  due_weekday integer null,
  due_day_of_month integer null,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid references checklists(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer default 0,
  proof_type text check (proof_type in ('none','photo','text','number')) not null,
  photo_required boolean default false,
  comment_required boolean default false,
  value_required boolean default false,
  value_unit text null,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists checklist_occurrences (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid references checklists(id) on delete cascade,
  occurrence_date date not null,
  location_id uuid references locations(id),
  status text check (status in ('open','in_progress','completed','overdue')) not null,
  due_at timestamptz null,
  completed_at timestamptz null,
  completed_by_employee_id uuid references employees(id) null,
  created_at timestamptz default now()
);

create table if not exists checklist_item_completions (
  id uuid primary key default gen_random_uuid(),
  checklist_occurrence_id uuid references checklist_occurrences(id) on delete cascade,
  checklist_item_id uuid references checklist_items(id),
  completed_at timestamptz not null,
  completed_by_employee_id uuid references employees(id),
  comment text null,
  value_text text null,
  value_number numeric null,
  photo_url text null,
  created_at timestamptz default now(),
  unique (checklist_occurrence_id, checklist_item_id)
);

create table if not exists delegation_requests (
  id uuid primary key default gen_random_uuid(),
  task_occurrence_id uuid references task_occurrences(id) on delete cascade,
  requested_by_employee_id uuid references employees(id),
  requested_to_employee_id uuid references employees(id),
  status text check (status in ('pending','accepted','rejected','cancelled')) not null,
  comment text null,
  requested_at timestamptz default now(),
  responded_at timestamptz null
);

create table if not exists coverage_rules (
  id uuid primary key default gen_random_uuid(),
  original_employee_id uuid references employees(id),
  covering_employee_id uuid references employees(id),
  start_date date not null,
  end_date date not null,
  active boolean default true,
  created_by_employee_id uuid references employees(id),
  created_at timestamptz default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_employee_id uuid references employees(id),
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_task_occurrences_assigned on task_occurrences(assigned_employee_id, occurrence_date);
create index if not exists idx_task_occurrences_status on task_occurrences(status);
create index if not exists idx_checklist_occurrences_location on checklist_occurrences(location_id, occurrence_date);
create index if not exists idx_sessions_token on sessions(token_hash);

alter table locations enable row level security;
alter table employees enable row level security;
alter table sessions enable row level security;
alter table tasks enable row level security;
alter table task_occurrences enable row level security;
alter table checklists enable row level security;
alter table checklist_items enable row level security;
alter table checklist_occurrences enable row level security;
alter table checklist_item_completions enable row level security;
alter table delegation_requests enable row level security;
alter table coverage_rules enable row level security;
alter table audit_log enable row level security;

insert into storage.buckets (id, name, public)
values ('task-proofs', 'task-proofs', true)
on conflict (id) do nothing;
