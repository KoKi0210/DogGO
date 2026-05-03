CREATE OR REPLACE FUNCTION public.notify_walk_requested()
RETURNS trigger AS $$
DECLARE
  v_dog_name VARCHAR;
  v_owner_id UUID;
  v_walker_name VARCHAR;
BEGIN
  SELECT d.name, d.owner_id INTO v_dog_name, v_owner_id
  FROM public.dogs d WHERE d.id = NEW.dog_id;

  SELECT p.display_name INTO v_walker_name
  FROM public.profiles p WHERE p.id = NEW.walker_id;

  INSERT INTO public.notifications (user_id, type, title, body, related_entity_type, related_entity_id)
  VALUES (
    v_owner_id,
    'walk_requested',
    'Walk Request',
    v_walker_name || ' wants to walk ' || v_dog_name,
    'walk',
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_walk_requested
  AFTER INSERT ON public.walks
  FOR EACH ROW
  WHEN (NEW.status = 'requested')
  EXECUTE FUNCTION public.notify_walk_requested();
CREATE OR REPLACE FUNCTION public.notify_walk_status_change()
RETURNS trigger AS $$
DECLARE
  v_dog_name VARCHAR;
  v_owner_id UUID;
  v_notification_type VARCHAR;
  v_target_user UUID;
  v_title VARCHAR;
  v_body VARCHAR;
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;

  SELECT d.name, d.owner_id INTO v_dog_name, v_owner_id
  FROM public.dogs d WHERE d.id = NEW.dog_id;

  IF NEW.status = 'approved' THEN
    v_notification_type := 'walk_approved';
    v_target_user := NEW.walker_id;
    v_title := 'Walk Approved';
    v_body := 'Your walk with ' || v_dog_name || ' has been approved!';
  ELSIF NEW.status = 'active' THEN
    v_notification_type := 'walk_started';
    v_target_user := v_owner_id;
    v_title := 'Walk Started';
    v_body := v_dog_name || '''s walk has started';
  ELSIF NEW.status = 'completed' THEN
    v_notification_type := 'walk_completed';
    v_target_user := v_owner_id;
    v_title := 'Walk Completed';
    v_body := v_dog_name || '''s walk is complete! ' || COALESCE(NEW.points_earned::TEXT, '0') || ' points earned';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, related_entity_type, related_entity_id)
  VALUES (v_target_user, v_notification_type, v_title, v_body, 'walk', NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_walk_status_change
  AFTER UPDATE OF status ON public.walks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_walk_status_change();
CREATE OR REPLACE FUNCTION public.notify_adoption_requested()
RETURNS trigger AS $$
DECLARE
  v_dog_name VARCHAR;
  v_owner_id UUID;
  v_adopter_name VARCHAR;
BEGIN
  SELECT d.name, d.owner_id INTO v_dog_name, v_owner_id
  FROM public.dogs d WHERE d.id = NEW.dog_id;

  SELECT p.display_name INTO v_adopter_name
  FROM public.profiles p WHERE p.id = NEW.adopter_id;

  INSERT INTO public.notifications (user_id, type, title, body, related_entity_type, related_entity_id)
  VALUES (
    v_owner_id,
    'adoption_request',
    'Adoption Request',
    v_adopter_name || ' wants to adopt ' || v_dog_name,
    'adoption_request',
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_adoption_requested
  AFTER INSERT ON public.adoption_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_adoption_requested();

CREATE OR REPLACE FUNCTION public.notify_adoption_approved()
RETURNS trigger AS $$
DECLARE
  v_dog_name VARCHAR;
BEGIN
  IF OLD.status = NEW.status OR NEW.status != 'approved' THEN RETURN NEW; END IF;

  SELECT d.name INTO v_dog_name
  FROM public.dogs d WHERE d.id = NEW.dog_id;

  INSERT INTO public.notifications (user_id, type, title, body, related_entity_type, related_entity_id)
  VALUES (
    NEW.adopter_id,
    'adoption_approved',
    'Adoption Approved!',
    'Congratulations! Your request to adopt ' || v_dog_name || ' has been approved!',
    'adoption_request',
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_adoption_approved
  AFTER UPDATE OF status ON public.adoption_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_adoption_approved();
