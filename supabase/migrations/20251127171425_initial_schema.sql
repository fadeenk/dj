-- DJS Table (Extends auth.users)
create table public.djs (
  id uuid not null references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  payment_links jsonb,
  primary key (id)
);
alter table public.djs enable row level security;

create policy "Public djs are viewable by everyone."
  on public.djs for select
  using ( true );

create policy "Users can insert their own dj profile."
  on public.djs for insert
  with check ( auth.uid() = id );

create policy "Users can update own dj profile."
  on public.djs for update
  using ( auth.uid() = id );

-- EVENTS Table
create table public.events (
  id uuid not null default gen_random_uuid(),
  dj_id uuid not null references public.djs(id) on delete cascade,
  code text not null unique,
  name text not null,
  date timestamp with time zone not null,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  primary key (id)
);
alter table public.events enable row level security;

create policy "Events are viewable by everyone."
  on public.events for select
  using ( true );

create policy "DJs can insert their own events."
  on public.events for insert
  with check ( auth.uid() = dj_id );

create policy "DJs can update their own events."
  on public.events for update
  using ( auth.uid() = dj_id );

create policy "DJs can delete their own events."
  on public.events for delete
  using ( auth.uid() = dj_id );

-- REQUESTS Table
create type request_status as enum ('pending', 'ready', 'played', 'ignored');

create table public.requests (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_session_id text not null, -- Anonymous ID
  user_name text,
  song_title text not null,
  song_artist text,
  youtube_url text,
  status request_status default 'pending',
  created_at timestamp with time zone default now(),
  upvotes int default 0,
  user_comment text,
  primary key (id)
);
alter table public.requests enable row level security;

create policy "Requests are viewable by everyone."
  on public.requests for select
  using ( true );

create policy "Anyone can create a request."
  on public.requests for insert
  with check ( true );

create policy "DJs can update requests for their events."
  on public.requests for update
  using ( exists (
    select 1 from public.events
    where public.events.id = public.requests.event_id
    and public.events.dj_id = auth.uid()
  ));

-- FEEDBACK Table
create type feedback_sentiment as enum ('positive', 'negative', 'neutral');

create table public.feedback (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  message text,
  sentiment feedback_sentiment,
  created_at timestamp with time zone default now(),
  primary key (id)
);
alter table public.feedback enable row level security;

create policy "DJs can view feedback for their events."
  on public.feedback for select
  using ( exists (
    select 1 from public.events
    where public.events.id = public.feedback.event_id
    and public.events.dj_id = auth.uid()
  ));

create policy "Anyone can insert feedback."
  on public.feedback for insert
  with check ( true );
