-- Persistent public storage for portfolio CMS uploads.
-- Uploads are written server-side using the Supabase service-role key.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-uploads',
  'portfolio-uploads',
  true,
  15728640,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
