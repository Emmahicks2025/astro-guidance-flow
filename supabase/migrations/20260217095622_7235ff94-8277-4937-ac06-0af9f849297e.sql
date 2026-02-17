
-- Allow authenticated users to upload to their own folder in provider-avatars
CREATE POLICY "Users can upload provider avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'provider-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update provider avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'provider-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete provider avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'provider-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
