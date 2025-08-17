-- Add status and resolved fields to live_chat_messages table
ALTER TABLE public.live_chat_messages 
ADD COLUMN status text DEFAULT 'active',
ADD COLUMN resolved_by uuid REFERENCES public.profiles(id),
ADD COLUMN resolved_at timestamp with time zone;