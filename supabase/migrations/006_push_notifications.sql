-- =============================================================
-- Migration 006: Push notifications via pg_net
-- =============================================================

-- 1. Enable pg_net extension (HTTP requests from Postgres)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. Function that sends a push notification via Expo Push API
CREATE OR REPLACE FUNCTION public.send_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  push_token TEXT;
  payload JSONB;
BEGIN
  SELECT p.push_token INTO push_token
  FROM public.profiles p
  WHERE p.id = NEW.user_id;

  IF push_token IS NULL OR push_token = '' THEN
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'to', push_token,
    'title', NEW.title,
    'body', NEW.body,
    'sound', 'default',
    'channelId', 'default',
    'data', jsonb_build_object(
      'relatedEntityType', NEW.related_entity_type,
      'relatedEntityId', NEW.related_entity_id,
      'notificationId', NEW.id
    )
  );

  PERFORM net.http_post(
    url := 'https://exp.host/--/api/v2/push/send',
    body := payload,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Accept', 'application/json'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger on notifications insert
DROP TRIGGER IF EXISTS on_notification_send_push ON public.notifications;
CREATE TRIGGER on_notification_send_push
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_notification();
