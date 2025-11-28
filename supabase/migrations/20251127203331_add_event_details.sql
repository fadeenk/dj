-- Add event details fields
ALTER TABLE public.events
ADD COLUMN location text,
ADD COLUMN start_time time,
ADD COLUMN end_time time,
ADD COLUMN description text,
ADD COLUMN house_rules text;

COMMENT ON COLUMN public.events.location IS 'Venue location for the event';
COMMENT ON COLUMN public.events.start_time IS 'Event start time';
COMMENT ON COLUMN public.events.end_time IS 'Event end time';
COMMENT ON COLUMN public.events.description IS 'Event description/about section';
COMMENT ON COLUMN public.events.house_rules IS 'Event house rules as newline-separated text';
