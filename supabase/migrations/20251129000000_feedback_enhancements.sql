-- ================================================
-- FEEDBACK ENHANCEMENTS
-- ================================================
-- Consolidates feedback schema updates, policies, and realtime

-- 1. Schema Updates
ALTER TABLE public.feedback
ADD COLUMN user_session_id text,
ADD COLUMN user_name text,
ADD COLUMN is_read boolean DEFAULT false;

-- 2. Indexes
CREATE INDEX idx_feedback_user_session ON public.feedback(user_session_id);
CREATE INDEX idx_feedback_is_read ON public.feedback(is_read);

-- 3. Policies
-- Allow DJs to update feedback (e.g. mark as read) for their events
CREATE POLICY "DJs can update feedback for their events"
  ON public.feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE public.events.id = public.feedback.event_id
      AND public.events.dj_id = auth.uid()
    )
  );

-- 4. Realtime
alter publication supabase_realtime add table feedback;
