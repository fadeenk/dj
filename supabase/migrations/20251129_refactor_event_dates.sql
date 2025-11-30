-- Refactor event dates to use combined timestamptz
-- This migration replaces the separate date, start_time, and end_time columns
-- with combined start_time and end_time timestamptz columns.

-- 1. Add new columns
ALTER TABLE public.events
ADD COLUMN new_start_time timestamp with time zone,
ADD COLUMN new_end_time timestamp with time zone;

-- 2. Migrate existing data
-- We combine the 'date' and 'start_time'/'end_time' to create the timestamp.
-- We assume the stored date/time was intended to be in the server's timezone (or UTC if that's how it was stored).
-- Since the previous implementation was a bit ambiguous on timezone, we'll construct it as a timestamp without time zone first,
-- then cast to timestamptz (which assumes local server time, usually UTC in Supabase).

UPDATE public.events
SET
  new_start_time = (date + COALESCE(start_time, '00:00:00'::time))::timestamp at time zone 'UTC',
  new_end_time = (
    CASE
      WHEN COALESCE(end_time, '23:59:59'::time) < COALESCE(start_time, '00:00:00'::time) THEN (date + interval '1 day') + COALESCE(end_time, '23:59:59'::time)
      ELSE date + COALESCE(end_time, '23:59:59'::time)
    END
  )::timestamp at time zone 'UTC';

-- 3. Drop old columns
ALTER TABLE public.events
DROP COLUMN date,
DROP COLUMN start_time,
DROP COLUMN end_time;

-- 4. Rename new columns to match desired schema
ALTER TABLE public.events
RENAME COLUMN new_start_time TO start_time;

ALTER TABLE public.events
RENAME COLUMN new_end_time TO end_time;

-- 5. Add constraints/comments
ALTER TABLE public.events
ALTER COLUMN start_time SET NOT NULL;
-- end_time can be nullable if we want to allow open-ended events, but let's keep it consistent with previous schema if it was required.
-- Previous schema: date NOT NULL, start_time/end_time were nullable in the add_event_details migration but effectively used.
-- Let's make them nullable to be safe, or check requirements.
-- The user requirement implies "start and end should be stored", so let's keep them nullable for flexibility but the UI will enforce.

COMMENT ON COLUMN public.events.start_time IS 'Event start timestamp (UTC)';
COMMENT ON COLUMN public.events.end_time IS 'Event end timestamp (UTC)';
