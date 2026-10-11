-- Allow portfolio video uploads alongside existing image and PDF media.
UPDATE storage.buckets
SET
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'application/pdf',
    'video/mp4',
    'video/webm'
  ]
WHERE id = 'portfolio-uploads';
