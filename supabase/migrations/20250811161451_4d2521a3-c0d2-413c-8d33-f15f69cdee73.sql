-- Add admin_id to live_chat_messages to track which admin responded
ALTER TABLE live_chat_messages ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES profiles(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_admin_id ON live_chat_messages(admin_id);

-- Add a function to detect links in text
CREATE OR REPLACE FUNCTION detect_links(text_content TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Replace URLs with clickable links
  RETURN regexp_replace(
    text_content,
    'https?://[^\s<>"]+',
    '<a href="\&" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">\&</a>',
    'g'
  );
END;
$$;