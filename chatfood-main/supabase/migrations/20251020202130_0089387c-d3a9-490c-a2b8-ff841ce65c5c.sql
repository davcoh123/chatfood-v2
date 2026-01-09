-- 1) Align CHECK constraint with app statuses
ALTER TABLE public.support_tickets
  DROP CONSTRAINT IF EXISTS support_tickets_status_check;

ALTER TABLE public.support_tickets
  ADD CONSTRAINT support_tickets_status_check
  CHECK (
    status = ANY (ARRAY[
      'open',
      'in_progress',
      'resolved',
      'closed',
      'awaiting_admin',
      'awaiting_user',
      'awaiting_review'
    ]::text[])
  );

-- 2) Ensure updated_at is maintained on support_tickets
DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Update ticket last_message_at and status when a new message is inserted
DROP TRIGGER IF EXISTS trg_update_ticket_last_message ON public.ticket_messages;
CREATE TRIGGER trg_update_ticket_last_message
AFTER INSERT ON public.ticket_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_ticket_last_message();
