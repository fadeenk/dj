-- ================================================
-- DJ REQUEST PLATFORM - INITIAL SCHEMA
-- ================================================
-- This migration creates all tables, policies, and triggers
-- needed for the DJ Request platform

-- ================================================
-- CUSTOM TYPES
-- ================================================

-- Request status enum
CREATE TYPE request_status AS ENUM ('pending', 'ready', 'played', 'ignored');

-- Feedback sentiment enum
CREATE TYPE feedback_sentiment AS ENUM ('positive', 'negative', 'neutral');

-- ================================================
-- TABLES
-- ================================================

-- DJS Table (Extends auth.users)
CREATE TABLE public.djs (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  avatar_url text,
  payment_links jsonb,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- EVENTS Table
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dj_id uuid NOT NULL REFERENCES public.djs(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  date timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- REQUESTS Table
CREATE TABLE public.requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_session_id text NOT NULL, -- Anonymous ID from localStorage
  user_name text,
  song_title text NOT NULL,
  song_artist text,
  youtube_url text,
  status request_status DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  upvotes int DEFAULT 0,
  user_comment text,
  PRIMARY KEY (id)
);

-- FEEDBACK Table
CREATE TABLE public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  message text,
  sentiment feedback_sentiment,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.djs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- ================================================
-- DJS POLICIES
-- ================================================

CREATE POLICY "Public djs are viewable by everyone"
  ON public.djs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own dj profile"
  ON public.djs FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own dj profile"
  ON public.djs FOR UPDATE
  USING (auth.uid() = id);

-- ================================================
-- EVENTS POLICIES
-- ================================================

CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "DJs can insert their own events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = dj_id);

CREATE POLICY "DJs can update their own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = dj_id);

CREATE POLICY "DJs can delete their own events"
  ON public.events FOR DELETE
  USING (auth.uid() = dj_id);

-- ================================================
-- REQUESTS POLICIES
-- ================================================

CREATE POLICY "Requests are viewable by everyone"
  ON public.requests FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create a request"
  ON public.requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "DJs can update requests for their events"
  ON public.requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE public.events.id = public.requests.event_id
      AND public.events.dj_id = auth.uid()
    )
  );

-- ================================================
-- FEEDBACK POLICIES
-- ================================================

CREATE POLICY "DJs can view feedback for their events"
  ON public.feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE public.events.id = public.feedback.event_id
      AND public.events.dj_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

-- ================================================
-- TRIGGERS & FUNCTIONS
-- ================================================

-- Auto-create DJ profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.djs (id, username, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
