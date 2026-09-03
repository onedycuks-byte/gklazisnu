CREATE POLICY "Penggalang upload foto proposal sendiri"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'program-images'
  AND (storage.foldername(name))[1] = 'proposals'
  AND (storage.foldername(name))[2] = auth.uid()::text
  AND EXISTS (
    SELECT 1
    FROM public.fundraiser_accounts fa
    WHERE fa.user_id = auth.uid()
      AND fa.status = 'approved'
  )
);